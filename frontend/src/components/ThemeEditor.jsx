import { HexColorPicker } from 'react-colorful'
import { useState } from 'react'

const FONTS = [
  { value: 'sans',  label: 'Современный' },
  { value: 'serif', label: 'Классический' },
  { value: 'mono',  label: 'Технический' },
]

const SPACINGS = [
  { value: 'compact', label: 'Компактно' },
  { value: 'normal',  label: 'Нормально' },
  { value: 'relaxed', label: 'Просторно' },
]

function ColorPicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm"
          style={{ backgroundColor: value }}
        />
        {open && (
          <div className="absolute right-0 top-10 z-50 shadow-xl rounded-xl overflow-hidden">
            <HexColorPicker color={value} onChange={onChange} />
            <button
              onClick={() => setOpen(false)}
              className="w-full text-xs text-gray-400 py-2 bg-white hover:bg-gray-50"
            >
              Готово
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const DEFAULTS = {
  bg_color:     '#ffffff',
  accent_color: '#000000',
  text_color:   '#111111',
  font:         'sans',
  card_radius:  '16',
  spacing:      'normal',
  card_shadow:  true,
}

export default function ThemeEditor({ value, onChange }) {
  let theme = DEFAULTS
  try { theme = { ...DEFAULTS, ...JSON.parse(value || '{}') } } catch {}

  function update(field, val) {
    onChange(JSON.stringify({ ...theme, [field]: val }))
  }

  return (
    <div className="flex flex-col gap-5 p-5 bg-white rounded-2xl shadow-sm">
      <h3 className="font-bold text-gray-900">Оформление</h3>

      {/* Цвета */}
      <div className="flex flex-col gap-3">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Цвета</p>
        <ColorPicker label="Фон"       value={theme.bg_color}     onChange={v => update('bg_color', v)} />
        <ColorPicker label="Акцент"    value={theme.accent_color} onChange={v => update('accent_color', v)} />
        <ColorPicker label="Текст"     value={theme.text_color}   onChange={v => update('text_color', v)} />
      </div>

      {/* Шрифт */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Шрифт</p>
        <div className="flex gap-2">
          {FONTS.map(f => (
            <button key={f.value} onClick={() => update('font', f.value)}
              className={`flex-1 py-2 rounded-xl text-sm border transition-colors
                ${theme.font === f.value ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              style={{ fontFamily: f.value === 'serif' ? 'serif' : f.value === 'mono' ? 'monospace' : 'sans-serif' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Скругление карточек */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Скругление</p>
          <p className="text-xs text-gray-400">{theme.card_radius}px</p>
        </div>
        <input type="range" min="0" max="32" value={theme.card_radius}
          onChange={e => update('card_radius', e.target.value)}
          className="w-full accent-black" />
      </div>

      {/* Отступы */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Отступы</p>
        <div className="flex gap-2">
          {SPACINGS.map(s => (
            <button key={s.value} onClick={() => update('spacing', s.value)}
              className={`flex-1 py-2 rounded-xl text-sm border transition-colors
                ${theme.spacing === s.value ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Тень карточек */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">Тени карточек</p>
        <button onClick={() => update('card_shadow', !theme.card_shadow)}
          className={`w-11 h-6 rounded-full transition-colors relative ${theme.card_shadow ? 'bg-black' : 'bg-gray-200'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm
            ${theme.card_shadow ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {/* Превью */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Превью</p>
        <div className="p-4 rounded-xl" style={{ backgroundColor: theme.bg_color }}>
          <div
            className="p-3"
            style={{
              backgroundColor: theme.bg_color,
              borderRadius: `${theme.card_radius}px`,
              boxShadow: theme.card_shadow ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              fontFamily: theme.font === 'serif' ? 'serif' : theme.font === 'mono' ? 'monospace' : 'sans-serif',
            }}
          >
            <p style={{ color: theme.accent_color }} className="font-bold text-sm">Заголовок</p>
            <p style={{ color: theme.text_color }} className="text-xs mt-1">Пример текста портфолио</p>
          </div>
        </div>
      </div>
    </div>
  )
}
