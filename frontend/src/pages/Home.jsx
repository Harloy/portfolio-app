import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import SpecialistCard from '../components/SpecialistCard'
import { searchPortfolios } from '../api/portfolio'

const CATEGORIES = [
  { id: '',         label: 'Все' },
  { id: 'illustr',  label: 'Художники' },
  { id: 'design',   label: 'Дизайнеры' },
  { id: 'photo',    label: 'Фотографы' },
  { id: 'motion',   label: 'Аниматоры' },
]

export default function Home() {
  const [category, setCategory] = useState('')
  const [search, setSearch]     = useState('')

  const { data: portfolios = [] } = useQuery({
    queryKey: ['portfolios', search, category],
    queryFn:  () => searchPortfolios(search, category),
  })

  // Делим на три группы
  const top    = [...portfolios].sort((a, b) => b.score - a.score).slice(0, 6)
  const newest = [...portfolios].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6)
  const nearby = portfolios.slice(0, 6) // пока без геолокации

  return (
    <div className="flex flex-col gap-6">

      {/* Категории */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${category === cat.id
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Поиск */}
      <input
        type="text"
        placeholder="Поиск по названию или описанию..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors"
      />

      {portfolios.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          Портфолио пока нет — будь первым!
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">

          <section className="flex flex-col gap-3">
            <h2 className="font-bold text-gray-900">Лучшие</h2>
            {top.map(p => <PortfolioCard key={p.id} portfolio={p} />)}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-bold text-gray-900">Рядом</h2>
            {nearby.map(p => <PortfolioCard key={p.id} portfolio={p} />)}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-bold text-gray-900">Новые</h2>
            {newest.map(p => <PortfolioCard key={p.id} portfolio={p} />)}
          </section>

        </div>
      )}
    </div>
  )
}

// Временная карточка пока не подключим реальные данные пользователя
import { useNavigate } from "react-router-dom"

function PortfolioCard({ portfolio }) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(`/portfolio/${portfolio.id}`)} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm text-gray-900">{portfolio.title || 'Без названия'}</p>
        <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
          {portfolio.category || '—'}
        </span>
      </div>
      <p className="text-xs text-gray-400">{portfolio.description || 'Без описания'}</p>
    </div>
  )
}