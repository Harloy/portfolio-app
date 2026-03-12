export default function TextBlock({ content, label, style }) {
  if (!content) return null
  return (
    <div className="p-6" style={style}>
      {label && <p className="text-xs opacity-50 uppercase tracking-wide mb-2">{label}</p>}
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}
