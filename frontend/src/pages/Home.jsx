import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getHomeData, getTagsByProfession } from '../api/portfolio'
import SpecialistCard from '../components/SpecialistCard'
import { PROFESSIONS, professionLabel } from '../config/professions'

async function detectCity() {
  if (navigator.geolocation) {
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 })
      )
      const { latitude, longitude } = pos.coords
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { 'Accept-Language': 'ru' } }
      )
      const d = await r.json()
      return d.address?.city || d.address?.town || d.address?.village || ''
    } catch {}
  }
  try {
    const r = await fetch('http://ip-api.com/json/?fields=city,status&lang=ru')
    const d = await r.json()
    if (d.status === 'success') return d.city || ''
  } catch {}
  return ''
}

// Извлекаем превью из блоков портфолио
function extractPreviews(portfolio) {
  const blocks = portfolio.blocks || []
  const previews = []

  for (const block of blocks) {
    if (previews.length >= 3) break
    const c = block.content || ''

    if (block.type === 'image') {
      // image — просто строка URL
      const src = c.trim()
      if (src.startsWith('http')) previews.push(src)
    }

    if (block.type === 'video') {
      let url = c.trim()
      try { url = JSON.parse(c)?.url || c } catch {}
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
      if (ytMatch) previews.push(`https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`)
    }

    if (block.type === 'case') {
      try {
        const data = JSON.parse(c)
        const img = data?.images?.[0]
        if (img && img.startsWith('http')) previews.push(img)
      } catch {}
    }
  }

  return previews
}



function Column({ title, items, onClickItem, loading, emptyText }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-bold text-gray-900">{title}</h2>
      {loading && [1,2,3].map(i => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="h-16 bg-gray-100 animate-pulse" />
          <div className="p-3 flex flex-col gap-2">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
          </div>
        </div>
      ))}
      {!loading && items?.map(p => (
        <SpecialistCard key={p.id} portfolio={p} onClick={() => onClickItem(p)} />
      ))}
      {!loading && !items?.length && (
        <p className="text-xs text-gray-400 py-6 text-center bg-white rounded-2xl">
          {emptyText || 'Пусто'}
        </p>
      )}
    </div>
  )
}

