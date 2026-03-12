import { useState } from 'react'

const STEP_TYPES = [
  { value: 'image', label: '🖼 Картинка' },
  { value: 'video', label: '▶️ Видео' },
  { value: 'audio', label: '🎵 Аудио' },
  { value: 'text',  label: '📝 Текст' },
]

// Рендер содержимого одного этапа
function StepContent({ step }) {
  if (!step) return null

  if (step.type === 'image') {
    if (!step.content) return <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Нет изображения</div>
    return <img src={step.content} alt={step.label} className="w-full object-cover max-h-96" onError={e => { e.target.style.display = 'none' }} />
  }

  if (step.type === 'video') {
    if (!step.content) return <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Нет видео</div>
    let src = step.content
    const yt = step.content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    const vi = step.content.match(/vimeo\.com\/(\d+)/)
    if (yt) src = `https://www.youtube.com/embed/${yt[1]}`
    else if (vi) src = `https://player.vimeo.com/video/${vi[1]}`
    return (
      <div className="relative" style={{ paddingBottom: '56.25%' }}>
        <iframe src={src} className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen />
      </div>
    )
  }

  if (step.type === 'audio') {
    if (!step.content) return <div className="w-full h-20 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Нет аудио</div>
    const sc = step.content.includes('soundcloud.com')
    if (sc) return (
      <iframe
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(step.content)}&color=%23000000&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`}
        className="w-full border-0" height="120" />
    )
    return <audio controls src={step.content} className="w-full px-4 py-3" />
  }

  if (step.type === 'text') {
    if (!step.content) return null
    return (
      <div className="px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap">
        {step.content}
      </div>
    )
  }

  return null
}

// VIEW
export default function StepsBlock({ content, label, style }) {
  const [active, setActive] = useState(0)
  const [showAll, setShowAll] = useState(false)

  let data = { mode: 'buttons', steps: [] }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}

  const steps = data.steps || []
  if (!steps.length) return null

  const isSlider = data.mode === 'slider'
  const current = steps[active] || steps[0]

  // SLIDER
  if (isSlider) {
    return (
      <div className="overflow-hidden" style={style}>
        {label && <p className="text-xs opacity-50 uppercase tracking-wide p-4 pb-0">{label}</p>}

        <div className="relative">
          <StepContent step={current} />

          {/* Стрелки (только для image/video/audio — для текста не нужны) */}
          {current.type !== 'text' && (
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <button onClick={() => setActive(a => Math.max(0, a - 1))}
                disabled={active === 0}
                className="pointer-events-auto w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-20 hover:bg-black/60 transition-colors text-lg leading-none">
                ‹
              </button>
              <button onClick={() => setActive(a => Math.min(steps.length - 1, a + 1))}
                disabled={active === steps.length - 1}
                className="pointer-events-auto w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-20 hover:bg-black/60 transition-colors text-lg leading-none">
                ›
              </button>
            </div>
          )}

          {/* Точки */}
          {steps.length > 1 && current.type !== 'text' && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {steps.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === active ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          )}
        </div>

        {/* Описание */}
        {(current.description) && (
          <div className="px-5 py-3 flex flex-col gap-1 border-t border-gray-100">
            <p className="text-sm opacity-60 leading-relaxed">{current.description}</p>
          </div>
        )}

        {/* Навигация для текста */}
        {current.type === 'text' && steps.length > 1 && (
          <div className="flex items-center justify-between px-5 pb-3">
            <button onClick={() => setActive(a => Math.max(0, a - 1))}
              disabled={active === 0}
              className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors">
              ← Назад
            </button>
            <span className="text-xs text-gray-300">{active + 1} / {steps.length}</span>
            <button onClick={() => setActive(a => Math.min(steps.length - 1, a + 1))}
              disabled={active === steps.length - 1}
              className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors">
              Далее →
            </button>
          </div>
        )}
      </div>
    )
  }

  // BUTTONS
  return (
    <div className="overflow-hidden" style={style}>
      {label && <p className="text-xs opacity-50 uppercase tracking-wide p-4 pb-2">{label}</p>}

      {/* Кнопки */}
      <div className="px-4 flex flex-wrap gap-2 pb-3">
        {steps.map((step, i) => (
          <button key={i}
            onClick={() => { setActive(i); setShowAll(false) }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              !showAll && active === i ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {step.label || `${i + 1}`}
          </button>
        ))}
        <button onClick={() => setShowAll(a => !a)}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            showAll ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          Все этапы
        </button>
      </div>

      {/* Все этапы — сетка превью */}
      {showAll ? (
        <div className={`grid gap-0.5 ${steps.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {steps.map((step, i) => (
            <div key={i} className="relative cursor-pointer group"
              onClick={() => { setActive(i); setShowAll(false) }}>
              {step.type === 'image' && step.content
                ? <img src={step.content} alt={step.label}
                    className="w-full h-40 object-cover group-hover:opacity-90 transition-opacity" />
                : <div className={`w-full h-40 flex flex-col items-center justify-center gap-2 text-gray-400
                    ${step.type === 'video' ? 'bg-gray-900' : step.type === 'audio' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <span className="text-2xl">
                      {step.type === 'video' ? '▶️' : step.type === 'audio' ? '🎵' : '📝'}
                    </span>
                    <span className="text-xs px-3 text-center truncate w-full text-center opacity-60">
                      {step.label || STEP_TYPES.find(t => t.value === step.type)?.label}
                    </span>
                  </div>
              }
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1.5 flex items-center justify-between">
                <span className="truncate">{step.label || `Этап ${i + 1}`}</span>
                <span className="opacity-60 flex-shrink-0 ml-1">
                  {step.type === 'video' ? '▶' : step.type === 'audio' ? '♪' : step.type === 'text' ? 'T' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <StepContent step={current} />
          {current.description && (
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-sm opacity-60 leading-relaxed">{current.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// EDITOR
export function StepsEditor({ content, onChange }) {
  const [openStep, setOpenStep] = useState(null)

  let data = { mode: 'buttons', steps: [] }
  try { data = { ...data, ...JSON.parse(content || '{}') } } catch {}

  function update(field, value) {
    onChange(JSON.stringify({ ...data, [field]: value }))
  }

  function updateStep(i, field, value) {
    const steps = [...data.steps]
    steps[i] = { ...steps[i], [field]: value }
    update('steps', steps)
  }

  function addStep() {
    const steps = [...(data.steps || []), { label: `Этап ${(data.steps?.length || 0) + 1}`, type: 'image', content: '', description: '' }]
    update('steps', steps)
    setOpenStep(steps.length - 1)
  }

  function removeStep(i) {
    update('steps', data.steps.filter((_, idx) => idx !== i))
    if (openStep === i) setOpenStep(null)
  }

  function moveStep(i, dir) {
    const steps = [...data.steps]
    const j = i + dir
    if (j < 0 || j >= steps.length) return
    ;[steps[i], steps[j]] = [steps[j], steps[i]]
    update('steps', steps)
  }

  const placeholders = { image: 'https://imgur.com/...', video: 'https://youtube.com/...', audio: 'https://soundcloud.com/...', text: '' }

  return (
    <div className="flex flex-col gap-3">

      {/* Режим */}
      <div className="flex gap-2">
        {[{ v: 'buttons', l: '🔘 С кнопками' }, { v: 'slider', l: '◀▶ Слайдер' }].map(({ v, l }) => (
          <button key={v} onClick={() => update('mode', v)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              data.mode === v ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {/* Этапы */}
      <div className="flex flex-col gap-2">
        {(data.steps || []).map((step, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Заголовок этапа */}
            <div className="flex items-center gap-2 p-2.5">
              <span className="text-xs text-gray-400 w-4 text-center">{i + 1}</span>
              <input
                value={step.label || ''}
                onChange={e => updateStep(i, 'label', e.target.value)}
                placeholder={`Этап ${i + 1}`}
                className="flex-1 text-sm outline-none bg-transparent"
              />
              <span className="text-xs text-gray-400">
                {STEP_TYPES.find(t => t.value === step.type)?.label.split(' ')[0]}
              </span>
              <button onClick={() => moveStep(i, -1)} disabled={i === 0}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs px-1">↑</button>
              <button onClick={() => moveStep(i, 1)} disabled={i === data.steps.length - 1}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs px-1">↓</button>
              <button onClick={() => setOpenStep(openStep === i ? null : i)}
                className="text-gray-400 hover:text-gray-700 text-xs px-1">
                {openStep === i ? '▲' : '▼'}
              </button>
              <button onClick={() => removeStep(i)}
                className="text-gray-300 hover:text-red-400 text-xs px-1">✕</button>
            </div>

            {/* Поля этапа */}
            {openStep === i && (
              <div className="border-t border-gray-100 p-2.5 flex flex-col gap-2">
                {/* Тип */}
                <div className="flex gap-1.5 flex-wrap">
                  {STEP_TYPES.map(t => (
                    <button key={t.value} onClick={() => updateStep(i, 'type', t.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        step.type === t.value ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Контент */}
                {step.type === 'text'
                  ? <textarea
                      value={step.content || ''}
                      onChange={e => updateStep(i, 'content', e.target.value)}
                      placeholder="Текст этапа..."
                      rows={3}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors resize-none w-full"
                    />
                  : <input
                      value={step.content || ''}
                      onChange={e => updateStep(i, 'content', e.target.value)}
                      placeholder={placeholders[step.type] || ''}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors w-full"
                    />
                }

                {/* Описание (необязательно для текста) */}
                {step.type !== 'text' && (
                  <input
                    value={step.description || ''}
                    onChange={e => updateStep(i, 'description', e.target.value)}
                    placeholder="Подпись под этапом (необязательно)"
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors w-full"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={addStep}
        className="border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors">
        + Добавить этап
      </button>
    </div>
  )
}
