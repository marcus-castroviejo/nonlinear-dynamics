import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchAnalysis, fetchSlopeField } from '../api/client'

const DEFAULTS = {
  f_expr:    'r*x - x**3',
  g_expr:    'r*x',
  h_expr:    'x**3',
  g_enabled: false,
  h_enabled: false,
  r:         1.0,
  x_min:    -3.0,
  x_max:     3.0,
  n_points:  300,
  t_max:     10.0,
  n_t:       20,
  n_x:       20,
}

export function useAnalysis() {
  const [params, setParams]           = useState(DEFAULTS)
  const [ivps, setIvps]               = useState([])
  const [analysisResult, setAnalysis] = useState(null)
  const [slopeResult, setSlope]       = useState(null)
  const [loading, setLoading]         = useState(false)
  const [slopeLoading, setSlopeLoading] = useState(false)
  const [error, setError]             = useState(null)

  const analysisTimer = useRef(null)
  const slopeTimer    = useRef(null)

  const runAnalysis = useCallback(async (p) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAnalysis({
        f_expr:   p.f_expr,
        g_expr:   p.g_enabled ? p.g_expr : null,
        h_expr:   p.h_enabled ? p.h_expr : null,
        r:        p.r,
        x_min:    p.x_min,
        x_max:    p.x_max,
        n_points: p.n_points,
      })
      setAnalysis(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const runSlope = useCallback(async (p, currentIvps) => {
    setSlopeLoading(true)
    try {
      const result = await fetchSlopeField({
        f_expr: p.f_expr,
        r:      p.r,
        x_min:  p.x_min,
        x_max:  p.x_max,
        t_min:  0,
        t_max:  p.t_max,
        n_t:    p.n_t,
        n_x:    p.n_x,
        ivps:   currentIvps,
      })
      setSlope(result)
    } catch {
      // slope errors are secondary — don't override the main error message
    } finally {
      setSlopeLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(analysisTimer.current)
    analysisTimer.current = setTimeout(() => runAnalysis(params), 400)
    return () => clearTimeout(analysisTimer.current)
  }, [params, runAnalysis])

  useEffect(() => {
    clearTimeout(slopeTimer.current)
    slopeTimer.current = setTimeout(() => runSlope(params, ivps), 400)
    return () => clearTimeout(slopeTimer.current)
  }, [params, ivps, runSlope])

  const updateParam = (key, value) =>
    setParams(p => ({ ...p, [key]: value }))

  const addIvp   = (x0, t0 = 0) =>
    setIvps(prev => [...prev, { x0: +x0.toFixed(4), t0: +t0.toFixed(4) }])
  const clearIvps = () => setIvps([])

  return {
    params, updateParam,
    ivps, addIvp, clearIvps,
    analysisResult, slopeResult,
    loading, slopeLoading, error,
  }
}
