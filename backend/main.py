# main.py — FastAPI app e definição das rotas
#
# Para rodar:
#   uvicorn main:app --reload --port 8000
#
# Documentação automática disponível em:
#   http://localhost:8000/docs   (Swagger UI)
#   http://localhost:8000/redoc

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import AnalyzeRequest, AnalyzeResponse, SlopeFieldRequest, SlopeFieldResponse
from analyzer import analyze
from solver import solve_slope_field

app = FastAPI(
    title="Nonlinear Analyzer API",
    description="Backend para análise de sistemas não lineares 1D",
    version="0.1.0"
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Permite que o frontend React (localhost:5173) chame a API durante dev.
# Em produção: restringir origins para o domínio real.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    # TODO: pode expandir para checar se sympy/scipy estão importáveis
    return {"status": "ok"}


# ── /analyze ──────────────────────────────────────────────────────────────────

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_route(req: AnalyzeRequest):
    """
    Recebe as equações e parâmetros, retorna curvas + pontos fixos + estabilidade.

    # TODO:
    #   - Chamar analyze(req) de analyzer.py
    #   - Capturar ValueError (parse inválido) e levantar HTTPException(400)
    #   - Capturar exceções genéricas e levantar HTTPException(500)
    #   - Retornar o AnalyzeResponse diretamente (FastAPI serializa para JSON)
    """
    raise NotImplementedError


# ── /slope_field ───────────────────────────────────────────────────────────────

@app.post("/slope_field", response_model=SlopeFieldResponse)
def slope_field_route(req: SlopeFieldRequest):
    """
    Recebe a equação + IVPs, retorna o grid de traços e as trajetórias integradas.

    # TODO:
    #   - Chamar solve_slope_field(req) de solver.py
    #   - Mesma estrutura de tratamento de erro do /analyze
    #   - Retornar SlopeFieldResponse
    """
    raise NotImplementedError
