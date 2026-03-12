import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DndContext, closestCenter,
  KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import BlockRenderer from '../components/blocks/BlockRenderer'
import BlockEditor   from '../components/blocks/BlockEditor'
import ThemeEditor   from '../components/ThemeEditor'
import { useTheme }  from '../hooks/useTheme'
import useAuthStore  from '../store/authStore'
import { savePortfolio } from '../api/portfolio'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function fetchByUsername(username) {
  const res = await fetch(`${BASE_URL}/api/portfolio/user?username=${username}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Ошибка загрузки')
  return res.json()
}

const CATEGORY_LABELS = {
  illustr: 'Художник', design: 'Дизайнер',
  photo: 'Фотограф', motion: 'Аниматор', music: 'Музыкант',
}

const BLOCK_TYPES = [
  { type: 'text',     label: '📝 Текст',          desc: 'Описание, био, контакты' },
  { type: 'image',    label: '🖼 Изображение',    desc: 'Ссылка на Imgur' },
  { type: 'video',    label: '▶️ Видео',          desc: 'YouTube или Vimeo' },
  { type: 'audio',    label: '🎵 Аудио',          desc: 'SoundCloud' },
  { type: 'case',     label: '📁 Кейс',           desc: 'Проект с картинками' },
  { type: 'location', label: '📍 Местоположение', desc: 'Адрес и карта' },
]

const BLOCK_ICONS = {
  text: '📝', image: '🖼', video: '▶️',
  audio: '🎵', case: '📁', location: '📍',
}

function TOCBlock({ block, onRemove, onUpdate, isActive, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={`rounded-xl border transition-colors ${isActive ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
    >
      <div className="flex items-center gap-2 p-3">
        <button {...attributes} {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none text-lg">
          ⠿
        </button>
        <span>{BLOCK_ICONS[block.type]}</span>
        <button onClick={onSelect} className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900 truncate">
          {block.label}
        </button>
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors text-sm">✕</button>
      </div>
      {isActive && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2">
          <BlockEditor block={block} onChange={(content) => onUpdate(block.id, content)} />
        </div>
      )}
    </div>
  )
}

export default function UserPortfolio() {
  const { username } = useParams()
  const { user }     = useAuthStore()
  const queryClient  = useQueryClient()

  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: ['portfolio-user', username],
    queryFn:  () => fetchByUsername(username),
  })

  const isOwner  = user?.username === username
  const isEmpty  = !isLoading && portfolio === null

  const [mode, setMode]            = useState(null)
  const [blocks, setBlocks]        = useState([])
  const [theme, setTheme]          = useState('{}')
  const [title, setTitle]          = useState('')
  const [category, setCategory]    = useState('')
  const [activeBlock, setActive]   = useState(null)
  const [showAddBlock, setShowAdd] = useState(false)
  const [saving, setSaving]        = useState(false)

  useTheme(mode === 'theme' ? theme : portfolio?.theme)

  useEffect(() => {
    if (portfolio) {
      setBlocks(portfolio.blocks || [])
      setTheme(portfolio.theme || '{}')
      setTitle(portfolio.title || '')
      setCategory(portfolio.category || '')
    }
  }, [portfolio])

  // Если владелец и портфолио пустое — сразу в режим редактирования
  useEffect(() => {
    if (isOwner && isEmpty) setMode('blocks')
  }, [isOwner, isEmpty])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event) {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIdx = blocks.findIndex(b => b.id === active.id)
      const newIdx = blocks.findIndex(b => b.id === over.id)
      setBlocks(arrayMove(blocks, oldIdx, newIdx))
    }
  }

  function updateBlock(id, content) {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, content } : b))
  }

  function removeBlock(id) {
    setBlocks(bs => bs.filter(b => b.id !== id))
    if (activeBlock === id) setActive(null)
  }

  function addBlock(type, label) {
    const block = { id: Date.now(), type, label, content: '' }
    setBlocks(bs => [...bs, block])
    setActive(block.id)
    setShowAdd(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await savePortfolio({ title, category, description: '', theme, blocks })
      await queryClient.invalidateQueries(['portfolio-user', username])
      setMode(null)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (portfolio) {
      setBlocks(portfolio.blocks || [])
      setTheme(portfolio.theme || '{}')
      setTitle(portfolio.title || '')
      setCategory(portfolio.category || '')
    } else {
      setBlocks([])
    }
    setMode(null)
    setActive(null)
  }

  if (isLoading) return (
    <div className="text-center py-20 text-gray-400 text-sm">Загрузка...</div>
  )

  // Чужая страница без портфолио
  if (isEmpty && !isOwner) return (
    <div className="text-center py-20 text-gray-400 text-sm">Портфолио не найдено</div>
  )

  const previewBlocks = mode === 'blocks' ? blocks : (portfolio?.blocks || [])

  return (
    <div className={`flex gap-6 ${mode ? 'items-start' : ''}`}>

      {/* Левая панель */}
      {mode && (
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 sticky top-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm">
                {mode === 'blocks' ? '📋 Блоки' : '🎨 Оформление'}
              </h3>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                  {saving ? '...' : 'Сохранить'}
                </button>
                <button onClick={handleCancel}
                  className="border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                  Отмена
                </button>
              </div>
            </div>

            {mode === 'blocks' && (
              <div className="flex flex-col gap-2">
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Название портфолио"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors w-full" />
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors w-full">
                  <option value="">Категория</option>
                  <option value="illustr">Художник</option>
                  <option value="design">Дизайнер</option>
                  <option value="photo">Фотограф</option>
                  <option value="motion">Аниматор</option>
                  <option value="music">Музыкант</option>
                </select>
              </div>
            )}
          </div>

          {mode === 'blocks' && (
            <div className="flex flex-col gap-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  {blocks.map(block => (
                    <TOCBlock key={block.id} block={block}
                      isActive={activeBlock === block.id}
                      onSelect={() => setActive(id => id === block.id ? null : block.id)}
                      onRemove={() => removeBlock(block.id)}
                      onUpdate={updateBlock} />
                  ))}
                </SortableContext>
              </DndContext>

              <button onClick={() => setShowAdd(o => !o)}
                className="border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors">
                + Добавить блок
              </button>

              {showAddBlock && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {BLOCK_TYPES.map(bt => (
                    <button key={bt.type}
                      onClick={() => addBlock(bt.type, bt.label.split(' ').slice(1).join(' '))}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left w-full border-b border-gray-50 last:border-0">
                      <span>{bt.label.split(' ')[0]}</span>
                      <div>
                        <p className="text-xs font-medium text-gray-900">{bt.label.split(' ').slice(1).join(' ')}</p>
                        <p className="text-xs text-gray-400">{bt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'theme' && (
            <ThemeEditor value={theme} onChange={setTheme} />
          )}
        </div>
      )}

      {/* Превью / страница */}
      <div id="portfolio-theme"
        className={`flex flex-col gap-4 flex-1 ${!mode ? 'max-w-2xl mx-auto w-full' : ''}`}
        style={{ fontFamily: 'var(--font, system-ui)' }}
      >
        {/* Шапка */}
        <div className="rounded-2xl p-6 flex items-start justify-between gap-4 bg-white shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400">@{username}</p>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'blocks' ? (title || 'Без названия') : (portfolio?.title || 'Без названия')}
            </h1>
            {(mode === 'blocks' ? category : portfolio?.category) && (
              <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full self-start">
                {CATEGORY_LABELS[mode === 'blocks' ? category : portfolio?.category]}
              </span>
            )}
          </div>

          {isOwner && !mode && (
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setMode('theme')}
                className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                🎨 Оформление
              </button>
              <button onClick={() => setMode('blocks')}
                className="bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition-colors">
                Изменить
              </button>
            </div>
          )}
        </div>

        {/* Пустое состояние для нового пользователя */}
        {isEmpty && isOwner && mode === 'blocks' && blocks.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">✨</p>
            <p className="text-gray-500 text-sm">Добавь первый блок слева чтобы начать</p>
          </div>
        )}

        <BlockRenderer blocks={previewBlocks} />
      </div>

    </div>
  )
}
