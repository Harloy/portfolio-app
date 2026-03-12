import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../../store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function fetchComments(portfolioId) {
  const res = await fetch(`${BASE_URL}/api/comments?portfolio_id=${portfolioId}`)
  return res.json()
}

async function postComment({ portfolioId, authorName, text }) {
  const res = await fetch(`${BASE_URL}/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio_id: portfolioId, author_name: authorName, text }),
  })
  if (!res.ok) throw new Error('Ошибка отправки')
  return res.json()
}

async function deleteComment(id) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}/api/comments?id=${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Ошибка удаления')
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)    return 'только что'
  if (diff < 3600)  return `${Math.floor(diff / 60)} мин. назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`
  return `${Math.floor(diff / 86400)} дн. назад`
}

export default function CommentsBlock({ content, label, style, isOwner }) {
  const [name, setName]   = useState('')
  const [text, setText]   = useState('')
  const [sent, setSent]   = useState(false)
  const queryClient       = useQueryClient()
  const { user }          = useAuthStore()

  let data = { portfolio_id: 0, placeholder: '' }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', data.portfolio_id],
    queryFn:  () => fetchComments(data.portfolio_id),
    enabled:  !!data.portfolio_id,
  })

  const addMutation = useMutation({
    mutationFn: postComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', data.portfolio_id])
      setText(''); setSent(true)
      setTimeout(() => setSent(false), 3000)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => queryClient.invalidateQueries(['comments', data.portfolio_id]),
  })

  function handleSubmit() {
    if (!text.trim() || !data.portfolio_id) return
    addMutation.mutate({ portfolioId: data.portfolio_id, authorName: name.trim() || 'Аноним', text: text.trim() })
  }

  return (
    <div style={style} className="p-5 flex flex-col gap-4">
      {label && <p className="text-xs opacity-50 uppercase tracking-wide">{label}</p>}

      {/* Форма */}
      <div className="flex flex-col gap-2">
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Ваше имя (необязательно)"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder={data.placeholder || 'Напишите комментарий...'}
          rows={3}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors resize-none" />
        <div className="flex items-center justify-between">
          {sent             && <span className="text-xs text-emerald-600">Отправлено ✓</span>}
          {addMutation.isError && <span className="text-xs text-red-500">Ошибка отправки</span>}
          {!sent && !addMutation.isError && <span />}
          <button onClick={handleSubmit} disabled={!text.trim() || addMutation.isPending}
            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors">
            {addMutation.isPending ? '...' : 'Отправить'}
          </button>
        </div>
      </div>

      {/* Список */}
      {isLoading && <p className="text-xs text-gray-400 text-center py-2">Загрузка...</p>}
      {!isLoading && comments.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">Комментариев пока нет</p>
      )}
      {comments.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-3">
          {comments.map(c => (
            <div key={c.id} className="flex flex-col gap-1 group/comment">
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-gray-800">{c.author_name}</span>
                  <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                </div>
                {/* Кнопка удаления — только для владельца */}
                {user && isOwner && (
                  <button
                    onClick={() => deleteMutation.mutate(c.id)}
                    disabled={deleteMutation.isPending}
                    className="opacity-0 group-hover/comment:opacity-100 transition-opacity text-xs text-gray-300 hover:text-red-400 flex-shrink-0">
                    удалить
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentsEditor({ content, onChange, portfolioId }) {
  let data = { portfolio_id: portfolioId || 0, placeholder: '' }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}
  if (portfolioId && data.portfolio_id !== portfolioId) {
    onChange(JSON.stringify({ ...data, portfolio_id: portfolioId }))
  }
  function update(field, value) { onChange(JSON.stringify({ ...data, [field]: value })) }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-400">Посетители смогут оставлять комментарии</p>
      <input value={data.placeholder || ''} onChange={e => update('placeholder', e.target.value)}
        placeholder="Текст-подсказка в поле ввода"
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
    </div>
  )
}
