const METRO_OPTIONS = [
  'Нет метро',
  'Рядом с метро',
]

export default function LocationEditor({ content, onChange }) {
  let data = {
    country: '', city: '', metro: '', has_metro: false,
    street: '', lat: '', lng: '', photos: [], notes: ''
  }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}

  function update(field, value) {
    onChange(JSON.stringify({ ...data, [field]: value }))
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Страна / Город */}
      <div className="grid grid-cols-2 gap-2">
        <input
          value={data.country}
          onChange={e => update('country', e.target.value)}
          placeholder="Страна"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
        />
        <input
          value={data.city}
          onChange={e => update('city', e.target.value)}
          placeholder="Город"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
        />
      </div>

      {/* Метро */}
      <div className="flex gap-2 items-center">
        <input
          value={data.metro}
          onChange={e => update('metro', e.target.value)}
          placeholder="Станция метро"
          disabled={!data.has_metro}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors disabled:opacity-40"
        />
        <label className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0 cursor-pointer">
          <input
            type="checkbox"
            checked={data.has_metro}
            onChange={e => update('has_metro', e.target.checked)}
            className="rounded"
          />
          Есть метро
        </label>
      </div>

      {/* Улица */}
      <input
        value={data.street}
        onChange={e => update('street', e.target.value)}
        placeholder="Улица, дом"
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
      />

      {/* Геометка */}
      <div className="grid grid-cols-2 gap-2">
        <input
          value={data.lat}
          onChange={e => update('lat', e.target.value)}
          placeholder="Широта (55.7558)"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
        />
        <input
          value={data.lng}
          onChange={e => update('lng', e.target.value)}
          placeholder="Долгота (37.6176)"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
        />
      </div>
      <p className="text-xs text-gray-400">
        💡 Координаты можно найти на maps.google.com — правый клик → «Что здесь?»
      </p>

      {/* Доп. информация */}
      <textarea
        value={data.notes}
        onChange={e => update('notes', e.target.value)}
        placeholder="Дополнительная информация (время работы, как добраться...)"
        rows={2}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors resize-none"
      />

      {/* Фото */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-gray-400">Фотографии места</p>
        {(data.photos || []).map((src, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={src}
              onChange={e => {
                const photos = [...data.photos]
                photos[i] = e.target.value
                update('photos', photos)
              }}
              placeholder="https://imgur.com/..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
            />
            <button
              onClick={() => update('photos', data.photos.filter((_, idx) => idx !== i))}
              className="text-gray-300 hover:text-red-400 px-2"
            >✕</button>
          </div>
        ))}
        <button
          onClick={() => update('photos', [...(data.photos || []), ''])}
          className="text-xs text-gray-400 hover:text-gray-600 text-left py-1"
        >
          + добавить фото
        </button>
      </div>

    </div>
  )
}
