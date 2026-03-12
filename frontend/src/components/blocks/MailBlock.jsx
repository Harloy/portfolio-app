import { useState, useRef } from 'react'

export default function MailBlock({ content, label, style }) {
  const [name, setName]       = useState('')
  const [message, setMessage] = useState('')
  const linkRef               = useRef(null)

  let data = { email: '', button_text: '', intro: '' }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}

  if (!data.email) return null

  // Строим mailto href динамически и кликаем по скрытой ссылке
  function handleSend() {
    if (!message.trim()) return
    const subject = name ? `Сообщение от ${name}` : 'Сообщение с портфолио'
    const href = `mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
    linkRef.current.href = href
    linkRef.current.click()
  }

  return (
    <div style={style} className="p-5 flex flex-col gap-4">
      {label && <p className="text-xs opacity-50 uppercase tracking-wide">{label}</p>}
      {data.intro && <p className="text-sm text-gray-500 leading-relaxed">{data.intro}</p>}

      <div className="flex flex-col gap-2">
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Ваше имя или компания"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Напишите вашу задачу или вопрос..."
          rows={4}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors resize-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">→ {data.email}</span>
          <button onClick={handleSend} disabled={!message.trim()}
            className="bg-black text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors">
            {data.button_text || 'Написать'}
          </button>
        </div>
      </div>

      {/* Скрытая ссылка для правильного открытия mailto */}
      <a ref={linkRef} href="#" className="hidden" aria-hidden="true" />
    </div>
  )
}

export function MailEditor({ content, onChange }) {
  let data = { email: '', button_text: '', intro: '' }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}
  function update(field, value) { onChange(JSON.stringify({ ...data, [field]: value })) }

  return (
    <div className="flex flex-col gap-2">
      <input value={data.email || ''} onChange={e => update('email', e.target.value)}
        placeholder="Ваш email для получения писем"
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
      <input value={data.intro || ''} onChange={e => update('intro', e.target.value)}
        placeholder="Текст-приглашение (необязательно)"
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
      <input value={data.button_text || ''} onChange={e => update('button_text', e.target.value)}
        placeholder="Текст кнопки (по умолчанию: Написать)"
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
    </div>
  )
}
