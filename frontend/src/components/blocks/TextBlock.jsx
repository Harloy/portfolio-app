export default function TextBlock({ content }) {
  if (!content) return null
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}
