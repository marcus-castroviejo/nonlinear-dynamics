# solver.py — geração do slope field e integração de IVPs
#
# Responsabilidades:
#   1. Montar o grid de traços (slope marks) para o campo de direções
#   2. Integrar cada condição inicial com scipy.integrate.solve_ivp (RK45)

import numpy as np
from scipy.integrate import solve_ivp
from models import (
    SlopeFieldRequest, SlopeFieldResponse,
    SlopeGridPoint, Trajectory
)
from analyzer import parse_expr, make_numpy_func


def compute_slope_grid(f_num, req: SlopeFieldRequest) -> list[SlopeGridPoint]:
    """
    Gera os pontos do grid onde serão desenhados os traços de inclinação.
    Em sistemas autônomos ẋ = f(x), a inclinação não depende de t —
    mas mantemos o grid 2D (t, x) para compatibilidade com o Slope Field.

    # TODO:
    #   - Criar arrays t_vals = np.linspace(req.t_min, req.t_max, req.n_t)
    #                           x_vals = np.linspace(req.x_min, req.x_max, req.n_x)
    #   - Para cada par (t_i, x_j): calcular slope = float(f_num(x_j))
    #   - Retornar lista de SlopeGridPoint(t=t_i, x=x_j, slope=slope)
    #   - Tratar valores muito grandes (|slope| > 1e6): substituir por np.nan
    #     para não distorcer os traços no frontend
    """
    raise NotImplementedError


def integrate_ivp(f_num, ivp: dict, req: SlopeFieldRequest) -> Trajectory:
    """
    Integra uma condição inicial usando solve_ivp com método RK45.

    # TODO:
    #   - Extrair x0 = ivp["x0"], t0 = ivp["t0"]
    #   - Definir ode = lambda t, y: [f_num(y[0])]
    #     (solve_ivp espera sistemas, então y é vetor)
    #   - Chamar solve_ivp(
    #         ode,
    #         t_span=(t0, req.t_max),
    #         y0=[x0],
    #         method='RK45',
    #         dense_output=False,
    #         max_step=0.05,          # resolução suficiente para plot suave
    #         events=None
    #     )
    #   - Extrair t_arr = sol.t.tolist(), x_arr = sol.y[0].tolist()
    #   - Tratar divergência: se qualquer |x| > req.x_max * 3, truncar aí
    #   - Retornar Trajectory(x0=x0, t0=t0, t_arr=t_arr, x_arr=x_arr)
    """
    raise NotImplementedError


def solve_slope_field(req: SlopeFieldRequest) -> SlopeFieldResponse:
    """
    Função principal do solver — orquestra grid + IVPs.

    # TODO:
    #   1. parse_expr(req.f_expr) → sym_f
    #   2. make_numpy_func(sym_f, req.r) → f_num
    #   3. compute_slope_grid(f_num, req) → slope_grid
    #   4. Para cada ivp em req.ivps: integrate_ivp(f_num, ivp, req) → Trajectory
    #   5. Retornar SlopeFieldResponse(slope_grid=..., trajectories=...)
    """
    raise NotImplementedError
