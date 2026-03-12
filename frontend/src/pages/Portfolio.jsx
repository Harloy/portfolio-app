import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import BlockRenderer from '../components/blocks/BlockRenderer'
import useAuthStore from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function fetchPortfolio(id) {
  const res = await fetch(`${BASE_URL}/api/portfolio?id=${id}`)
  if (!res.ok) throw new Error('Не найдено')
  return res.json()
}

const CATEGORY_LABELS = {
  illustr: 'Художник',
  design:  'Дизайнер',
  photo:   'Фотограф',
  motion:  'Аниматор',
  music:   'Музыкант',
}

export default function Portfolio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => fetchPortfolio(id),
  })

  if (isLoading) return (
    <div className="text-center py-20 text-gray-400 text-sm">Загрузка...</div>
  )

  if (error) return (
    <div className="text-center py-20 text-gray-400 text-sm">Портфолио не найдено</div>
  )

  const isOwner = user && portfolio && String(portfolio.user_id) === String(user.id)

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* Шапка */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {portfolio.title || 'Без названия'}
          </h1>
          {portfolio.category && (
            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full self-start">
              {CATEGORY_LABELS[portfolio.category] || portfolio.category}
            </span>
          )}
          {portfolio.description && (
            <p className="text-sm text-gray-500 mt-1">{portfolio.description}</p>
          )}
        </div>

        {isOwner && (
          <button
            onClick={() => user?.username ? navigate(`/${user.username}`) : navigate("/my")}
            className="flex-shrink-0 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Изменить
          </button>
        )}
      </div>

      {/* Блоки */}
      <BlockRenderer blocks={portfolio.blocks} />

    </div>
  )
}
