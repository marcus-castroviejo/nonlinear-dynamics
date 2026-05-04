# analyzer.py — núcleo matemático do /analyze
#
# Responsabilidades:
#   1. Parsear strings de equação com sympy
#   2. Diferenciar simbolicamente
#   3. Encontrar pontos fixos numericamente (scipy) e tentar analiticamente (sympy)
#   4. Classificar estabilidade via f'(x*)
#   5. Calcular potencial V(x)
#   6. Amostrar curvas f, g, h, V num grid de x
#   7. Encontrar interseções g(x) = h(x)

import numpy as np
import sympy as sp
from scipy import optimize
from models import (
    AnalyzeRequest, AnalyzeResponse,
    Curves, FixedPoint, Intersection
)


# Símbolos globais — usados em todos os parses simbólicos
x, r = sp.symbols('x r')


def parse_expr(expr_str: str) -> sp.Expr:
    """
    Converte uma string digitada pelo usuário em expressão sympy.
    """
    normalized = expr_str.replace("^", "**")
    try:
        return sp.sympify(normalized, locals={"x": x, "r": r, "e": sp.E})
    except sp.SympifyError:
        raise ValueError(f"Expressão inválida: '{expr_str}'")


def make_numpy_func(sym_expr: sp.Expr, r_val: float):
    """
    Converte uma expressão sympy em função Python f(x_array) → array numpy.
    Substitui o símbolo r pelo valor numérico r_val.
    """
    expr_sub = sym_expr.subs(r, r_val)
    return sp.lambdify(x, expr_sub, modules="numpy")


def find_fixed_points(f_num, x_min: float, x_max: float) -> list[float]:
    """
    Encontra numericamente os zeros de f(x) no intervalo [x_min, x_max].
    Estratégia: varredura + bisseção em cada intervalo onde há mudança de sinal.
    """
    grid = np.linspace(x_min, x_max, 1000)
    vals = np.broadcast_to(np.asarray(f_num(grid), dtype=float), grid.shape)

    signs = np.sign(vals)
    zeros = []
    for i in range(len(grid) - 1):
        if np.isnan(vals[i]) or np.isnan(vals[i + 1]):
            continue
        if signs[i] == 0:
            zeros.append(float(grid[i]))
        elif signs[i] != signs[i + 1] and signs[i + 1] != 0:
            root = optimize.brentq(f_num, grid[i], grid[i + 1], xtol=1e-10)
            zeros.append(root)
    if not np.isnan(vals[-1]) and signs[-1] == 0:
        zeros.append(float(grid[-1]))

    # desduplicar zeros muito próximos
    deduped = []
    for z in sorted(zeros):
        if not deduped or abs(z - deduped[-1]) > 1e-6:
            deduped.append(z)

    return deduped


def find_fixed_points_symbolic(sym_f: sp.Expr, r_val: float) -> dict[float, str]:
    """
    Tenta resolver f(x) = 0 analiticamente com sympy.
    Retorna dict {x_star_numeric: "expressão_exata"}.
    """
    try:
        sym_f_sub = sym_f.subs(r, sp.nsimplify(r_val))
        roots = sp.solve(sym_f_sub, x)
    except Exception:
        return {}

    result = {}
    for root in roots:
        # ignora raízes complexas
        if not root.is_real:
            continue
        x_num = float(root.evalf())
        result[x_num] = str(sp.simplify(root))

    return result


def classify_fixed_point(df_val: float) -> tuple[str, str]:
    """
    Classifica o ponto fixo e seu tipo no potencial com base em f'(x*).
    """
    if df_val < -1e-10:
        return "stable", "local_min"
    if df_val > 1e-10:
        return "unstable", "local_max"
    return "inconclusive", "inconclusive"


