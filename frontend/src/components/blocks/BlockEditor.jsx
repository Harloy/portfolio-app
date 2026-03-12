import LocationEditor from './LocationEditor'

function TextEditor({ content, onChange }) {
  return (
    <textarea
      value={content || ''}
      onChange={e => onChange(e.target.value)}
      placeholder="Напиши что-нибудь о себе..."
      rows={4}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors resize-none"
    />
  )
}

function LinkEditor({ content, onChange, placeholder }) {
  return (
    <input
      value={content || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
    />
  )
}

function CaseEditor({ content, onChange }) {
  let parsed = { title: '', description: '', images: [] }
  try { parsed = { ...parsed, ...JSON.parse(content || '{}') } } catch {}

  function update(field, value) {
    onChange(JSON.stringify({ ...parsed, [field]: value }))
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        value={parsed.title || ''}
        onChange={e => update('title', e.target.value)}
        placeholder="Название проекта"
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
      />
      <textarea
        value={parsed.description || ''}
        onChange={e => update('description', e.target.value)}
        placeholder="Описание задачи и результата..."
        rows={3}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors resize-none"
      />
      <div className="flex flex-col gap-1.5">
        {(parsed.images || []).map((img, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={img}
              onChange={e => {
                const images = [...parsed.images]
                images[i] = e.target.value
                update('images', images)
              }}
              placeholder="https://imgur.com/..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
            />
            <button
              onClick={() => update('images', parsed.images.filter((_, idx) => idx !== i))}
              className="text-gray-300 hover:text-red-400 px-2"
            >✕</button>
          </div>
        ))}
        <button
          onClick={() => update('images', [...(parsed.images || []), ''])}
          className="text-xs text-gray-400 hover:text-gray-600 text-left py-1"
        >+ добавить картинку</button>
      </div>
    </div>
  )
}

const PLACEHOLDERS = {
  image: 'https://imgur.com/...',
  video: 'https://youtube.com/watch?v=...',
  audio: 'https://soundcloud.com/...',
}

export default function BlockEditor({ block, onChange }) {
  switch (block.type) {
    case 'text':     return <TextEditor content={block.content} onChange={onChange} />
    case 'image':
    case 'video':
    case 'audio':    return <LinkEditor content={block.content} onChange={onChange} placeholder={PLACEHOLDERS[block.type]} />
    case 'case':     return <CaseEditor content={block.content} onChange={onChange} />
    case 'location': return <LocationEditor content={block.content} onChange={onChange} />
    default:         return null
  }
}
