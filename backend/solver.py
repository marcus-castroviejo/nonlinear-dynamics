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
    """
    t_vals = np.linspace(req.t_min, req.t_max, req.n_t)
    x_vals = np.linspace(req.x_min, req.x_max, req.n_x)

    slopes = np.broadcast_to(
        np.asarray(f_num(x_vals), dtype=float),
        (req.n_t, req.n_x),
    )

    points = []
    for i, t in enumerate(t_vals):
        for j, xv in enumerate(x_vals):
            slope = slopes[i, j]
            if abs(slope) > 1e6:
                slope = float("nan")
            points.append(SlopeGridPoint(t=float(t), x=float(xv), slope=slope))

    return points


def integrate_ivp(f_num, ivp: dict, req: SlopeFieldRequest) -> Trajectory:
    """
    Integra uma condição inicial usando solve_ivp com método RK45.
    """
    x0 = ivp["x0"]
    t0 = ivp["t0"]
    limit = abs(req.x_max) * 3

    def ode(_t, y):
        return [f_num(y[0])]

    def diverged(_t, y):
        return abs(y[0]) - limit
    diverged.terminal  = True
    diverged.direction = 1

    sol = solve_ivp(
        ode,
        t_span=(t0, req.t_max),
        y0=[x0],
        method="RK45",
        dense_output=False,
        max_step=0.05,
        events=diverged,
    )

    return Trajectory(
        x0=x0,
        t0=t0,
        t_arr=sol.t.tolist(),
        x_arr=sol.y[0].tolist(),
    )


def solve_slope_field(req: SlopeFieldRequest) -> SlopeFieldResponse:
    """
    Função principal do solver — orquestra grid + IVPs.
    """
    sym_f = parse_expr(req.f_expr)
    f_num = make_numpy_func(sym_f, req.r)

    slope_grid   = compute_slope_grid(f_num, req)
    trajectories = [integrate_ivp(f_num, ivp, req) for ivp in req.ivps]

    return SlopeFieldResponse(slope_grid=slope_grid, trajectories=trajectories)
