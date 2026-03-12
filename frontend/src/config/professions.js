export const PROFESSIONS = [
  { value: 'illustr',  label: 'Художник / Иллюстратор' },
  { value: 'design',   label: 'Дизайнер' },
  { value: 'photo',    label: 'Фотограф' },
  { value: 'motion',   label: 'Аниматор / Моушн' },
  { value: 'music',    label: 'Музыкант' },
  { value: 'video',    label: 'Видеограф' },
  { value: 'arch',     label: 'Архитектор' },
  { value: 'fashion',  label: 'Стилист / Модельер' },
]

export function professionLabel(value) {
  return PROFESSIONS.find(p => p.value === value)?.label || value
}