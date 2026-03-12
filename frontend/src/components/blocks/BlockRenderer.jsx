import TextBlock     from './TextBlock'
import ImageBlock    from './ImageBlock'
import VideoBlock    from './VideoBlock'
import AudioBlock    from './AudioBlock'
import CaseBlock     from './CaseBlock'
import LocationBlock from './LocationBlock'
import ProgramsBlock from './ProgramsBlock'
import StepsBlock    from './StepsBlock'
import ContactsBlock from './ContactsBlock'
import CommentsBlock from './CommentsBlock'
import MailBlock     from './MailBlock'

const COMPONENTS = {
  text: TextBlock, image: ImageBlock, video: VideoBlock,
  audio: AudioBlock, case: CaseBlock, location: LocationBlock,
  programs: ProgramsBlock, steps: StepsBlock, contacts: ContactsBlock,
  comments: CommentsBlock, mail: MailBlock,
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

export default function BlockRenderer({ blocks, editMode, onEditStyle, portfolioId, isOwner }) {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map(block => {
        const Component = COMPONENTS[block.type]
        if (!Component) return null

        const style = parseBlockStyle(block.style)

        // Для блока комментариев: если portfolio_id не в content — берём из пропа
        let content = block.content
        if (block.type === 'comments' && portfolioId) {
          try {
            const d = JSON.parse(content || '{}')
            if (!d.portfolio_id) {
              content = JSON.stringify({ ...d, portfolio_id: portfolioId })
            }
          } catch {}
        }

        return (
          <div key={block.id} className="relative group">
            <Component
              content={content}
              label={block.label}
              style={style}
              isOwner={isOwner}
            />
            {editMode && onEditStyle && (
              <button
                onClick={() => onEditStyle(block.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-500 hover:text-gray-800 shadow-sm">
                🎨
              </button>
            )}
          </div>
        )
      })}
    </>
  )
}
