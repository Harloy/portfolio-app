export default function CaseBlock({ content, label }) {
  let data = { title: '', description: '', images: [] }
  try { data = JSON.parse(content || '{}') } catch {}

  if (!data.title && !data.description && !data.images?.length) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* Картинки */}
      {data.images?.length > 0 && (
        <div className={`grid gap-0.5 ${data.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {data.images.slice(0, 4).map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt={`${data.title} ${i + 1}`}
                className="w-full h-48 object-cover"
                onError={e => { e.target.style.display = 'none' }}
              />
              {/* Счётчик если картинок больше 4 */}
              {i === 3 && data.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+{data.images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Текст */}
      <div className="p-5 flex flex-col gap-2">
        {data.title && (
          <h3 className="font-bold text-gray-900">{data.title}</h3>
        )}
        {data.description && (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {data.description}
          </p>
        )}
      </div>

    </div>
  )
}
