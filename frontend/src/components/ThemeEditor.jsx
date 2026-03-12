import { HexColorPicker } from 'react-colorful'
import { useState } from 'react'

function ColorField({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="relative">
        <button onClick={() => setOpen(o => !o)}
          className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm"
          style={{ backgroundColor: value }} />
        {open && (
          <div className="absolute right-0 top-10 z-50 shadow-xl rounded-xl overflow-hidden">
            <HexColorPicker color={value} onChange={onChange} />
            <button onClick={() => setOpen(false)}
              className="w-full text-xs text-gray-400 py-2 bg-white hover:bg-gray-50">Готово</button>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="flex flex-col gap-3">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-wide font-medium">
        {title}
        <span className="text-gray-300">{open ? '▲' : '▼'}</span>
      </button>
      {open && children}
    </div>
  )
}

function OptionGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-1">
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`flex-1 py-1.5 rounded-lg text-xs transition-colors border
            ${value === o.value ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

const DEFAULTS = {
  bg_color: '#f9fafb', card_bg: '#ffffff',
  accent_color: '#111111', text_color: '#374151',
  font: 'sans', card_radius: '16', spacing: 'normal', card_shadow: true,
  header_bg: '#ffffff', header_padding: 'normal',
  title_size: 'xl', title_align: 'left',
  show_username: true,
}

export default function ThemeEditor({ value, onChange }) {
  let theme = { ...DEFAULTS }
  try { theme = { ...DEFAULTS, ...JSON.parse(value || '{}') } } catch {}

  function update(field, val) {
    onChange(JSON.stringify({ ...theme, [field]: val }))
  }

  return (
    <div className="flex flex-col gap-5 p-5 bg-white rounded-2xl shadow-sm">
      <h3 className="font-bold text-gray-900">Оформление</h3>

      {/* Цвета */}
      <Section title="Цвета">
        <ColorField label="Фон страницы"   value={theme.bg_color}     onChange={v => update('bg_color', v)} />
        <ColorField label="Фон карточек"   value={theme.card_bg}      onChange={v => update('card_bg', v)} />
        <ColorField label="Акцент"         value={theme.accent_color} onChange={v => update('accent_color', v)} />
        <ColorField label="Текст"          value={theme.text_color}   onChange={v => update('text_color', v)} />
        <ColorField label="Фон заголовка"  value={theme.header_bg}    onChange={v => update('header_bg', v)} />
      </Section>

      {/* Шрифт */}
      <Section title="Шрифт">
        <OptionGroup value={theme.font} onChange={v => update('font', v)}
          options={[
            { value: 'sans',  label: 'Современный' },
            { value: 'serif', label: 'Классический' },
            { value: 'mono',  label: 'Технический' },
          ]} />
      </Section>

      {/* Заголовок */}
      <Section title="Заголовок">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500">Размер названия</p>
          <OptionGroup value={theme.title_size} onChange={v => update('title_size', v)}
            options={[
              { value: 'lg',  label: 'S' },
              { value: 'xl',  label: 'M' },
              { value: '2xl', label: 'L' },
              { value: '3xl', label: 'XL' },
            ]} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500">Выравнивание</p>
          <OptionGroup value={theme.title_align} onChange={v => update('title_align', v)}
            options={[
              { value: 'left',   label: '⬅' },
              { value: 'center', label: '↔' },
              { value: 'right',  label: '➡' },
            ]} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500">Отступы заголовка</p>
          <OptionGroup value={theme.header_padding} onChange={v => update('header_padding', v)}
            options={[
              { value: 'compact', label: 'S' },
              { value: 'normal',  label: 'M' },
              { value: 'spacious', label: 'L' },
            ]} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">Показывать @username</p>
          <button onClick={() => update('show_username', !theme.show_username)}
            className={`w-10 h-5 rounded-full transition-colors relative ${theme.show_username ? 'bg-black' : 'bg-gray-200'}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm
              ${theme.show_username ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
      </Section>

      {/* Карточки */}
      <Section title="Карточки">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <p className="text-xs text-gray-500">Скругление</p>
            <p className="text-xs text-gray-400">{theme.card_radius}px</p>
          </div>
          <input type="range" min="0" max="32" value={theme.card_radius}
            onChange={e => update('card_radius', e.target.value)}
            className="w-full accent-black" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500">Отступы между блоками</p>
          <OptionGroup value={theme.spacing} onChange={v => update('spacing', v)}
            options={[
              { value: 'compact', label: 'S' },
              { value: 'normal',  label: 'M' },
              { value: 'relaxed', label: 'L' },
            ]} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">Тени</p>
          <button onClick={() => update('card_shadow', !theme.card_shadow)}
            className={`w-10 h-5 rounded-full transition-colors relative ${theme.card_shadow ? 'bg-black' : 'bg-gray-200'}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm
              ${theme.card_shadow ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
      </Section>

      {/* Превью */}
      <Section title="Превью">
        <div className="p-4 rounded-xl" style={{ backgroundColor: theme.bg_color }}>
          <div className="p-3" style={{
            backgroundColor: theme.card_bg,
            borderRadius: `${theme.card_radius}px`,
            boxShadow: theme.card_shadow ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            fontFamily: theme.font === 'serif' ? 'Georgia, serif' : theme.font === 'mono' ? 'monospace' : 'system-ui',
            textAlign: theme.title_align,
          }}>
            <p style={{ color: theme.accent_color, fontSize: '1rem', fontWeight: 'bold' }}>Название</p>
            <p style={{ color: theme.text_color, fontSize: '0.75rem', marginTop: '4px' }}>Пример текста</p>
          </div>
        </div>
      </Section>
    </div>
  )
}
