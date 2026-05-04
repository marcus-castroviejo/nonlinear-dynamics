import { useRef } from 'react'
import Plot from '../plotly'

function makeMarks(grid, tMin, tMax, xMin, xMax, nT, nX) {
  const tRange = tMax - tMin
  const xRange = xMax - xMin
  const ts = [], xs = []

  for (const { t, x, slope } of grid) {
    if (slope == null || isNaN(slope)) continue
    // normalize direction (1, slope) in display-space coordinates
    const sNorm = slope * tRange / xRange   // slope in normalized t/x space
    const mag   = Math.sqrt(1 + sNorm * sNorm)
    const L     = 0.38 / (nT - 1)          // 38% of normalized grid spacing
    const ht    = (L / mag) * tRange        // back to data coords
    const hx    = (L * sNorm / mag) * xRange
    ts.push(t - ht, t + ht, null)
    xs.push(x - hx, x + hx, null)
  }
  return { ts, xs }
}

export default function SlopeField({ result, params, ivps, addIvp, clearIvps, loading }) {
  const plotRef = useRef(null)
  const traces  = []

  if (result) {
    const { slope_grid, trajectories } = result
    const { ts, xs } = makeMarks(
      slope_grid, 0, params.t_max,
      params.x_min, params.x_max,
      params.n_t, params.n_x,
    )

    traces.push({
      x: ts, y: xs, type: 'scatter', mode: 'lines',
      name: 'field', showlegend: false, hoverinfo: 'skip',
      line: { color: '#adb5bd', width: 1.2 },
    })

    trajectories.forEach((traj) => {
      traces.push({
        x: traj.t_arr, y: traj.x_arr,
        type: 'scatter', mode: 'lines',
        showlegend: false,
        line: { color: '#4263eb', width: 2 },
        hovertemplate: 't=%{x:.3f}, x=%{y:.4f}<extra></extra>',
      })
    })

    if (ivps.length) traces.push({
      x: ivps.map(v => v.t0),
      y: ivps.map(v => v.x0),
      type: 'scatter', mode: 'markers',
      name: 'IVPs', showlegend: false,
      hovertemplate: 't₀=%{x}, x₀=%{y}<extra>IVP</extra>',
      marker: { color: '#e03131', size: 8, symbol: 'circle' },
    })
  }

  const layout = {
    margin: { t: 36, r: 16, b: 44, l: 52 },
    plot_bgcolor: '#fff', paper_bgcolor: '#fff',
    xaxis: { title: 't', gridcolor: '#f1f3f5', range: [0, params.t_max] },
    yaxis: { title: 'x (t)', gridcolor: '#f1f3f5', range: [params.x_min, params.x_max] },
    hovermode: 'closest',
    title: { text: 'Slope Field — click to add trajectory', font: { size: 13 }, x: 0.5 },
  }

  // Convert a click pixel position to (t, x) data coordinates via Plotly internals
  const handleDivClick = (e) => {
    const plotEl = plotRef.current?.el
    if (!plotEl?._fullLayout) return
    const fl   = plotEl._fullLayout
    const rect = plotEl.getBoundingClientRect()
    const px   = e.clientX - rect.left  - fl.margin.l
    const py   = e.clientY - rect.top   - fl.margin.t
    const pw   = fl.width  - fl.margin.l - fl.margin.r
    const ph   = fl.height - fl.margin.t - fl.margin.b
    if (px < 0 || px > pw || py < 0 || py > ph) return
    const [t0, t1] = fl.xaxis.range
    const [x0, x1] = fl.yaxis.range
    const t = t0 + (px / pw) * (t1 - t0)
    const x = x1 + (py / ph) * (x0 - x1)   // y-axis is inverted in pixels
    addIvp(x, t)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, minHeight: 0, cursor: 'crosshair' }} onClick={handleDivClick}>
        <Plot
          ref={plotRef}
          data={traces}
          layout={layout}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>

      <div style={{
        padding: '5px 12px', borderTop: '1px solid #dee2e6',
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 12, color: '#495057', flexShrink: 0,
      }}>
        <span>{ivps.length} trajectory{ivps.length !== 1 ? 's' : ''}</span>
        {ivps.length > 0 && (
          <button
            onClick={clearIvps}
            style={{
              padding: '2px 10px', background: '#fff',
              border: '1px solid #ced4da', borderRadius: 4,
              cursor: 'pointer', fontSize: 12,
            }}
          >
            Clear
          </button>
        )}
        {loading && <span style={{ color: '#adb5bd' }}>integrating…</span>}
        <span style={{ marginLeft: 'auto', color: '#ced4da' }}>Click anywhere to add IVP</span>
      </div>
    </div>
  )
}
