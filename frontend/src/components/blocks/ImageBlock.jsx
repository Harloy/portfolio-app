export default function ImageBlock({ content, label, style }) {
  if (!content) return null
  return (
    <div style={style}>
      <img src={content} alt={label || 'Изображение'}
        className="w-full object-cover"
        style={{ borderRadius: 'inherit' }}
        onError={e => { e.target.style.display = 'none' }} />
    </div>
  )
}
