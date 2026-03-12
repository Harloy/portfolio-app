const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function authHeaders() {
  const token = localStorage.getItem('token')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export async function getMyPortfolio() {
  const res = await fetch(`${BASE_URL}/api/portfolio/my`, { headers: authHeaders() })
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Ошибка загрузки')
  return res.json()
}

export async function savePortfolio(data) {
  const res = await fetch(`${BASE_URL}/api/portfolio`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Ошибка сохранения')
  return res.json()
}

export async function searchPortfolios(query = '', category = '') {
  const params = new URLSearchParams({ q: query, category })
  const res = await fetch(`${BASE_URL}/api/portfolio/search?${params}`)
  if (!res.ok) throw new Error('Ошибка поиска')
  return res.json()
}