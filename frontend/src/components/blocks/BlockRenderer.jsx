import TextBlock  from './TextBlock'
import ImageBlock from './ImageBlock'
import VideoBlock from './VideoBlock'
import AudioBlock from './AudioBlock'
import CaseBlock  from './CaseBlock'

const COMPONENTS = {
  text:  TextBlock,
  image: ImageBlock,
  video: VideoBlock,
  audio: AudioBlock,
  case:  CaseBlock,
}

export default function BlockRenderer({ blocks }) {
  if (!blocks?.length) return (
    <p className="text-gray-400 text-sm text-center py-12">Блоков пока нет</p>
  )

  return (
    <div className="flex flex-col gap-4">
      {blocks.map(block => {
        const Component = COMPONENTS[block.type]
        if (!Component) return null
        return (
          <Component
            key={block.id}
            content={block.content}
            label={block.label}
          />
        )
      })}
    </div>
  )
}
