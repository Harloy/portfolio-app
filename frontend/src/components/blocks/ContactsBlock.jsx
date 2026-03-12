import { useState } from 'react'

const NETWORK_META = {
  telegram:  { label: 'Telegram',    icon: '✈️', prefix: 'https://t.me/',              placeholder: '@username' },
  instagram: { label: 'Instagram',   icon: '📸', prefix: 'https://instagram.com/',     placeholder: '@username' },
  behance:   { label: 'Behance',     icon: '🅱️', prefix: 'https://behance.net/',       placeholder: 'username' },
  dribbble:  { label: 'Dribbble',    icon: '🏀', prefix: 'https://dribbble.com/',      placeholder: 'username' },
  vk:        { label: 'VK',          icon: '💙', prefix: 'https://vk.com/',            placeholder: 'username' },
  youtube:   { label: 'YouTube',     icon: '▶️', prefix: 'https://youtube.com/@',      placeholder: '@channel' },
  github:    { label: 'GitHub',      icon: '🐙', prefix: 'https://github.com/',        placeholder: 'username' },
  linkedin:  { label: 'LinkedIn',    icon: '💼', prefix: 'https://linkedin.com/in/',   placeholder: 'username' },
  twitter:   { label: 'X / Twitter', icon: '𝕏',  prefix: 'https://x.com/',            placeholder: 'username' },
  artstation:{ label: 'ArtStation',  icon: '🎨', prefix: 'https://artstation.com/',    placeholder: 'username' },
  pinterest: { label: 'Pinterest',   icon: '📌', prefix: 'https://pinterest.com/',     placeholder: 'username' },
  tiktok:    { label: 'TikTok',      icon: '🎵', prefix: 'https://tiktok.com/@',       placeholder: '@username' },
  website:   { label: 'Сайт',        icon: '🌐', prefix: '',                           placeholder: 'https://yoursite.com' },
  email:     { label: 'Email',       icon: '✉️', prefix: 'mailto:',                    placeholder: 'you@email.com' },
}

function networkUrl(type, value) {
  if (!value) return '#'
  const meta = NETWORK_META[type]
  if (!meta) return value
  if (value.startsWith('http') || value.startsWith('mailto:')) return value
  return meta.prefix + value.replace(/^@/, '')
}

export default function ContactsBlock({ content, label, style }) {
  let data = { bio: '', role: '', availability: '', networks: [], portfolio_link: '', portfolio_link_text: '' }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}
  const networks = (data.networks || []).filter(n => n.value)

  return (
    <div style={style} className="p-5 flex flex-col gap-4">
      {label && <p className="text-xs opacity-50 uppercase tracking-wide">{label}</p>}
      {(data.role || data.availability) && (
        <div className="flex flex-wrap items-center gap-2">
          {data.role && <span className="text-sm font-medium text-gray-700">{data.role}</span>}
          {data.availability && (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full italic">
              {data.availability}
            </span>
          )}
        </div>
      )}
      {data.bio && <p className="text-sm text-gray-500 leading-relaxed">{data.bio}</p>}
      {networks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {networks.map((n, i) => {
            const meta = NETWORK_META[n.type] || { icon: '🔗', label: n.type }
            return (
              <a key={i} href={networkUrl(n.type, n.value)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 px-3 py-2 rounded-xl text-sm transition-colors">
                <span>{meta.icon}</span>
                <span className="text-gray-700">{n.label || meta.label}</span>
              </a>
            )
          })}
        </div>
      )}
      {data.portfolio_link && (
        <a href={data.portfolio_link}
          target={data.portfolio_link.startsWith('/') ? '_self' : '_blank'}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors self-start">
          {data.portfolio_link_text || 'Смотреть ещё работы'} →
        </a>
      )}
    </div>
  )
}

export function ContactsEditor({ content, onChange }) {
  const [showAdd, setShowAdd] = useState(false)
  let data = { bio: '', role: '', availability: '', networks: [], portfolio_link: '', portfolio_link_text: '' }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}
  function update(field, value) { onChange(JSON.stringify({ ...data, [field]: value })) }
  function addNetwork(type) { update('networks', [...(data.networks || []), { type, value: '', label: '' }]); setShowAdd(false) }
  function updateNetwork(i, field, value) {
    const nets = [...(data.networks || [])]; nets[i] = { ...nets[i], [field]: value }; update('networks', nets)
  }
  function removeNetwork(i) { update('networks', (data.networks || []).filter((_, idx) => idx !== i)) }
  const usedTypes = (data.networks || []).map(n => n.type)

  return (
    <div className="flex flex-col gap-3">
      <input value={data.role || ''} onChange={e => update('role', e.target.value)}
        placeholder="Роль / специализация"
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
      <input value={data.availability || ''} onChange={e => update('availability', e.target.value)}
        placeholder="Статус (открыт к заказам...)"
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
      <textarea value={data.bio || ''} onChange={e => update('bio', e.target.value)}
        placeholder="Короткое описание..."
        rows={3}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors resize-none" />
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400">Соцсети и контакты</p>
        {(data.networks || []).map((n, i) => {
          const meta = NETWORK_META[n.type] || { icon: '🔗', label: n.type, placeholder: 'ссылка' }
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-base flex-shrink-0">{meta.icon}</span>
              <input value={n.value || ''} onChange={e => updateNetwork(i, 'value', e.target.value)}
                placeholder={meta.placeholder}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors min-w-0" />
              <input value={n.label || ''} onChange={e => updateNetwork(i, 'label', e.target.value)}
                placeholder={meta.label}
                className="w-24 border border-gray-200 rounded-xl px-2 py-2 text-xs outline-none focus:border-black transition-colors" />
              <button onClick={() => removeNetwork(i)} className="text-gray-300 hover:text-red-400 flex-shrink-0">✕</button>
            </div>
          )
        })}
        {showAdd ? (
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(NETWORK_META).map(([key, meta]) => (
              <button key={key} onClick={() => addNetwork(key)} disabled={usedTypes.includes(key)}
                className="flex items-center gap-1.5 p-2 rounded-xl text-xs bg-gray-50 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <span>{meta.icon}</span><span className="truncate">{meta.label}</span>
              </button>
            ))}
            <button onClick={() => setShowAdd(false)} className="col-span-3 text-xs text-gray-400 hover:text-gray-600 py-1">Отмена</button>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} className="text-xs text-gray-400 hover:text-gray-600 text-left py-1">+ добавить контакт</button>
        )}
      </div>
      <div className="border-t border-gray-100 pt-2 flex flex-col gap-2">
        <input value={data.portfolio_link || ''} onChange={e => update('portfolio_link', e.target.value)}
          placeholder="Ссылка (внутри /username или внешняя)"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
        {data.portfolio_link && (
          <input value={data.portfolio_link_text || ''} onChange={e => update('portfolio_link_text', e.target.value)}
            placeholder="Текст кнопки"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
        )}
      </div>
    </div>
  )
}
