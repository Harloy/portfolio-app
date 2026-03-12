import { professionLabel } from '../config/professions'

function extractPreviews(blocks = []) {
  const previews = []
  for (const block of blocks) {
    if (previews.length >= 3) break
    const c = (block.content || '').trim()
    if (block.type === 'image' && c.startsWith('http')) {
      previews.push(c)
    }
    if (block.type === 'video') {
      let url = c
      try { url = JSON.parse(c)?.url || c } catch {}
      const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
      if (yt) previews.push(`https://img.youtube.com/vi/${yt[1]}/mqdefault.jpg`)
    }
    if (block.type === 'case') {
      try {
        const img = JSON.parse(c)?.images?.[0]
        if (img?.startsWith('http')) previews.push(img)
      } catch {}
    }
  }
  return previews
}

function extractLocation(blocks = []) {
  const loc = blocks.find(b => b.type === 'location')
  if (!loc) return ''
  try {
    const d = JSON.parse(loc.content)
    return [d.city, d.metro].filter(Boolean).join(' · ')
  } catch { return '' }
}

export default function SpecialistCard({ portfolio, onClick }) {
  const previews = extractPreviews(portfolio.blocks)
  const location = extractLocation(portfolio.blocks)
  const tags     = portfolio.tags || []
  const title    = portfolio.title || 'Без названия'

  return (
    <div onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">

      {/* Превью работ */}
      <div className="grid grid-cols-3 gap-0.5 h-28">
        {previews.length > 0
          ? previews.map((src, i) => (
              <img key={i} src={src}
                className={`w-full h-full object-cover ${previews.length === 1 ? 'col-span-3' : previews.length === 2 ? 'col-span-1 first:col-span-2' : ''}`}
                onError={e => { e.target.style.display = 'none' }} />
            ))
          : <div className="col-span-3 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <span className="text-3xl opacity-20">
                {portfolio.category === 'photo' ? '📷' :
                 portfolio.category === 'music' ? '🎵' :
                 portfolio.category === 'design' ? '💻' : '✦'}
              </span>
            </div>
        }
      </div>

      {/* Контент */}
      <div className="p-3 flex flex-col gap-2">

        {/* Имя + город */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 leading-tight truncate">{title}</p>
            {location && <p className="text-xs text-gray-400 truncate">📍 {location}</p>}
          </div>
          {portfolio.score > 0 && (
            <span className="text-xs text-gray-300 flex-shrink-0">👁 {portfolio.score}</span>
          )}
        </div>

        {/* Теги */}
        <div className="flex flex-wrap gap-1">
          {portfolio.category && (
            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">
              {professionLabel(portfolio.category)}
            </span>
          )}
          {tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

      </div>
    </div>
  )
}
