export default function TextBlock({ content, label, style }) {
  if (!content) return null
  return (
    <div className="p-6" style={style}>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}
