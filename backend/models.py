# models.py — Pydantic schemas para validação de request/response
# Todos os tipos que trafegam entre React e FastAPI são definidos aqui.
# O FastAPI usa esses modelos para validar automaticamente o JSON recebido
# e para gerar a documentação em /docs.

from pydantic import BaseModel
from typing import Optional


# ── Requests ──────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    # Strings das equações digitadas pelo usuário no EquationPanel.
    # O backend vai parsear com sympy.sympify().
    f_expr: str               # ex: "r*x - x**3"
    g_expr: Optional[str]     # ex: "r*x"       — None se toggle desligado
    h_expr: Optional[str]     # ex: "x**3"      — None se toggle desligado

    # Valor atual do parâmetro r (vem do slider)
    r: float = 1.0

    # Domínio de x para avaliar as curvas
    x_min: float = -3.0
    x_max: float  = 3.0

    # Número de pontos para amostrar as curvas (resolução do plot)
    n_points: int = 400


class SlopeFieldRequest(BaseModel):
    f_expr: str
    r: float = 1.0

    # Domínio espacial
    x_min: float = -2.5
    x_max: float  = 2.5

    # Domínio temporal
    t_min: float = 0.0
    t_max: float = 10.0

    # Resolução do grid de traços (n_t × n_x segmentos)
    n_t: int = 25
    n_x: int = 20

    # Lista de condições iniciais enviadas pelo usuário
    # Cada IVP é um dict {"x0": float, "t0": float}
    ivps: list[dict] = []


# ── Responses ─────────────────────────────────────────────────────────────────

class FixedPoint(BaseModel):
    # Localização e análise de um único ponto fixo
    x_star: float             # valor numérico de x*
    x_star_exact: Optional[str]   # forma simbólica, ex: "sqrt(r)" — None se não encontrado

    df_val: float             # f'(x*) numérico
    df_expr: str              # f'(x) simbólico completo, ex: "r - 3*x**2"

    tau: float                # tempo característico = 1/|f'(x*)|

    # "stable" | "unstable" | "half-stable" | "inconclusive"
    stability: str

    # Tipo do ponto no potencial V(x)
    # "local_min" | "local_max" | "inconclusive"
    potential_type: str


class Curves(BaseModel):
    # Arrays de pontos para plotar — mesma grade de x para todas as curvas
    x_vals: list[float]
    f_vals: list[float]
    g_vals: Optional[list[float]]   # None se g não foi fornecido
    h_vals: Optional[list[float]]   # None se h não foi fornecido
    v_vals: list[float]             # potencial V(x) = -∫f dx


class Intersection(BaseModel):
    # Um ponto onde g(x) = h(x) — corresponde a um zero de f(x)
    x: float
    y: float    # valor de g(x) = h(x) nesse ponto


class AnalyzeResponse(BaseModel):
    # Expressões simbólicas como strings (para exibir no StabilityPanel)
    f_expr_parsed: str        # f(x) como sympy entendeu — confirma o parse
    df_expr: str              # f'(x) simbólico completo
    v_expr: str               # V(x) simbólico completo

    curves: Curves
    fixed_points: list[FixedPoint]
    intersections: list[Intersection]   # vazio se g ou h não fornecidos


class Trajectory(BaseModel):
    # Uma trajetória integrada a partir de uma condição inicial
    x0: float
    t0: float
    t_arr: list[float]
    x_arr: list[float]


class SlopeGridPoint(BaseModel):
    # Um ponto do grid com sua inclinação — para desenhar os traços
    t: float
    x: float
    slope: float   # f(x) avaliado nesse ponto — é a inclinação dx/dt


class SlopeFieldResponse(BaseModel):
    slope_grid: list[SlopeGridPoint]
    trajectories: list[Trajectory]
