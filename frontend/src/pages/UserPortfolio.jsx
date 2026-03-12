import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
import BlockRenderer    from '../components/blocks/BlockRenderer'
import BlockEditor      from '../components/blocks/BlockEditor'
import BlockStyleEditor from '../components/blocks/BlockStyleEditor'
import ThemeEditor      from '../components/ThemeEditor'
import { useTheme }     from '../hooks/useTheme'
import useAuthStore     from '../store/authStore'
import { savePortfolio, recordVisit } from '../api/portfolio'

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
  video: 'Видеограф', arch: 'Архитектор', fashion: 'Стилист',
}

const TEMPLATES = [
  {
    id: 'illustrator', label: '🎨 Художник / Иллюстратор',
    tip: 'Покажи процесс работы — скетчи и финал рядом работают лучше, чем просто результат.',
    blocks: [
      { type: 'text',  label: 'О себе' },
      { type: 'image', label: 'Лучшая работа' },
      { type: 'case',  label: 'Кейс проекта' },
      { type: 'image', label: 'Ещё работы' },
    ]
  },
  {
    id: 'designer', label: '💻 Дизайнер',
    tip: 'Описывай задачу и результат — клиенты покупают решение проблемы, а не красоту.',
    blocks: [
      { type: 'text', label: 'О себе' },
      { type: 'case', label: 'Кейс #1' },
      { type: 'case', label: 'Кейс #2' },
      { type: 'text', label: 'Контакты' },
    ]
  },
  {
    id: 'photographer', label: '📷 Фотограф',
    tip: 'Первые три фото решают всё — ставь самые сильные работы в начало.',
    blocks: [
      { type: 'image', label: 'Обложка' },
      { type: 'text',  label: 'О себе' },
      { type: 'image', label: 'Галерея' },
      { type: 'video', label: 'Showreel' },
    ]
  },
  {
    id: 'musician', label: '🎵 Музыкант',
    tip: 'Добавь SoundCloud или YouTube — текст без звука не продаёт музыку.',
    blocks: [
      { type: 'text',  label: 'О себе' },
      { type: 'audio', label: 'Треки' },
      { type: 'video', label: 'Живое выступление' },
    ]
  },
  {
    id: 'empty', label: '⬜ Пустой шаблон',
    tip: 'Строй с нуля — ты лучше знаешь что нужно.',
    blocks: []
  },
]

const BLOCK_TYPES = [
  { type: 'text',     label: '📝 Текст',          desc: 'Описание, био, контакты' },
  { type: 'image',    label: '🖼 Изображение',    desc: 'Ссылка на Imgur' },
  { type: 'video',    label: '▶️ Видео',          desc: 'YouTube или Vimeo' },
  { type: 'audio',    label: '🎵 Аудио',          desc: 'SoundCloud' },
  { type: 'case',     label: '📁 Кейс',           desc: 'Проект с картинками' },
  { type: 'location', label: '📍 Местоположение', desc: 'Адрес и карта' },
]

const BLOCK_ICONS = { text:'📝', image:'🖼', video:'▶️', audio:'🎵', case:'📁', location:'📍' }

