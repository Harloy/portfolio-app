import { useEffect } from 'react'

const SPACING_MAP = { compact: '12px', normal: '16px', relaxed: '24px' }
const FONT_MAP    = { sans: 'system-ui, sans-serif', serif: 'Georgia, serif', mono: 'monospace' }

export function useTheme(themeJson) {
  useEffect(() => {
    const el = document.getElementById('portfolio-theme')
    if (!el) return

    let theme = {}
    try { theme = JSON.parse(themeJson || '{}') } catch {}

    const radius  = theme.card_radius  || '16'
    const spacing = SPACING_MAP[theme.spacing] || '16px'
    const font    = FONT_MAP[theme.font]       || FONT_MAP.sans
    const shadow  = theme.card_shadow !== false ? '0 2px 12px rgba(0,0,0,0.08)' : 'none'

    el.style.setProperty('--bg',      theme.bg_color     || '#ffffff')
    el.style.setProperty('--accent',  theme.accent_color || '#000000')
    el.style.setProperty('--text',    theme.text_color   || '#111111')
    el.style.setProperty('--radius',  `${radius}px`)
    el.style.setProperty('--spacing', spacing)
    el.style.setProperty('--font',    font)
    el.style.setProperty('--shadow',  shadow)
  }, [themeJson])
}
