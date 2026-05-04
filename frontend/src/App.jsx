import { useAnalysis } from './hooks/useAnalysis'
import EquationPanel  from './components/EquationPanel'
import PhasePortrait  from './components/PhasePortrait'
import SlopeField     from './components/SlopeField'
import StabilityPanel from './components/StabilityPanel'

export default function App() {
  const {
    params, updateParam,
    ivps, addIvp, clearIvps,
    analysisResult, slopeResult,
    loading, slopeLoading, error,
  } = useAnalysis()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff' }}>
      <header style={{
        padding: '9px 20px',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#212529' }}>
          Nonlinear Dynamics Analyzer
        </h1>
        <span style={{ fontSize: 12, color: '#adb5bd' }}>ẋ = f(x, r)</span>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <EquationPanel
          params={params}
          updateParam={updateParam}
          result={analysisResult}
          error={error}
          loading={loading}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ flex: 1, minHeight: 0, borderBottom: '1px solid #dee2e6' }}>
            <PhasePortrait result={analysisResult} params={params} />
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <SlopeField
              result={slopeResult}
              params={params}
              ivps={ivps}
              addIvp={addIvp}
              clearIvps={clearIvps}
              loading={slopeLoading}
            />
          </div>
        </div>

        <StabilityPanel result={analysisResult} params={params} />
      </div>
    </div>
  )
}
