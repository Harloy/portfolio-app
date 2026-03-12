import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from '../store/authStore'
import { getMyPortfolio } from '../api/portfolio'

const BLOCK_ICONS = { text: '📝', image: '🖼', video: '▶️', audio: '🎵', case: '📁' }

export default function My() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['my-portfolio'],
    queryFn: getMyPortfolio,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user?.name || 'Пользователь'}</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/editor')}
          className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Изменить
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        {isLoading ? (
          <p className="text-gray-400 text-sm text-center py-8">Загрузка...</p>
        ) : portfolio ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{portfolio.title || 'Без названия'}</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                {portfolio.category || 'Без категории'}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {portfolio.blocks?.length > 0 ? (
                portfolio.blocks.map(block => (
                  <div key={block.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span>{BLOCK_ICONS[block.type] || '📄'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{block.label}</p>
                      <p className="text-xs text-gray-400">{block.type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Блоков пока нет</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-4xl">📂</p>
            <p className="text-gray-500 text-sm">Портфолио пока пустое</p>
            <button
              onClick={() => navigate('/editor?setup=true')}
              className="mt-2 border border-gray-200 text-gray-700 px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              + Создать портфолио
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
