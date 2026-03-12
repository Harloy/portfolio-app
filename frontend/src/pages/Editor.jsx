import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useEditorStore from '../store/editorStore'
import { savePortfolio, getMyPortfolio } from '../api/portfolio'
import BlockEditor from '../components/blocks/BlockEditor'

const TEMPLATES = [
  {
    id: 'illustrator',
    label: '🎨 Художник / Иллюстратор',
    tip: 'Покажи процесс работы — скетчи и финал рядом работают лучше, чем просто результат.',
    blocks: [
      { type: 'text',  label: 'О себе' },
      { type: 'image', label: 'Лучшая работа' },
      { type: 'case',  label: 'Кейс проекта' },
      { type: 'image', label: 'Ещё работы' },
    ]
  },
  {
    id: 'designer',
    label: '💻 Дизайнер',
    tip: 'Описывай задачу и результат — клиенты покупают решение проблемы, а не красоту.',
    blocks: [
      { type: 'text',  label: 'О себе' },
      { type: 'case',  label: 'Кейс #1' },
      { type: 'case',  label: 'Кейс #2' },
      { type: 'text',  label: 'Контакты' },
    ]
  },
  {
    id: 'photographer',
    label: '📷 Фотограф',
    tip: 'Первые три фото решают всё — ставь самые сильные работы в начало.',
    blocks: [
      { type: 'image', label: 'Обложка' },
      { type: 'text',  label: 'О себе' },
      { type: 'image', label: 'Галерея' },
      { type: 'video', label: 'Showreel' },
    ]
  },
  {
    id: 'musician',
    label: '🎵 Музыкант',
    tip: 'Добавь SoundCloud или YouTube — текст без звука не продаёт музыку.',
    blocks: [
      { type: 'text',  label: 'О себе' },
      { type: 'audio', label: 'Треки' },
      { type: 'video', label: 'Живое выступление' },
    ]
  },
  {
    id: 'empty',
    label: '⬜ Пустой шаблон',
    tip: 'Строй с нуля — ты лучше знаешь что нужно.',
    blocks: []
  },
]

const BLOCK_TYPES = [
  { type: 'text',  label: '📝 Текст',       desc: 'Описание, био, контакты' },
  { type: 'image', label: '🖼 Изображение', desc: 'Ссылка на Imgur или другой хостинг' },
  { type: 'video', label: '▶️ Видео',       desc: 'YouTube или Vimeo ссылка' },
  { type: 'audio', label: '🎵 Аудио',       desc: 'SoundCloud ссылка' },
  { type: 'case',  label: '📁 Кейс',        desc: 'Проект с описанием и картинками' },
]

const BLOCK_ICONS = { text: '📝', image: '🖼', video: '▶️', audio: '🎵', case: '📁' }

// ── Отдельный компонент для сортируемого блока ──
function SortableBlock({ block, onRemove, onUpdate }) {
  const [open, setOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* Шапка блока */}
      <div className="flex items-center gap-3 p-4">

        {/* Ручка для перетаскивания */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
        >
          ⠿
        </button>

        <span className="text-lg">{BLOCK_ICONS[block.type]}</span>

        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{block.label}</p>
          <p className="text-xs text-gray-400">{block.type}</p>
        </div>

        <button
          onClick={() => setOpen(o => !o)}
          className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {open ? 'Свернуть' : 'Изменить'}
        </button>

        <button
          onClick={onRemove}
          className="text-gray-300 hover:text-red-400 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Форма редактирования */}
      {open && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          <BlockEditor
            block={block}
            onChange={(content) => onUpdate(block.id, content)}
          />
        </div>
      )}
    </div>
  )
}

// ── Основной компонент ──
export default function Editor() {
  const [searchParams] = useSearchParams()
  const isSetup = searchParams.get('setup') === 'true'
  const navigate = useNavigate()

  const [step, setStep]                         = useState(isSetup ? 'template' : 'editor')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showAddBlock, setShowAddBlock]         = useState(false)
  const [title, setTitle]                       = useState('')
  const [category, setCategory]                 = useState('')
  const [saving, setSaving]                     = useState(false)

  const { blocks, addBlock, removeBlock, updateBlock, reorderBlocks } = useEditorStore()

  const { data: existing } = useQuery({
    queryKey: ['my-portfolio'],
    queryFn: getMyPortfolio,
    enabled: !isSetup,
  })

  useEffect(() => {
    if (existing) {
      setTitle(existing.title || '')
      setCategory(existing.category || '')
      if (existing.blocks?.length > 0) {
        reorderBlocks(existing.blocks.map(b => ({ ...b, id: b.id })))
      }
    }
  }, [existing])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event) {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id)
      const newIndex = blocks.findIndex(b => b.id === over.id)
      reorderBlocks(arrayMove(blocks, oldIndex, newIndex))
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await savePortfolio({ title, category, description: '', blocks })
      navigate('/my')
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  function applyTemplate(template) {
    reorderBlocks([])
    template.blocks.forEach((b, i) => {
      addBlock({ id: Date.now() + i, type: b.type, label: b.label, content: '' })
    })
    setSelectedTemplate(template)
    setStep('editor')
  }

  // ── Шаг выбора шаблона ──
  if (step === 'template') {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">С чего начнём?</h1>
          <p className="text-gray-500 text-sm mt-1">Выбери шаблон под свою специализацию</p>
        </div>
        <div className="flex flex-col gap-3">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t)}
              className="bg-white rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 border border-transparent hover:border-gray-200"
            >
              <span className="font-semibold text-gray-900">{t.label}</span>
              <span className="text-xs text-gray-400 italic">💡 {t.tip}</span>
              <div className="flex gap-2 flex-wrap mt-1">
                {t.blocks.map((b, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {b.label}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Редактор ──
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Редактор</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      <div className="flex gap-3">
        <input
          placeholder="Название портфолио"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black transition-colors"
        >
          <option value="">Категория</option>
          <option value="illustr">Художник</option>
          <option value="design">Дизайнер</option>
          <option value="photo">Фотограф</option>
          <option value="motion">Аниматор</option>
          <option value="music">Музыкант</option>
        </select>
      </div>

      {selectedTemplate && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          💡 {selectedTemplate.tip}
        </div>
      )}

      {/* Список блоков с DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {blocks.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl">
                Блоков пока нет — добавь первый
              </div>
            )}
            {blocks.map(block => (
              <SortableBlock
                key={block.id}
                block={block}
                onRemove={() => removeBlock(block.id)}
                onUpdate={updateBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={() => setShowAddBlock(true)}
        className="border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
      >
        + Добавить блок
      </button>

      {showAddBlock && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 pb-6 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Тип блока</h3>
              <button onClick={() => setShowAddBlock(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {BLOCK_TYPES.map(bt => (
              <button
                key={bt.type}
                onClick={() => {
                  addBlock({ id: Date.now(), type: bt.type, label: bt.label.split(' ').slice(1).join(' '), content: '' })
                  setShowAddBlock(false)
                }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-2xl">{bt.label.split(' ')[0]}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{bt.label.split(' ').slice(1).join(' ')}</p>
                  <p className="text-xs text-gray-400">{bt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
