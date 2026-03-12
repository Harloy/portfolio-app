function getEmbedUrl(url) {
  if (!url) return null
  // SoundCloud
  if (url.includes('soundcloud.com')) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23000000&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`
  }
  return null
}

export default function AudioBlock({ content, label }) {
  const embedUrl = getEmbedUrl(content)
  if (!embedUrl) return null
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm p-4">
      {label && <p className="text-sm font-medium text-gray-700 mb-3">{label}</p>}
      <iframe
        src={embedUrl}
        width="100%"
        height="120"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
      />
    </div>
  )
}
