import { useState } from 'react'

function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)

  function prev(e) { e.stopPropagation(); setIdx(i => Math.max(0, i - 1)) }
  function next(e) { e.stopPropagation(); setIdx(i => Math.min(images.length - 1, i + 1)) }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl w-10 h-10 flex items-center justify-center">
        ✕
      </button>
      <button onClick={prev} disabled={idx === 0}
        className="absolute left-4 text-white/60 hover:text-white disabled:opacity-20 text-3xl w-12 h-12 flex items-center justify-center">
        ‹
      </button>
      <img src={images[idx]} alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={e => e.stopPropagation()} />
      <button onClick={next} disabled={idx === images.length - 1}
        className="absolute right-4 text-white/60 hover:text-white disabled:opacity-20 text-3xl w-12 h-12 flex items-center justify-center">
        ›
      </button>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i) }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CaseBlock({ content, label, style }) {
  const [lightbox, setLightbox] = useState(null)

  let data = { title: '', description: '', images: [], link: '', link_text: '' }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}

  const images = (data.images || []).filter(Boolean)

  return (
    <div className="overflow-hidden" style={style}>
      {label && <p className="text-xs opacity-50 uppercase tracking-wide p-4 pb-0">{label}</p>}

      {/* Картинки */}
      {images.length > 0 && (
        <div className={`grid gap-0.5 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {images.map((src, i) => (
            <div key={i} className="relative group cursor-zoom-in overflow-hidden"
              onClick={() => setLightbox(i)}>
              <img src={src} alt={`${data.title} ${i + 1}`}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={e => { e.target.style.display = 'none' }} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-2xl transition-opacity">⤢</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Контент */}
      <div className="p-5 flex flex-col gap-3">
        {data.title && <h3 className="font-semibold">{data.title}</h3>}
        {data.description && <p className="text-sm opacity-60 leading-relaxed">{data.description}</p>}
        {data.link && (
          <a href={data.link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity self-start">
            {data.link_text || 'Смотреть проект'} →
          </a>
        )}
      </div>

      {/* Лайтбокс */}
      {lightbox !== null && images.length > 0 && (
        <Lightbox images={images} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}
