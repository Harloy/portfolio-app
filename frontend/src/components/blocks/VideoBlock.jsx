function getEmbedUrl(url) {
  if (!url) return null
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return null
}

export default function VideoBlock({ content, label }) {
  const embedUrl = getEmbedUrl(content)
  if (!embedUrl) return null
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="aspect-video">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
      {label && <p className="text-xs text-gray-400 px-4 py-2">{label}</p>}
    </div>
  )
}
