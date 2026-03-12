export default function ImageBlock({ content, label, style }) {
  if (!content) return null
  return (
    <div style={style}>
      {label && <p className="text-xs opacity-50 uppercase tracking-wide p-4 pb-0">{label}</p>}
      <img src={content} alt={label || 'Изображение'}
        className="w-full object-cover"
        style={{ borderRadius: 'inherit' }}
        onError={e => { e.target.style.display = 'none' }} />
    </div>
  )
}