function TagPill({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs border transition-colors flex-shrink-0 ${
        active ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
      }`}>
      {label}
    </button>
  )
}

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState('')
  function addTag(value) {
    const tag = value.trim().toLowerCase()
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setInput('')
  }
  return (
    <div className="flex flex-col gap-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tag}
              <button onClick={() => onChange(tags.filter(t => t !== tag))}
                className="text-gray-400 hover:text-red-400 leading-none">✕</button>
            </span>
          ))}
        </div>
      )}
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ',') && input.trim()) { e.preventDefault(); addTag(input) }
          if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1))
        }}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={placeholder || 'Тег через Enter...'}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Фильтры из URL
  const profession  = searchParams.get('prof') || ''
  const filterCity  = searchParams.get('city') || ''
  const filterMetro = searchParams.get('metro') || ''
  const tags = searchParams.get('tags') ? searchParams.get('tags').split(',').filter(Boolean) : []

  function setFilter(key, value) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    }, { replace: true })
  }

  function setTags(newTags) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (newTags.length) next.set('tags', newTags.join(','))
      else next.delete('tags')
      return next
    }, { replace: true })
  }

  function setProfession(val) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (val) next.set('prof', val)
      else next.delete('prof')
      next.delete('tags') // сброс тегов при смене профессии
      return next
    }, { replace: true })
  }

  function clearAll() {
    setSearchParams({}, { replace: true })
  }

  const [geoCity, setGeoCity]       = useState('')
  const [geoLoading, setGeoLoading] = useState(true)
  const [showLocation, setShowLoc]  = useState(false)

  useEffect(() => {
    detectCity().then(c => { setGeoCity(c); setGeoLoading(false) })
  }, [])

  const nearbyCity = filterCity || geoCity

  const filters = {
    category: profession,
    tags: tags.join(','),
    metro: filterMetro,
  }

  const { data: topData, isLoading: topLoading } = useQuery({
    queryKey: ['home-top', filters],
    queryFn:  () => getHomeData({ ...filters, sort: 'score', limit: 6 }),
  })

  const { data: nearbyData, isLoading: nearbyLoading } = useQuery({
    queryKey: ['home-nearby', filters, nearbyCity],
    queryFn:  () => getHomeData({ ...filters, city: nearbyCity, sort: 'nearby', limit: 6 }),
    enabled:  !geoLoading,
  })

  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['home-recent', filters],
    queryFn:  () => getHomeData({ ...filters, sort: 'recent', limit: 6 }),
  })

  const { data: profTags = [] } = useQuery({
    queryKey: ['tags', profession],
    queryFn:  () => getTagsByProfession(profession),
  })

  const profTagsSet = new Set(profTags)
  const selectedProfTags = tags.filter(t => profTagsSet.has(t))
  const customTags       = tags.filter(t => !profTagsSet.has(t))

  function toggleProfTag(tag) {
    setTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag])
  }

  function setCustomTags(custom) {
    setTags([...selectedProfTags, ...custom])
  }

  const hasFilters = profession || tags.length || filterCity || filterMetro

  function goToPortfolio(p) {
    navigate(`/portfolio/${p.id}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Фильтры */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-4">

        {/* Профессия */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400">Профессия</p>
          <div className="flex gap-2 flex-wrap">
            <TagPill label="Все" active={!profession} onClick={() => setProfession('')} />
            {PROFESSIONS.map(p => (
              <TagPill key={p.value} label={p.label} active={profession === p.value}
                onClick={() => setProfession(p.value)} />
            ))}
          </div>
        </div>

        {/* Теги */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400">Специализация</p>
          {profession && profTags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-1">
              {profTags.map(tag => (
                <TagPill key={tag} label={tag} active={selectedProfTags.includes(tag)}
                  onClick={() => toggleProfTag(tag)} />
              ))}
            </div>
          )}
          <TagInput tags={customTags} onChange={setCustomTags} placeholder="Свой тег через Enter..." />
        </div>

        {/* Местоположение */}
        <div className="flex flex-col gap-2">
          <button onClick={() => setShowLoc(s => !s)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 transition-colors self-start">
            📍 Местоположение
            {(filterCity || filterMetro) && (
              <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                {[filterCity, filterMetro].filter(Boolean).join(' · ')}
              </span>
            )}
            {!filterCity && geoCity && !geoLoading && (
              <span className="text-gray-300 text-xs">{geoCity}</span>
            )}
            <span className="text-gray-300">{showLocation ? '▲' : '▼'}</span>
          </button>

          {showLocation && (
            <div className="flex flex-col gap-2 border border-gray-100 rounded-xl p-3">
              <div className="flex gap-2 items-center">
                <input value={filterCity} onChange={e => setFilter('city', e.target.value)}
                  placeholder="Город"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
                {geoCity && filterCity !== geoCity && (
                  <button onClick={() => setFilter('city', geoCity)}
                    className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-400 transition-colors flex-shrink-0">
                    📍 {geoCity}
                  </button>
                )}
                {filterCity && (
                  <button onClick={() => setFilter('city', '')}
                    className="text-gray-300 hover:text-gray-600">✕</button>
                )}
              </div>
              <input value={filterMetro} onChange={e => setFilter('metro', e.target.value)}
                placeholder="Метро (уточняет поиск)"
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black transition-colors" />
              <p className="text-xs text-gray-300">Пустые поля = весь мир · Только город = весь город</p>
            </div>
          )}
        </div>

        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-700 self-start transition-colors">
            ✕ Сбросить фильтры
          </button>
        )}
      </div>

      {/* Три колонки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Column title="🔥 Популярные"
          items={topData?.top} loading={topLoading}
          onClickItem={goToPortfolio} emptyText="Пока никого нет" />
        <Column
          title={nearbyCity ? `📍 Рядом · ${nearbyCity}` : '📍 Рядом'}
          items={nearbyData?.nearby} loading={nearbyLoading || geoLoading}
          onClickItem={goToPortfolio}
          emptyText={nearbyCity ? `Никого нет в ${nearbyCity}` : 'Разреши геолокацию или введи город'} />
        <Column title="🆕 Новые"
          items={recentData?.recent} loading={recentLoading}
          onClickItem={goToPortfolio} emptyText="Пока никого нет" />
      </div>
    </div>
  )
}
