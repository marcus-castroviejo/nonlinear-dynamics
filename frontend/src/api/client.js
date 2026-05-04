async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Unknown error')
  }
  return res.json()
}

export const fetchAnalysis   = (req) => post('/analyze',     req)
export const fetchSlopeField = (req) => post('/slope_field', req)
