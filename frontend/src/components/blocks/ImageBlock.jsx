export default function ImageBlock({ content, label }) {
  if (!content) return null
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <img
        src={content}
        alt={label || 'Изображение'}
        className="w-full object-cover max-h-[500px]"
        onError={e => { e.target.style.display = 'none' }}
      />
      {label && (
        <p className="text-xs text-gray-400 px-4 py-2">{label}</p>
      )}
    </div>
  )
}