function TOCBlock({ block, onRemove, onUpdate, onUpdateStyle, onToggleFeatured, isActive, onSelect }) {
  const [showStyle, setShowStyle] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={`rounded-xl border transition-colors ${
        isActive ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-2 p-3">
        <button {...attributes} {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none">
          ⠿
        </button>
        <span className="text-sm">{BLOCK_ICONS[block.type]}</span>
        <button onClick={onSelect}
          className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900 truncate">
          {block.label}
        </button>
        <button onClick={onToggleFeatured}
          className={`text-xs px-1 transition-colors ${block.is_featured ? 'text-yellow-400' : 'text-gray-300 hover:text-gray-500'}`}
          title="Показывать в превью">⭐</button>
        <button onClick={() => setShowStyle(s => !s)}
          className={`text-xs px-1 transition-colors ${showStyle ? 'text-gray-700' : 'text-gray-300 hover:text-gray-500'}`}
          title="Стиль блока">🎨</button>
        <button onClick={onRemove}
          className="text-gray-300 hover:text-red-400 transition-colors text-sm">✕</button>
      </div>

      {isActive && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2">
          <BlockEditor block={block} onChange={content => onUpdate(block.id, content)} />
        </div>
      )}

      {showStyle && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2">
          <BlockStyleEditor
            style={block.style}
            onChange={style => onUpdateStyle(block.id, style)}
          />
        </div>
      )}
    </div>
  )
}

export default function UserPortfolio() {
  const { username } = useParams()
  const { user }     = useAuthStore()
  const queryClient  = useQueryClient()

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio-user', username],
    queryFn:  () => fetchByUsername(username),
  })

  const isOwner = user?.username === username
  const isEmpty = !isLoading && portfolio === null

  const [mode, setMode]               = useState(null)
  const [blocks, setBlocks]           = useState([])
  const [theme, setTheme]             = useState('{}')
  const [title, setTitle]             = useState('')
  const [category, setCategory]       = useState('')
  const [avatarUrl, setAvatarUrl]     = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus]           = useState('')
  const [tags, setTags]               = useState([])
  const [activeBlock, setActive]      = useState(null)
  const [showAddBlock, setShowAdd]    = useState(false)
  const [saving, setSaving]           = useState(false)

  const activeTheme = mode === 'theme' ? theme : (portfolio?.theme || '{}')
  useTheme(activeTheme)

  useEffect(() => {
    if (portfolio?.id && !isOwner) recordVisit(portfolio.id)
  }, [portfolio?.id])

  useEffect(() => {
    if (portfolio) {
      setBlocks(portfolio.blocks?.map(b => ({ ...b, style: b.style || '{}', is_featured: b.is_featured || false })) || [])
      setTheme(portfolio.theme || '{}')
      setTitle(portfolio.title || '')
      setCategory(portfolio.category || '')
      setAvatarUrl(portfolio.avatar_url || '')
      setDescription(portfolio.description || '')
      setStatus(portfolio.status || '')
      setTags(portfolio.tags || [])
    }
  }, [portfolio])

  useEffect(() => {
    if (isOwner && isEmpty) setMode('template')
  }, [isOwner, isEmpty])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd({ active, over }) {
    if (active.id !== over?.id) {
      const o = blocks.findIndex(b => b.id === active.id)
      const n = blocks.findIndex(b => b.id === over.id)
      setBlocks(arrayMove(blocks, o, n))
    }
  }

  function updateBlock(id, content) {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, content } : b))
  }

  function updateBlockStyle(id, style) {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, style } : b))
  }

  function toggleFeatured(id) {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, is_featured: !b.is_featured } : b))
  }

  function removeBlock(id) {
    setBlocks(bs => bs.filter(b => b.id !== id))
    if (activeBlock === id) setActive(null)
  }

  function addBlock(type, label) {
    const block = { id: Date.now(), type, label, content: '', style: '{}', is_featured: false }
    setBlocks(bs => [...bs, block])
    setActive(block.id)
    setShowAdd(false)
  }

  function applyTemplate(template) {
    const newBlocks = template.blocks.map((b, i) => ({
      id: Date.now() + i, type: b.type, label: b.label, content: '', style: '{}', is_featured: false
    }))
    setBlocks(newBlocks)
    setMode('blocks')
  }

  async function handleSave() {
    setSaving(true)
    try {
      await savePortfolio({ title, category, description, theme, blocks, tags, avatar_url: avatarUrl, status })
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
      setBlocks(portfolio.blocks?.map(b => ({ ...b, style: b.style || '{}', is_featured: b.is_featured || false })) || [])
      setTheme(portfolio.theme || '{}')
      setTitle(portfolio.title || '')
      setCategory(portfolio.category || '')
      setAvatarUrl(portfolio.avatar_url || '')
      setDescription(portfolio.description || '')
      setStatus(portfolio.status || '')
      setTags(portfolio.tags || [])
    } else {
      setBlocks([])
    }
    setMode(null)
    setActive(null)
  }

  if (isLoading) return (
    <div className="text-center py-20 text-gray-400 text-sm">Загрузка...</div>
  )

  if (isEmpty && !isOwner) return (
    <div className="text-center py-20 text-gray-400 text-sm">Портфолио не найдено</div>
  )

  if (mode === 'template') return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">С чего начнём?</h1>
        <p className="text-gray-500 text-sm mt-1">Выбери шаблон под свою специализацию</p>
      </div>
      <div className="flex flex-col gap-3">
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => applyTemplate(t)}
            className="bg-white rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-all flex flex-col gap-2 border border-transparent hover:border-gray-200">
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

  const previewBlocks = mode ? blocks : (portfolio?.blocks || [])

  let themeData = {}
  try { themeData = JSON.parse(activeTheme) } catch {}
  const titleSizeMap = { lg: '1.125rem', xl: '1.5rem', '2xl': '1.875rem', '3xl': '2.25rem' }
  const paddingMap   = { compact: '16px', normal: '24px', spacious: '40px' }

  const headerStyle = {
    backgroundColor: themeData.header_bg     || 'white',
    borderRadius:    `${themeData.card_radius || 16}px`,
    boxShadow:       themeData.card_shadow !== false ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
    padding:         paddingMap[themeData.header_padding] || '24px',
    textAlign:       themeData.title_align   || 'left',
  }

  const titleStyle = {
    color:      themeData.accent_color || '#111111',
    fontSize:   titleSizeMap[themeData.title_size] || '1.5rem',
    fontWeight: 'bold',
  }

  const currentAvatarUrl  = mode ? avatarUrl    : (portfolio?.avatar_url  || '')
  const currentDescription = mode ? description : (portfolio?.description || '')
  const currentStatus      = mode ? status      : (portfolio?.status      || '')

  return (
    <div className="flex gap-6" style={{ alignItems: mode ? 'flex-start' : undefined }}>

      {/* ── Левая панель ── */}
      {mode && (
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 sticky top-6 max-h-screen overflow-y-auto pb-6">

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
                  <option value="video">Видеограф</option>
                  <option value="arch">Архитектор</option>
                  <option value="fashion">Стилист</option>
                </select>
                <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="Аватарка — ссылка на Imgur"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors w-full" />
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Короткое описание"
                  rows={2}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors w-full resize-none" />
                <input value={status} onChange={e => setStatus(e.target.value)}
                  placeholder="Статус: открыт к заказам, в отпуске..."
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors w-full" />

                <div className="flex flex-col gap-1.5 pt-1">
                  <p className="text-xs text-gray-400">Теги (через Enter)</p>
                  <div className="flex flex-wrap gap-1 min-h-6">
                    {tags.map(tag => (
                      <span key={tag}
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {tag}
                        <button onClick={() => setTags(ts => ts.filter(t => t !== tag))}
                          className="text-gray-400 hover:text-red-400 leading-none">✕</button>
                      </span>
                    ))}
                  </div>
                  <input
                    placeholder="Добавить тег..."
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors w-full"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const tag = e.target.value.trim().toLowerCase()
                        if (!tags.includes(tag)) setTags(ts => [...ts, tag])
                        e.target.value = ''
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {mode === 'blocks' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-400 px-1">
                ⭐ = показывать в превью на главной
              </p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  {blocks.map(block => (
                    <TOCBlock key={block.id} block={block}
                      isActive={activeBlock === block.id}
                      onSelect={() => setActive(id => id === block.id ? null : block.id)}
                      onRemove={() => removeBlock(block.id)}
                      onUpdate={updateBlock}
                      onUpdateStyle={updateBlockStyle}
                      onToggleFeatured={() => toggleFeatured(block.id)} />
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

      {/* ── Превью ── */}
      <div className="flex-1 min-w-0">
        <div className="max-w-2xl mx-auto flex flex-col"
          style={{ gap: 'var(--pt-spacing, 16px)', fontFamily: 'var(--pt-font, system-ui)' }}>

          {/* Заголовок */}
          <div style={headerStyle}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {currentAvatarUrl ? (
                  <img src={currentAvatarUrl}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow"
                    onError={e => { e.target.style.display = 'none' }} />
                ) : null}
                <div className="flex flex-col gap-1 min-w-0">
                  {(themeData.show_username !== false) && (
                    <p className="text-xs opacity-40">@{username}</p>
                  )}
                  <h1 style={titleStyle}>
                    {mode ? (title || 'Без названия') : (portfolio?.title || 'Без названия')}
                  </h1>
                  {currentStatus && (
                    <p className="text-xs text-emerald-600 italic">{currentStatus}</p>
                  )}
                  {currentDescription && (
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{currentDescription}</p>
                  )}
                  {(mode ? category : portfolio?.category) && (
                    <span className="text-xs px-3 py-1 rounded-full self-start mt-1"
                      style={{
                        backgroundColor: themeData.accent_color || '#111',
                        color: themeData.header_bg || '#fff',
                        opacity: 0.85,
                      }}>
                      {CATEGORY_LABELS[mode ? category : portfolio?.category]}
                    </span>
                  )}
                </div>
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
          </div>

          {previewBlocks.length === 0 && mode === 'blocks' && (
            <div className="p-12 text-center rounded-2xl bg-white">
              <p className="text-4xl mb-3">✨</p>
              <p className="text-gray-400 text-sm">Добавь первый блок слева</p>
            </div>
          )}

          <BlockRenderer
            blocks={previewBlocks}
            editMode={mode === 'blocks'}
            onEditStyle={id => setActive(id)}
          />
        </div>
      </div>
    </div>
  )
}
