import { useState } from 'react'
import { professionLabel } from '../config/professions'
import BlockRenderer from './blocks/BlockRenderer'

function extractLocation(blocks = []) {
  const loc = blocks.find(b => b.type === 'location')
  if (!loc) return ''
  try {
    const d = JSON.parse(loc.content)
    return [d.city, d.metro].filter(Boolean).join(' · ')
  } catch { return '' }
}

export default function SpecialistCard({ portfolio, onClick }) {
  const [expanded, setExpanded] = useState(false)

  const blocks   = portfolio.blocks || []
  const tags     = portfolio.tags || []
  const location = extractLocation(blocks)
  const featured = blocks.filter(b => b.is_featured)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

      {/* Шапка — кликабельна для перехода */}
      <div onClick={onClick} className="cursor-pointer p-4 flex flex-col gap-3">

        {/* Аватар + имя + город */}
        <div className="flex items-center gap-3">
          {portfolio.avatar_url ? (
            <img src={portfolio.avatar_url}
              className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
              onError={e => { e.target.style.display = 'none' }} />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 text-lg">
              {portfolio.category === 'photo'   ? '📷' :
               portfolio.category === 'music'   ? '🎵' :
               portfolio.category === 'design'  ? '💻' :
               portfolio.category === 'illustr' ? '🎨' : '✦'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-900 truncate leading-tight">
              {portfolio.title || 'Без названия'}
            </p>
            {location && (
              <p className="text-xs text-gray-400 truncate">📍 {location}</p>
            )}
          </div>
          {portfolio.score > 0 && (
            <span className="text-xs text-gray-300 flex-shrink-0">👁 {portfolio.score}</span>
          )}
        </div>

        {/* Описание */}
        {portfolio.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {portfolio.description}
          </p>
        )}

        {/* Теги */}
        <div className="flex flex-wrap gap-1">
          {portfolio.category && (
            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
              {professionLabel(portfolio.category)}
            </span>
          )}
          {portfolio.status && (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full italic">
              {portfolio.status}
            </span>
          )}
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Кнопка развернуть — только если есть отмеченные блоки */}
      {featured.length > 0 && (
        <div className="border-t border-gray-50">
          <button
            onClick={e => { e.stopPropagation(); setExpanded(ex => !ex) }}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
            {expanded
              ? '▲ Свернуть'
              : `▼ ${featured.length === 1 ? (featured[0].label || 'Показать работу') : `Показать работы (${featured.length})`}`
            }
          </button>

          {expanded && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-50 flex flex-col gap-3">
              <BlockRenderer blocks={featured} editMode={false} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
