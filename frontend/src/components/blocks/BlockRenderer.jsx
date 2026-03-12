import TextBlock     from './TextBlock'
import ImageBlock    from './ImageBlock'
import VideoBlock    from './VideoBlock'
import AudioBlock    from './AudioBlock'
import CaseBlock     from './CaseBlock'
import LocationBlock from './LocationBlock'

const COMPONENTS = {
  text: TextBlock, image: ImageBlock, video: VideoBlock,
  audio: AudioBlock, case: CaseBlock, location: LocationBlock,
}

function parseBlockStyle(styleJson) {
  let s = {}
  try { s = JSON.parse(styleJson || '{}') } catch {}

  return {
    backgroundColor: s.bg      || 'var(--pt-card-bg, white)',
    color:           s.text    || 'var(--pt-text, #374151)',
    padding:         s.padding !== '0' && s.padding ? s.padding : undefined,
    borderRadius:    s.radius  || 'var(--pt-radius, 16px)',
    boxShadow:       s.shadow !== false ? 'var(--pt-shadow, 0 2px 12px rgba(0,0,0,0.08))' : 'none',
    textAlign:       s.align   || 'left',
    fontSize:        s.size === 'sm' ? '0.875rem' : s.size === 'lg' ? '1.125rem' : undefined,
    border:          s.border  || undefined,
    overflow:        'hidden',
  }
}

export default function BlockRenderer({ blocks, editMode, onEditStyle }) {
  if (!blocks?.length) return (
    <p className="text-sm text-center py-12 opacity-40">Блоков пока нет</p>
  )
  return (
    <div className="flex flex-col" style={{ gap: 'var(--pt-spacing, 16px)' }}>
      {blocks.map(block => {
        const Component = COMPONENTS[block.type]
        if (!Component) return null
        const blockStyle = parseBlockStyle(block.style)
        return (
          <div key={block.id} className="relative group">
            <Component
              content={block.content}
              label={block.label}
              style={blockStyle}
            />
            {editMode && (
              <button
                onClick={() => onEditStyle?.(block.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                  bg-white border border-gray-200 text-gray-500 text-xs px-2 py-1 rounded-lg shadow-sm hover:bg-gray-50 z-10"
              >
                🎨
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
