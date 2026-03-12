import { useEffect } from 'react'

const SPACING_MAP   = { compact: '12px', normal: '16px', relaxed: '24px' }
const FONT_MAP      = { sans: 'system-ui, sans-serif', serif: 'Georgia, serif', mono: 'monospace' }
const PADDING_MAP   = { compact: '16px', normal: '24px', spacious: '40px' }
const TITLE_SIZE    = { lg: '1.125rem', xl: '1.5rem', '2xl': '1.875rem', '3xl': '2.25rem' }

const DEFAULTS = {
  bg_color: '#f9fafb', card_bg: '#ffffff',
  accent_color: '#111111', text_color: '#374151',
  font: 'sans', card_radius: '16', spacing: 'normal', card_shadow: true,
  header_bg: '#ffffff', header_padding: 'normal',
  title_size: 'xl', title_align: 'left', show_username: true,
}

export function useTheme(themeJson) {
  useEffect(() => {
    let t = { ...DEFAULTS }
    try { t = { ...DEFAULTS, ...JSON.parse(themeJson || '{}') } } catch {}

    const root = document.documentElement
    const vars = {
      '--pt-bg':             t.bg_color,
      '--pt-card-bg':        t.card_bg,
      '--pt-accent':         t.accent_color,
      '--pt-text':           t.text_color,
      '--pt-radius':         `${t.card_radius}px`,
      '--pt-spacing':        SPACING_MAP[t.spacing]       || '16px',
      '--pt-font':           FONT_MAP[t.font]             || FONT_MAP.sans,
      '--pt-shadow':         t.card_shadow !== false ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
      '--pt-header-bg':      t.header_bg,
      '--pt-header-padding': PADDING_MAP[t.header_padding] || '24px',
      '--pt-title-size':     TITLE_SIZE[t.title_size]     || '1.5rem',
      '--pt-title-align':    t.title_align                || 'left',
    }
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))

    return () => Object.keys(vars).forEach(k => root.style.removeProperty(k))
  }, [themeJson])
}
