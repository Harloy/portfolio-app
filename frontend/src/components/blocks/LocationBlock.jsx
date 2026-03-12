import { useState } from 'react'

export default function LocationBlock({ content, label, style }) {
  const [expanded, setExpanded] = useState(false)

  let data = { country: '', city: '', metro: '', street: '', lat: '', lng: '', photos: [], notes: '', hidden: false }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}

  const addressParts = [data.country, data.city, data.street].filter(Boolean)
  const hasCoords = data.lat && data.lng

  const mapsUrl = hasCoords
    ? `https://maps.google.com/maps?q=${data.lat},${data.lng}&z=15&output=embed`
    : addressParts.length
    ? `https://maps.google.com/maps?q=${encodeURIComponent(addressParts.join(', '))}&z=15&output=embed`
    : null

  if (!addressParts.length && !data.metro) return null

  // Скрытый режим — только кнопка "показать"
  if (data.hidden) {
    return (
      <div className="overflow-hidden" style={style}>
        <div className="p-4 flex flex-col gap-3">
          {label && <p className="text-xs opacity-50 uppercase tracking-wide">{label}</p>}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-0.5 flex-1">
              <p className="font-medium text-sm">
                📍 {data.city || addressParts[0] || 'Местоположение'}
                {data.metro && <span className="text-gray-400 font-normal"> · 🚇 {data.metro}</span>}
              </p>
              {data.notes && !expanded && (
                <p className="text-xs text-gray-400 truncate">{data.notes}</p>
              )}
            </div>
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl hover:border-gray-400 transition-colors flex-shrink-0">
              {expanded ? '▲ Скрыть' : '▼ Показать на карте'}
            </button>
          </div>

          {expanded && (
            <div className="flex flex-col gap-3">
              {data.photos?.length > 0 && (
                <div className={`grid gap-0.5 ${data.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {data.photos.slice(0, 2).map((src, i) => (
                    <img key={i} src={src} alt="Место" className="w-full h-36 object-cover rounded-xl"
                      onError={e => { e.target.style.display = 'none' }} />
                  ))}
                </div>
              )}
              {mapsUrl && (
                <iframe src={mapsUrl} className="w-full h-48 border-0 rounded-xl" loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" />
              )}
              {addressParts.length > 0 && (
                <p className="text-sm text-gray-500">{addressParts.join(', ')}</p>
              )}
              {data.notes && (
                <p className="text-sm opacity-60 leading-relaxed">{data.notes}</p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Обычный режим
  return (
    <div className="overflow-hidden" style={style}>
      {data.photos?.length > 0 && (
        <div className={`grid gap-0.5 ${data.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {data.photos.slice(0, 2).map((src, i) => (
            <img key={i} src={src} alt="Место" className="w-full h-36 object-cover"
              onError={e => { e.target.style.display = 'none' }} />
          ))}
        </div>
      )}
      <div className="p-5 flex flex-col gap-3">
        {(addressParts.length > 0 || data.metro) && (
          <div className="flex flex-col gap-1">
            {addressParts.length > 0 && (
              <p className="font-semibold">{addressParts.join(', ')}</p>
            )}
            {data.metro && (
              <p className="text-sm opacity-60">🚇 {data.metro}</p>
            )}
          </div>
        )}
        {mapsUrl && (
          <iframe src={mapsUrl} className="w-full h-48 border-0 rounded-xl" loading="lazy"
            referrerPolicy="no-referrer-when-downgrade" />
        )}
        {data.notes && <p className="text-sm opacity-60 leading-relaxed">{data.notes}</p>}
      </div>
    </div>
  )
}
