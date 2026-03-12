export default function CaseBlock({ content, label, style }) {
  let data = { title: '', description: '', images: [] }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}
  if (!data.title && !data.description && !data.images?.length) return null

  return (
    <div className="overflow-hidden" style={style}>
      {data.images?.length > 0 && (
        <div className={`grid gap-0.5 ${data.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {data.images.filter(Boolean).slice(0, 4).map((src, i) => (
            <img key={i} src={src} alt={`Изображение ${i+1}`}
              className="w-full h-48 object-cover"
              onError={e => { e.target.style.display = 'none' }} />
          ))}
        </div>
      )}
      <div className="p-5 flex flex-col gap-2">
        {label && <p className="text-xs opacity-50 uppercase tracking-wide">{label}</p>}
        {data.title && <h3 className="font-bold">{data.title}</h3>}
        {data.description && <p className="text-sm leading-relaxed opacity-70 whitespace-pre-wrap">{data.description}</p>}
      </div>
    </div>
  )
}
