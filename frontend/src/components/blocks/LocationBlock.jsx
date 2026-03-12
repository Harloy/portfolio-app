export default function LocationBlock({ content, label }) {
  let data = { country: '', city: '', metro: '', has_metro: false, street: '', lat: '', lng: '', photos: [], notes: '' }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}

  const addressParts = [data.country, data.city, data.street].filter(Boolean)
  const hasCoords = data.lat && data.lng

  const mapsUrl = hasCoords
    ? `https://maps.google.com/maps?q=${data.lat},${data.lng}&z=15&output=embed`
    : addressParts.length
    ? `https://maps.google.com/maps?q=${encodeURIComponent(addressParts.join(', '))}&z=15&output=embed`
    : null

  if (!addressParts.length && !mapsUrl) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {data.photos?.length > 0 && (
        <div className={`grid gap-0.5 ${data.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {data.photos.slice(0, 2).map((src, i) => (
            <img key={i} src={src} alt="Место" className="w-full h-36 object-cover"
              onError={e => { e.target.style.display = 'none' }} />
          ))}
        </div>
      )}
      <div className="p-5 flex flex-col gap-3">
        {addressParts.length > 0 && (
          <div className="flex flex-col gap-1">
            {label && <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>}
            <p className="font-semibold text-gray-900">{addressParts.join(', ')}</p>
            {data.has_metro && data.metro && (
              <p className="text-sm text-gray-500">🚇 {data.metro}</p>
            )}
          </div>
        )}
        {mapsUrl && (
          <iframe
            src={mapsUrl}
            className="w-full h-48 rounded-xl border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
        {data.notes && (
          <p className="text-sm text-gray-500 leading-relaxed">{data.notes}</p>
        )}
      </div>
    </div>
  )
}
