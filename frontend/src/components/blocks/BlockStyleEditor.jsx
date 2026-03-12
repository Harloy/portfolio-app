import { HexColorPicker } from 'react-colorful'
import { useState } from 'react'

function ColorField({ label, value, onChange, allowEmpty }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="relative flex items-center gap-1.5">
        {allowEmpty && value && (
          <button onClick={() => onChange('')}
            className="text-xs text-gray-300 hover:text-gray-500">✕</button>
        )}
        <button onClick={() => setOpen(o => !o)}
          className="w-7 h-7 rounded-lg border border-gray-200 shadow-sm"
          style={{ backgroundColor: value || 'transparent',
            backgroundImage: !value ? 'repeating-linear-gradient(45deg,#ddd 0,#ddd 1px,transparent 0,transparent 50%)' : undefined,
            backgroundSize: '6px 6px' }}
        />
        {open && (
          <div className="absolute right-0 top-9 z-50 shadow-xl rounded-xl overflow-hidden">
            <HexColorPicker color={value || '#ffffff'} onChange={onChange} />
            <button onClick={() => setOpen(false)}
              className="w-full text-xs text-gray-400 py-2 bg-white hover:bg-gray-50">Готово</button>
          </div>
        )}
      </div>
    </div>
  )
}

function OptionGroup({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="flex gap-1">
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)}
            className={`flex-1 py-1.5 rounded-lg text-xs transition-colors border
              ${value === o.value ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-500 hover:bg-white'}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const DEFAULTS = { bg: '', text: '', padding: '20px', radius: '16px', align: 'left', size: 'md', border: '', shadow: true }

export default function BlockStyleEditor({ style, onChange }) {
  let s = { ...DEFAULTS }
  try { s = { ...DEFAULTS, ...JSON.parse(style || '{}') } } catch {}

  function update(field, value) {
    onChange(JSON.stringify({ ...s, [field]: value }))
  }

  return (
    <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Стиль блока</p>

      {/* Цвета */}
      <ColorField label="Фон блока"    value={s.bg}   onChange={v => update('bg', v)}   allowEmpty />
      <ColorField label="Цвет текста"  value={s.text} onChange={v => update('text', v)} allowEmpty />

      {/* Выравнивание */}
      <OptionGroup label="Выравнивание" value={s.align} onChange={v => update('align', v)}
        options={[
          { value: 'left',   label: '⬅' },
          { value: 'center', label: '↔' },
          { value: 'right',  label: '➡' },
        ]} />

      {/* Размер текста */}
      <OptionGroup label="Размер текста" value={s.size} onChange={v => update('size', v)}
        options={[
          { value: 'sm', label: 'S' },
          { value: 'md', label: 'M' },
          { value: 'lg', label: 'L' },
        ]} />

      {/* Отступы */}
      <OptionGroup label="Отступы" value={s.padding} onChange={v => update('padding', v)}
        options={[
          { value: '0',    label: 'Нет' },
          { value: '12px', label: 'S' },
          { value: '20px', label: 'M' },
          { value: '32px', label: 'L' },
        ]} />

      {/* Скругление */}
      <OptionGroup label="Скругление" value={s.radius} onChange={v => update('radius', v)}
        options={[
          { value: '0px',  label: '▢' },
          { value: '8px',  label: 'S' },
          { value: '16px', label: 'M' },
          { value: '24px', label: 'L' },
        ]} />

      {/* Обводка */}
      <OptionGroup label="Обводка" value={s.border || ''} onChange={v => update('border', v)}
        options={[
          { value: '',                          label: 'Нет' },
          { value: '1px solid rgba(0,0,0,0.1)', label: 'Лёгкая' },
          { value: '1px solid rgba(0,0,0,0.3)', label: 'Средняя' },
          { value: '2px solid currentColor',    label: 'Акцент' },
        ]} />

      {/* Тень */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Тень</p>
        <button onClick={() => update('shadow', !s.shadow)}
          className={`w-10 h-5 rounded-full transition-colors relative ${s.shadow ? 'bg-black' : 'bg-gray-200'}`}>
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm
            ${s.shadow ? 'left-5' : 'left-0.5'}`} />
        </button>
      </div>

      <button onClick={() => onChange('{}')}
        className="text-xs text-gray-400 hover:text-red-400 text-left transition-colors pt-1 border-t border-gray-200">
        Сбросить стиль блока
      </button>
    </div>
  )
}
