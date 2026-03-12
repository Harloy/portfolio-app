import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useAuthStore from '../store/authStore'
import { getMyPortfolio } from '../api/portfolio'

const BLOCK_ICONS = { text: '📝', image: '🖼', video: '▶️', audio: '🎵', case: '📁', location: '📍' }

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
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">👤</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user?.name || 'Пользователь'}</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
            {user?.username && <p className="text-sm text-gray-400">@{user.username}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
