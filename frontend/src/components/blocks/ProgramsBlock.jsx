import { useState } from 'react'

const SOFTWARE_LIST = [
  { name: 'Photoshop',       slug: 'adobephotoshop',    color: '#31A8FF' },
  { name: 'Illustrator',     slug: 'adobeillustrator',  color: '#FF9A00' },
  { name: 'InDesign',        slug: 'adobeindesign',     color: '#FF3366' },
  { name: 'After Effects',   slug: 'adobeaftereffects', color: '#9999FF' },
  { name: 'Premiere Pro',    slug: 'adobepremierepro',  color: '#9999FF' },
  { name: 'XD',              slug: 'adobexd',           color: '#FF61F6' },
  { name: 'Lightroom',       slug: 'adobelightroom',    color: '#31A8FF' },
  { name: 'Audition',        slug: 'adobeaudition',     color: '#00E4BB' },
  { name: 'Figma',           slug: 'figma',             color: '#F24E1E' },
  { name: 'Sketch',          slug: 'sketch',            color: '#F7B500' },
  { name: 'Framer',          slug: 'framer',            color: '#0055FF' },
  { name: 'Webflow',         slug: 'webflow',           color: '#4353FF' },
  { name: 'Canva',           slug: 'canva',             color: '#00C4CC' },
  { name: 'Blender',         slug: 'blender',           color: '#F5792A' },
  { name: 'Cinema 4D',       slug: 'cinema4d',          color: '#011A6A' },
  { name: 'Maya',            slug: 'autodesk',          color: '#0696D7' },
  { name: '3ds Max',         slug: 'autodesk',          color: '#0696D7' },
  { name: 'ZBrush',          slug: 'pixologic',         color: '#4B4B4B' },
  { name: 'Houdini',         slug: 'houdini',           color: '#FF6600' },
  { name: 'Unity',           slug: 'unity',             color: '#000000' },
  { name: 'Unreal Engine',   slug: 'unrealengine',      color: '#0E1128' },
  { name: 'DaVinci Resolve', slug: 'davinciresolve',    color: '#233A51' },
  { name: 'Procreate',       slug: 'procreate',         color: '#000000' },
  { name: 'Clip Studio',     slug: 'clipstudiopaint',   color: '#CFE566' },
  { name: 'Krita',           slug: 'krita',             color: '#3BABFF' },
  { name: 'Paint Tool SAI',  slug: 'sai',               color: '#5BA3DC' },
  { name: 'Ableton Live',    slug: 'abletonlive',       color: '#000000' },
  { name: 'FL Studio',       slug: 'flstudio',          color: '#F07800' },
  { name: 'Logic Pro',       slug: 'logicpro',          color: '#000000' },
  { name: 'GarageBand',      slug: 'garageband',        color: '#FF6D00' },
  { name: 'SoundCloud',      slug: 'soundcloud',        color: '#FF5500' },
  { name: 'VS Code',         slug: 'visualstudiocode',  color: '#007ACC' },
  { name: 'Notion',          slug: 'notion',            color: '#000000' },
]

function ProgramIcon({ slug, color, size = 24 }) {
  const [err, setErr] = useState(false)
  if (!slug || err) return (
    <div style={{
      width: size, height: size, borderRadius: 4,
      backgroundColor: (color || '#888') + '22',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.55, color: color || '#888'
    }}>◆</div>
  )
  return (
    <img
      src={`https://cdn.simpleicons.org/${slug}/${(color || '888').replace('#', '')}`}
      width={size} height={size}
      style={{ objectFit: 'contain' }}
      onError={() => setErr(true)}
      alt=""
    />
  )
}

// VIEW
export default function ProgramsBlock({ content, label, style }) {
  let programs = []
  try { programs = JSON.parse(content) || [] } catch {}
  if (!programs.length) return null

  return (
    <div style={style} className="p-4">
      {label && <p className="text-xs opacity-50 uppercase tracking-wide mb-3">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {programs.map((prog, i) => (
          <div key={i}
            className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
            <ProgramIcon slug={prog.slug} color={prog.color} size={18} />
            <span className="text-sm text-gray-700 font-medium">{prog.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// EDITOR
export function ProgramsEditor({ content, onChange }) {
  const [search, setSearch] = useState('')
  let programs = []
  try { programs = JSON.parse(content) || [] } catch {}

  const trimmed = search.trim()
  const results = trimmed
    ? SOFTWARE_LIST.filter(s => s.name.toLowerCase().includes(trimmed.toLowerCase()))
    : SOFTWARE_LIST

  // Показываем кнопку "добавить как кастомное" если поиск не даёт точного совпадения
  const exactMatch = SOFTWARE_LIST.find(s => s.name.toLowerCase() === trimmed.toLowerCase())
  const alreadyAdded = programs.find(p => p.name.toLowerCase() === trimmed.toLowerCase())
  const showCustom = trimmed.length > 1 && !exactMatch && !alreadyAdded

  function addProgram(prog) {
    if (programs.find(p => p.name === prog.name)) return
    onChange(JSON.stringify([...programs, prog]))
    setSearch('')
  }

  function addCustom() {
    addProgram({ name: trimmed, slug: '', color: '#888888' })
  }

  function removeProgram(name) {
    onChange(JSON.stringify(programs.filter(p => p.name !== name)))
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Выбранные */}
      {programs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {programs.map((prog, i) => (
            <div key={i}
              className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5">
              <ProgramIcon slug={prog.slug} color={prog.color} size={16} />
              <span className="text-xs text-gray-700">{prog.name}</span>
              <button onClick={() => removeProgram(prog.name)}
                className="text-gray-400 hover:text-red-400 leading-none ml-0.5">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Поиск */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && showCustom) addCustom() }}
        placeholder="Поиск или своя программа..."
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors"
      />

      {/* Кнопка добавить кастомное */}
      {showCustom && (
        <button
          onClick={addCustom}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <span className="text-base">＋</span>
          Добавить «{trimmed}» без значка
        </button>
      )}

      {/* Список */}
      <div className="max-h-44 overflow-y-auto flex flex-col gap-0.5">
        {results.map(prog => {
          const added = programs.find(p => p.name === prog.name)
          return (
            <button key={prog.slug + prog.name}
              onClick={() => added ? removeProgram(prog.name) : addProgram(prog)}
              className={`flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                added ? 'opacity-40' : 'hover:bg-gray-50'
              }`}>
              <ProgramIcon slug={prog.slug} color={prog.color} size={20} />
              <span className="text-sm text-gray-700">{prog.name}</span>
              {added && <span className="ml-auto text-xs text-gray-400">✓</span>}
            </button>
          )
        })}
        {results.length === 0 && !showCustom && (
          <p className="text-xs text-gray-400 text-center py-3">Не найдено</p>
        )}
      </div>
    </div>
  )
}
