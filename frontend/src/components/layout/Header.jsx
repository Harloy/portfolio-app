
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

    function goToPortfolio() {
    if (user?.username) navigate(`/${user.username}`)
  }


  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">

        <Link to="/" className="text-xl font-bold text-gray-900">
          Портфолио
        </Link>

        <nav className="flex gap-6 items-center">

          {user ? (
            <div className="flex items-center gap-3">
               <Link
                to={`/${user.username}`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Портик
              </Link>
              <Link
                to="/my"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {user.name || user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Выйти
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              Войти
            </Link>
          )}
        </nav>

      </div>
    </header>
  )
}