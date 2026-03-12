import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { register, login } from '../api/auth'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm]       = useState({ email: '', password: '', name: '', username: '' })
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate  = useNavigate()
  const { setAuth } = useAuthStore()

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      let data
      if (isLogin) {
        data = await login(form.email, form.password)
        setAuth({ id: data.id, name: data.name, email: form.email, username: data.username }, data.token)
        navigate('/my')
      } else {
        data = await register(form.name, form.email, form.password, form.username)
        setAuth({ id: data.id, name: data.name, email: form.email, username: data.username }, data.token)
        navigate(`/${data.username}`)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-6">
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${isLogin ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
          Войти
        </button>
        <button onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${!isLogin ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
          Зарегистрироваться
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {!isLogin && (
          <>
            <input placeholder="Ваше имя" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors" />
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">портфолио.рф/</span>
              <input placeholder="username" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                className="w-full border border-gray-200 rounded-xl pl-32 pr-4 py-2.5 text-sm outline-none focus:border-black transition-colors" />
            </div>
          </>
        )}
        <input placeholder="Email" type="email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors" />
        <input placeholder="Пароль" type="password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors" />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className="bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
        {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Создать аккаунт'}
      </button>
    </div>
  )
}
