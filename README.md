# nonlinear-analyzer

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

## Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

API docs: http://localhost:8000/docs
