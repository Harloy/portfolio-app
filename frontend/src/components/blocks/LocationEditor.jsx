export default function LocationEditor({ content, onChange }) {
  let data = {
    country: '', city: '', metro: '',
    street: '', lat: '', lng: '',
    photos: [], notes: '', hidden: false
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
      <input
        value={data.metro}
        onChange={e => update('metro', e.target.value)}
        placeholder="Станция метро"
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
      />

      {/* Улица */}
      <input
        value={data.street}
        onChange={e => update('street', e.target.value)}
        placeholder="Улица, дом"
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
      />

      {/* Заметки */}
      <textarea
        value={data.notes}
        onChange={e => update('notes', e.target.value)}
        placeholder="Как добраться, время работы..."
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
        >+ добавить фото</button>
      </div>

      {/* Скрытый режим */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <div
          onClick={() => update('hidden', !data.hidden)}
          className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
            data.hidden ? 'bg-black' : 'bg-gray-200'
          }`}>
          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
            data.hidden ? 'translate-x-4' : 'translate-x-0'
          }`} />
        </div>
        <span className="text-xs text-gray-500">
          Скрытый вид — показывать карту только по кнопке
        </span>
      </label>

    </div>
  )
}
