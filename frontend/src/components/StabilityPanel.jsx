import Plot from '../plotly'

const BADGE = {
  stable:       { bg: '#d3f9d8', color: '#2b8a3e' },
  unstable:     { bg: '#ffe3e3', color: '#c92a2a' },
  inconclusive: { bg: '#f1f3f5', color: '#495057' },
}

const s = {
  panel: {
    width: 268, minWidth: 268, padding: 16,
    background: '#f8f9fa', borderLeft: '1px solid #dee2e6',
    overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14,
  },
  title:   { margin: 0, fontSize: 14, fontWeight: 700, color: '#212529' },
  th:      { padding: '4px 6px', fontWeight: 600, color: '#495057', fontSize: 11 },
  td:      { padding: '5px 6px', fontFamily: 'monospace', fontSize: 11 },
  empty:   { fontSize: 13, color: '#adb5bd' },
  hr:      { border: 'none', borderTop: '1px solid #dee2e6', margin: '2px 0' },
  subhead: { margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: '#495057' },
}

function Badge({ stability }) {
  const b = BADGE[stability] ?? BADGE.inconclusive
  return (
    <span style={{
      display: 'inline-block', padding: '1px 7px', borderRadius: 10,
      fontSize: 10, fontWeight: 700, background: b.bg, color: b.color,
    }}>
      {stability}
    </span>
  )
}

export default function StabilityPanel({ result }) {
  if (!result) return (
    <div style={s.panel}>
      <h2 style={s.title}>Stability</h2>
      <p style={s.empty}>No results yet.</p>
    </div>
  )

  const { fixed_points, curves } = result

  return (
    <div style={s.panel}>
      <h2 style={s.title}>Stability</h2>

      {fixed_points.length === 0 ? (
        <p style={s.empty}>No fixed points found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #dee2e6' }}>
              <th style={{ ...s.th, textAlign: 'left' }}>x*</th>
              <th style={{ ...s.th, textAlign: 'right' }}>f′(x*)</th>
              <th style={{ ...s.th, textAlign: 'right' }}>τ</th>
              <th style={{ ...s.th, textAlign: 'center' }}>type</th>
            </tr>
          </thead>
          <tbody>
            {fixed_points.map((fp, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f3f5' }}>
                <td style={{ ...s.td, textAlign: 'left' }} title={`x* = ${fp.x_star}`}>
                  {fp.x_star_exact ?? fp.x_star.toFixed(4)}
                </td>
                <td style={{ ...s.td, textAlign: 'right' }}>
                  {fp.df_val.toFixed(4)}
                </td>
                <td style={{ ...s.td, textAlign: 'right' }}>
                  {isFinite(fp.tau) ? fp.tau.toFixed(3) : '∞'}
                </td>
                <td style={{ ...s.td, textAlign: 'center' }}>
                  <Badge stability={fp.stability} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr style={s.hr} />

      <div>
        <h3 style={s.subhead}>Potential V(x)</h3>
        <Plot
          data={[{
            x: curves.x_vals,
            y: curves.v_vals,
            type: 'scatter', mode: 'lines',
            line: { color: '#7950f2', width: 2 },
            showlegend: false,
          }]}
          layout={{
            height: 170,
            margin: { t: 8, r: 10, b: 38, l: 42 },
            plot_bgcolor: '#fff', paper_bgcolor: '#fff',
            xaxis: { title: 'x', gridcolor: '#f1f3f5', zeroline: false, tickfont: { size: 10 } },
            yaxis: { title: 'V', gridcolor: '#f1f3f5', tickfont: { size: 10 } },
          }}
          useResizeHandler
          style={{ width: '100%' }}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>

      {/* derivative expression */}
      <div style={{ fontSize: 11, color: '#868e96', fontFamily: 'monospace' }}>
        f′(x) = {result.df_expr}
      </div>
    </div>
  )
}