def compute_potential(sym_f: sp.Expr, r_val: float) -> tuple[sp.Expr, callable]:
    """
    Calcula V(x) = -∫f(x)dx simbolicamente e retorna expressão + função numpy.
    """
    sym_f_sub = sym_f.subs(r, sp.nsimplify(r_val))
    v_sym = sp.simplify(-sp.integrate(sym_f_sub, x))
    if v_sym.has(sp.Integral):
        raise ValueError("Não foi possível integrar f(x) simbolicamente para obter V(x).")
    try:
        v_num = sp.lambdify(x, v_sym, modules="numpy")
    except Exception:
        raise ValueError("V(x) contém funções especiais sem suporte numérico pelo NumPy.")
    return v_sym, v_num


def find_intersections(g_num, h_num, x_min: float, x_max: float) -> list[Intersection]:
    """
    Encontra pontos onde g(x) = h(x), i.e., zeros de g(x) - h(x).
    """
    diff_num = lambda xv: g_num(xv) - h_num(xv)
    x_zeros = find_fixed_points(diff_num, x_min, x_max)
    return [Intersection(x=xi, y=float(g_num(xi))) for xi in x_zeros]


def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    """
    Função principal — orquestra toda a análise e monta o AnalyzeResponse.
    """
    # 1-2. parse e derivada simbólica
    sym_f = parse_expr(req.f_expr)
    sym_df = sp.diff(sym_f, x)

    # 3-4. funções numpy
    f_num  = make_numpy_func(sym_f,  req.r)
    df_num = make_numpy_func(sym_df, req.r)

    # 5. potencial
    v_sym, v_num = compute_potential(sym_f, req.r)

    # 6-7. grid e curvas principais
    x_vals = np.linspace(req.x_min, req.x_max, req.n_points)
    f_vals = np.broadcast_to(np.asarray(f_num(x_vals), dtype=float), x_vals.shape).tolist()
    v_vals = np.broadcast_to(np.asarray(v_num(x_vals), dtype=float), x_vals.shape).tolist()

    # 8-9. curvas opcionais g e h
    g_num_fn = h_num_fn = None
    g_vals = h_vals = None
    if req.g_expr:
        g_num_fn = make_numpy_func(parse_expr(req.g_expr), req.r)
        g_vals = np.broadcast_to(np.asarray(g_num_fn(x_vals), dtype=float), x_vals.shape).tolist()
    if req.h_expr:
        h_num_fn = make_numpy_func(parse_expr(req.h_expr), req.r)
        h_vals = np.broadcast_to(np.asarray(h_num_fn(x_vals), dtype=float), x_vals.shape).tolist()

    # 10-11. pontos fixos
    x_stars   = find_fixed_points(f_num, req.x_min, req.x_max)
    exact_map = find_fixed_points_symbolic(sym_f, req.r)

    # 12. classificar cada ponto fixo
    df_expr_str = str(sym_df)
    fixed_points = []
    for xs in x_stars:
        df_val     = float(df_num(xs))
        stability, pot_type = classify_fixed_point(df_val)
        tau        = 1.0 / abs(df_val) if abs(df_val) > 1e-10 else float("inf")
        # busca expressão exata pelo ponto numérico mais próximo no mapa
        x_exact = next(
            (expr for xk, expr in exact_map.items() if abs(xk - xs) < 1e-6),
            None
        )
        fixed_points.append(FixedPoint(
            x_star=xs,
            x_star_exact=x_exact,
            df_val=df_val,
            df_expr=df_expr_str,
            tau=tau,
            stability=stability,
            potential_type=pot_type,
        ))

    # 13. interseções g ∩ h
    intersections = []
    if g_num_fn and h_num_fn:
        intersections = find_intersections(g_num_fn, h_num_fn, req.x_min, req.x_max)

    # 14. montar resposta
    return AnalyzeResponse(
        f_expr_parsed=str(sym_f),
        df_expr=df_expr_str,
        v_expr=str(v_sym),
        curves=Curves(
            x_vals=x_vals.tolist(),
            f_vals=f_vals,
            g_vals=g_vals,
            h_vals=h_vals,
            v_vals=v_vals,
        ),
        fixed_points=fixed_points,
        intersections=intersections,
    )
