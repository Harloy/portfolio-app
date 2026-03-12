export default function AudioBlock({ content, label, style }) {
  if (!content) return null
  const src = content.includes('soundcloud.com')
    ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(content)}&color=%23000000&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`
    : content

  return (
    <div className="p-4" style={style}>
      <iframe width="100%" height="120" scrolling="no" frameBorder="no"
        src={src} className="w-full" />
    </div>
  )
}
