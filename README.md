# Nonlinear Dynamics Analyzer

Software interativo para estudo e análise de sistemas não lineares 1D.

Desenvolvido como ferramenta de estudo acompanhando
*Nonlinear Dynamics and Chaos* — Strogatz.

## Estrutura
```
nonlinear-analyzer/
├── backend/
│   ├── main.py          ← FastAPI app, rotas /analyze e /slope_field
│   ├── analyzer.py      ← sympy + scipy: parse, fixed points, estabilidade
│   ├── solver.py        ← solve_ivp: slope field + IVPs
│   ├── models.py        ← Pydantic schemas (request/response)
│   └── requirements.txt
│
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx              ← layout, estado global
        ├── api/
        │   └── client.js        ← fetch para /analyze e /slope_field
        ├── components/
        │   ├── EquationPanel.jsx
        │   ├── PhasePortrait.jsx
        │   ├── SlopeField.jsx
        │   └── StabilityPanel.jsx
        └── hooks/
            └── useAnalysis.js   ← debounce + chamada à API
```

## Funcionalidades
- Phase Portrait com pontos fixos e campo de fluxo
- Decomposição f(x) = g(x) + h(x) com interseções
- Slope Field com trajetórias IVP
- Análise de estabilidade: simbólica (sympy) + numérica (scipy)

## Stack
- Backend: FastAPI + sympy + scipy
- Frontend: React + Plotly.js

## Setup
### Backend
```bash
conda activate nonlinear-analyzer
cd backend
uvicorn main:app --reload --port 8000
```
### Frontend
```bash
cd frontend
npm install && npm run dev
```