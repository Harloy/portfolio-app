export default function SpecialistCard({ specialist }) {
  const {
    name,
    city,
    avatar,
    tags,
    status,
    previews = [],
  } = specialist

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">

      {/* Превью работ */}
      <div className="grid grid-cols-3 gap-0.5 h-28">
        {previews.slice(0, 3).map((src, i) => (
          <img key={i} src={src} className="w-full h-full object-cover" />
        ))}
        {previews.length === 0 && (
          <div className="col-span-3 bg-gray-100" />
        )}
      </div>

      {/* Контент */}
      <div className="p-3 flex flex-col gap-2">

        {/* Аватар + имя + город */}
        <div className="flex items-center gap-2">
          <img
            src={avatar}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <p className="font-semibold text-sm text-gray-900 leading-tight">{name}</p>
            <p className="text-xs text-gray-400">{city}</p>
          </div>
        </div>

        {/* Статус */}
        {status && (
          <p className="text-xs text-gray-500 italic leading-tight">"{status}"</p>
        )}

        {/* Теги */}
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

      </div>
    </div>
  )
}