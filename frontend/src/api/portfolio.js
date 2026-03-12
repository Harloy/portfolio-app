const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...opts.headers },
    ...opts,
  })
  if (!res.ok) throw new Error(await res.text())
  if (res.status === 204) return null
  return res.json()
}

export const getMyPortfolio     = ()         => req('/api/portfolio/my')
export const savePortfolio      = (data)     => req('/api/portfolio', { method: 'POST', body: JSON.stringify(data) })
export const getPortfolioByID   = (id)       => req(`/api/portfolio?id=${id}`)
export const getPortfolioByUser = (username) => req(`/api/portfolio/user?username=${username}`)
export const recordVisit        = (id)       => req(`/api/portfolio/visit?id=${id}`, { method: 'POST' })
export const getTagsByProfession = (cat)     => req(`/api/tags?category=${cat || ''}`)

export const getHomeData = (params = {}) => {
  const q = new URLSearchParams()
  if (params.city)     q.set('city',     params.city)
  if (params.category) q.set('category', params.category)
  if (params.tags)     q.set('tags',     params.tags)
  if (params.metro)    q.set('metro',    params.metro)
  if (params.sort)     q.set('sort',     params.sort)
  if (params.limit)    q.set('limit',    params.limit)
  return req(`/api/portfolio/home?${q}`)
}

export const searchPortfolios = (params) => {
  const q = new URLSearchParams()
  if (params.q)        q.set('q',        params.q)
  if (params.category) q.set('category', params.category)
  if (params.tags?.length) q.set('tags', params.tags.join(','))
  if (params.city)     q.set('city',     params.city)
  if (params.metro)    q.set('metro',    params.metro)
  return req(`/api/portfolio/search?${q}`)
}
