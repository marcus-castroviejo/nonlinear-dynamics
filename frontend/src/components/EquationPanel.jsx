const s = {
  panel: {
    width: 272, minWidth: 272, padding: 16,
    background: '#f8f9fa', borderRight: '1px solid #dee2e6',
    overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14,
  },
  title:   { margin: 0, fontSize: 14, fontWeight: 700, color: '#212529' },
  label:   { display: 'block', fontSize: 12, color: '#495057', marginBottom: 3 },
  input:   {
    width: '100%', padding: '5px 8px', border: '1px solid #ced4da',
    borderRadius: 4, fontSize: 13, fontFamily: 'monospace',
  },
  row:     { display: 'flex', alignItems: 'center', gap: 6 },
  section: { display: 'flex', flexDirection: 'column', gap: 5 },
  parsed:  { fontSize: 11, color: '#868e96', fontFamily: 'monospace' },
  error:   {
    background: '#fff3cd', border: '1px solid #ffc107',
    borderRadius: 4, padding: '7px 10px', fontSize: 12, color: '#856404',
  },
  hr: { border: 'none', borderTop: '1px solid #dee2e6', margin: '2px 0' },
  rNum: {
    width: 62, padding: '4px 6px', border: '1px solid #ced4da',
    borderRadius: 4, fontSize: 13, textAlign: 'right',
  },
  slider:  { width: '100%', accentColor: '#4263eb', cursor: 'pointer' },
  domRow:  { display: 'flex', gap: 8 },
  domIn:   {
    flex: 1, padding: '5px 6px', border: '1px solid #ced4da',
    borderRadius: 4, fontSize: 13, textAlign: 'center',
  },
}

export default function EquationPanel({ params, updateParam, result, error, loading }) {
  return (
    <div style={s.panel}>
      <h2 style={s.title}>Equations</h2>

      {error && <div style={s.error}>{error}</div>}

      {/* f(x) */}
      <div style={s.section}>
        <label style={s.label}>ẋ = f(x, r)</label>
        <input
          style={s.input}
          value={params.f_expr}
          onChange={e => updateParam('f_expr', e.target.value)}
          spellCheck={false}
        />
        {result && <span style={s.parsed}>→ {result.f_expr_parsed}</span>}
      </div>

      {/* g(x) */}
      <div style={s.section}>
        <div style={s.row}>
          <input
            type="checkbox"
            checked={params.g_enabled}
            onChange={e => updateParam('g_enabled', e.target.checked)}
            style={{ accentColor: '#2f9e44', cursor: 'pointer' }}
          />
          <label style={{ ...s.label, margin: 0 }}>g(x) — left side</label>
        </div>
        <input
          style={{ ...s.input, opacity: params.g_enabled ? 1 : 0.4 }}
          value={params.g_expr}
          disabled={!params.g_enabled}
          onChange={e => updateParam('g_expr', e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* h(x) */}
      <div style={s.section}>
        <div style={s.row}>
          <input
            type="checkbox"
            checked={params.h_enabled}
            onChange={e => updateParam('h_enabled', e.target.checked)}
            style={{ accentColor: '#e67700', cursor: 'pointer' }}
          />
          <label style={{ ...s.label, margin: 0 }}>h(x) — right side</label>
        </div>
        <input
          style={{ ...s.input, opacity: params.h_enabled ? 1 : 0.4 }}
          value={params.h_expr}
          disabled={!params.h_enabled}
          onChange={e => updateParam('h_expr', e.target.value)}
          spellCheck={false}
        />
      </div>

      <hr style={s.hr} />

      {/* r parameter */}
      <div style={s.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ ...s.label, margin: 0 }}>Parameter r</label>
          <input
            type="number"
            style={s.rNum}
            step={0.1}
            value={params.r}
            onChange={e => updateParam('r', parseFloat(e.target.value) || 0)}
          />
        </div>
        <input
          type="range"
          style={s.slider}
          min={-3} max={3} step={0.05}
          value={params.r}
          onChange={e => updateParam('r', parseFloat(e.target.value))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#adb5bd' }}>
          <span>−3</span><span>0</span><span>3</span>
        </div>
      </div>

      <hr style={s.hr} />

      {/* x domain */}
      <div style={s.section}>
        <label style={s.label}>x domain</label>
        <div style={s.domRow}>
          <input
            type="number" step={0.5} style={s.domIn}
            value={params.x_min}
            onChange={e => updateParam('x_min', parseFloat(e.target.value) || -3)}
            placeholder="min"
          />
          <span style={{ alignSelf: 'center', color: '#adb5bd', fontSize: 12 }}>to</span>
          <input
            type="number" step={0.5} style={s.domIn}
            value={params.x_max}
            onChange={e => updateParam('x_max', parseFloat(e.target.value) || 3)}
            placeholder="max"
          />
        </div>
      </div>

      {/* symbolic summary */}
      {result && (
        <>
          <hr style={s.hr} />
          <div style={s.section}>
            <label style={s.label}>Symbolic</label>
            <span style={s.parsed}>f′(x) = {result.df_expr}</span>
            <span style={s.parsed}>V(x)  = {result.v_expr}</span>
          </div>
        </>
      )}

      {loading && (
        <div style={{ fontSize: 11, color: '#adb5bd', textAlign: 'center' }}>computing…</div>
      )}
    </div>
  )
}
