import Plot from '../plotly'

const C = {
  f: '#4263eb', g: '#2f9e44', h: '#e67700',
  zero: '#ced4da', stable: '#2f9e44', unstable: '#e03131',
  inconclusive: '#868e96', intersection: '#ae3ec9',
  flowPos: '#74c0fc', flowNeg: '#ff8787',
}

const LAYOUT_BASE = {
  margin: { t: 36, r: 16, b: 44, l: 52 },
  plot_bgcolor: '#fff', paper_bgcolor: '#fff',
  xaxis: { title: 'x', gridcolor: '#f1f3f5', zeroline: false },
  yaxis: { title: 'f (x)', gridcolor: '#f1f3f5', zeroline: true, zerolinecolor: '#dee2e6' },
  legend: { font: { size: 11 }, bgcolor: 'rgba(255,255,255,0.8)' },
  hovermode: 'closest',
  title: { text: 'Phase Portrait', font: { size: 13 }, x: 0.5 },
}

function flowArrows(xVals, fVals) {
  const step = Math.max(1, Math.floor(xVals.length / 28))
  const ax = [], ay = [], sym = [], col = []
  for (let i = step; i < xVals.length - step; i += step) {
    const f = fVals[i]
    if (f == null || isNaN(f) || Math.abs(f) < 0.015) continue
    ax.push(xVals[i]); ay.push(0)
    sym.push(f > 0 ? 'triangle-right' : 'triangle-left')
    col.push(f > 0 ? C.flowPos : C.flowNeg)
  }
  return { ax, ay, sym, col }
}

export default function PhasePortrait({ result, params }) {
  if (!result) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ced4da', fontSize: 13 }}>
      Waiting for analysis…
    </div>
  )

  const { curves, fixed_points, intersections } = result
  const { x_vals, f_vals, g_vals, h_vals } = curves
  const traces = []

  // main curve f(x)
  traces.push({
    x: x_vals, y: f_vals, type: 'scatter', mode: 'lines',
    name: `f(x) = ${params.f_expr}`,
    line: { color: C.f, width: 2.5 },
  })

  // optional g and h
  if (g_vals) traces.push({
    x: x_vals, y: g_vals, type: 'scatter', mode: 'lines',
    name: `g(x) = ${params.g_expr}`,
    line: { color: C.g, width: 2, dash: 'dash' },
  })
  if (h_vals) traces.push({
    x: x_vals, y: h_vals, type: 'scatter', mode: 'lines',
    name: `h(x) = ${params.h_expr}`,
    line: { color: C.h, width: 2, dash: 'dash' },
  })

  // y = 0 reference line
  traces.push({
    x: [params.x_min, params.x_max], y: [0, 0],
    type: 'scatter', mode: 'lines', showlegend: false,
    line: { color: C.zero, width: 1, dash: 'dot' },
    hoverinfo: 'skip',
  })

  // flow direction arrows on x-axis
  const { ax, ay, sym, col } = flowArrows(x_vals, f_vals)
  if (ax.length) traces.push({
    x: ax, y: ay, type: 'scatter', mode: 'markers',
    name: 'flow', showlegend: false, hoverinfo: 'skip',
    marker: { symbol: sym, color: col, size: 9 },
  })

  // fixed points — group by stability
  const groups = { stable: [], unstable: [], inconclusive: [] }
  for (const fp of fixed_points) groups[fp.stability]?.push(fp)

  const fpTrace = (pts, symbol, color, name) => ({
    x: pts.map(fp => fp.x_star),
    y: pts.map(() => 0),
    type: 'scatter', mode: 'markers', name,
    text: pts.map(fp =>
      `x* = ${fp.x_star.toFixed(4)}<br>` +
      `exact: ${fp.x_star_exact ?? '—'}<br>` +
      `f′ = ${fp.df_val.toFixed(4)}<br>` +
      `τ = ${isFinite(fp.tau) ? fp.tau.toFixed(4) : '∞'}`
    ),
    hovertemplate: '%{text}<extra></extra>',
    marker: { symbol, color, size: 13, line: { width: 2.5, color } },
  })

  if (groups.stable.length)
    traces.push(fpTrace(groups.stable, 'circle', C.stable, 'stable'))
  if (groups.unstable.length)
    traces.push(fpTrace(groups.unstable, 'circle-open', C.unstable, 'unstable'))
  if (groups.inconclusive.length)
    traces.push(fpTrace(groups.inconclusive, 'circle-open', C.inconclusive, 'inconclusive'))

  // g ∩ h intersections
  if (intersections?.length) traces.push({
    x: intersections.map(i => i.x),
    y: intersections.map(i => i.y),
    type: 'scatter', mode: 'markers', name: 'g = h',
    hovertemplate: 'x=%{x:.4f}, y=%{y:.4f}<extra>g=h</extra>',
    marker: { symbol: 'star', color: C.intersection, size: 13 },
  })

  return (
    <Plot
      data={traces}
      layout={LAYOUT_BASE}
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
      config={{ displayModeBar: false, responsive: true }}
    />
  )
}
