export default function VideoBlock({ content, label, style }) {
  if (!content) return null

  let src = content
  const yt = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  const vi = content.match(/vimeo\.com\/(\d+)/)
  if (yt) src = `https://www.youtube.com/embed/${yt[1]}`
  else if (vi) src = `https://player.vimeo.com/video/${vi[1]}`

  return (
    <div className="overflow-hidden" style={style}>
      {label && <p className="text-xs opacity-50 uppercase tracking-wide p-4 pb-2">{label}</p>}
      <div className="relative" style={{ paddingBottom: '56.25%' }}>
        <iframe src={src} className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen />
      </div>
    </div>
  )
}
