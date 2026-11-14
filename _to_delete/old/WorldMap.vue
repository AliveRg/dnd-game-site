<script setup lang="ts">
// Карта миров на Leaflet поверх своей картинки (CRS.Simple — координаты в пикселях картинки).
// Картинку меняешь в MAP_IMG (можно svg/webp), размер — MAP_W×MAP_H.
import type * as Leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'
// leaflet трогает window — грузим только в браузере
let L: typeof Leaflet

const MAP_IMG = '/images/world-map.webp'
const MAP_W = 2000
const MAP_H = 1400

interface Game { slug: string; title: string; excerpt: string; meta: any }
const props = defineProps<{ games: Game[]; editable?: boolean; focus?: string | null }>()
const emit = defineEmits<{ place: [{ x: number; y: number }]; ready: [] }>()

const el = ref<HTMLDivElement>()
const router = useRouter()
let map: Leaflet.Map | null = null
let ro: ResizeObserver | undefined
const markers = new Map<string, Leaflet.Marker>()

const toLatLng = (x: number, y: number) => L.latLng(MAP_H - y, x)

function icon(g: Game) {
  const c = g.meta?.accent || '#f0a040'
  return L.divIcon({
    className: 'world-pin',
    html: `<span style="--c:${c}"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  })
}

function popupHtml(g: Game) {
  const m = g.meta || {}
  const esc = (s: string) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!)
  return `<div class="wp">
    ${m.series ? `<p class="wp-s">${esc(m.series)}</p>` : ''}
    <p class="wp-t">${esc(g.title)}</p>
    <p class="wp-m">${esc(m.kind || '')} · ${esc(m.system || '')} · 👥 ${esc(m.players || '')}${m.adult ? ' · 18+' : ''}</p>
    <p class="wp-e">${esc(g.excerpt)}</p>
    <div class="wp-b"><a data-to="/games/${g.slug}">Подробнее</a><a data-to="#booking" class="wp-cta">Записаться</a></div>
  </div>`
}

function draw() {
  if (!map) return
  markers.forEach((m) => m.remove())
  markers.clear()
  for (const g of props.games) {
    const p = g.meta?.map
    if (!p) continue
    const mk = L.marker(toLatLng(p.x, p.y), { icon: icon(g), title: g.title }).addTo(map)
    if (!props.editable) mk.bindPopup(popupHtml(g), { maxWidth: 280, className: 'world-popup', autoPanPaddingTopLeft: L.point(20, 140), autoPanPaddingBottomRight: L.point(20, 20) })
    else mk.bindTooltip(g.title)
    markers.set(g.slug, mk)
  }
}

onMounted(async () => {
  L = (await import('leaflet')).default
  await nextTick()
  if (!el.value) return
  const bounds = L.latLngBounds([0, 0], [MAP_H, MAP_W])
  map = L.map(el.value!, { crs: L.CRS.Simple, minZoom: -4, maxZoom: 1, zoomSnap: 0.25, attributionControl: false, maxBounds: bounds.pad(0.5) })
  L.imageOverlay(MAP_IMG, bounds).addTo(map)
  map.fitBounds(bounds)
  // контейнер меняет размер (мобилка, поворот экрана) — пересчитываем и снова вписываем карту
  let touched = false
  map.on('dragstart zoomstart', () => (touched = true))
  ro = new ResizeObserver(() => { map?.invalidateSize(); if (!touched) map?.fitBounds(bounds) })
  ro.observe(el.value)
  draw()
  emit('ready')

  // ссылки в попапе — через роутер, без перезагрузки
  map.on('popupopen', (e) => {
    e.popup.getElement()?.querySelectorAll<HTMLAnchorElement>('a[data-to]').forEach((a) =>
      a.addEventListener('click', (ev) => {
        ev.preventDefault()
        const to = a.dataset.to!
        if (to.startsWith('#')) document.querySelector(to)?.scrollIntoView({ behavior: 'smooth' })
        else router.push(to)
      })
    )
  })
  if (props.editable) {
    map.on('click', (e) => {
      const x = Math.round(e.latlng.lng)
      const y = Math.round(MAP_H - e.latlng.lat)
      if (x < 0 || y < 0 || x > MAP_W || y > MAP_H) return // клик мимо картинки
      emit('place', { x, y })
    })
  }
})

watch(() => props.games, draw, { deep: true })
watch(() => props.focus, (slug) => {
  const m = slug && markers.get(slug)
  if (m && map) { map.flyTo(m.getLatLng(), 0, { duration: 0.8 }); if (!props.editable) m.openPopup() }
})
onBeforeUnmount(() => { ro?.disconnect(); map?.remove() })
</script>

<template>
  <div ref="el" class="h-full w-full rounded-2xl border border-wood-2 bg-ink" />
</template>

<style>
.world-pin span { display: block; width: 28px; height: 28px; border-radius: 50%; background: radial-gradient(circle, #fff6 0 20%, var(--c) 22% 60%, #120d0a 62%); box-shadow: 0 0 0 3px #f0a040, 0 0 18px 6px #f0a04088; cursor: pointer; transition: transform .2s; }
.world-pin:hover span { transform: scale(1.15); }
@keyframes pin { 50% { box-shadow: 0 0 0 3px #f0a040, 0 0 26px 10px #f0a040aa; } }
@media (prefers-reduced-motion: reduce) { .world-pin span { animation: none; } }
.world-popup .leaflet-popup-content-wrapper, .world-popup .leaflet-popup-tip { background: linear-gradient(180deg,#1d1410f2,#130b09f7), url('/textures/wood.webp') center / 400px; color: #f1e6cf; border: 1px solid #f0a04066; }
.world-popup .leaflet-popup-content { margin: 14px 16px; font-family: var(--font-sans); }
.wp-s { color: #f0a040; font-size: 11px; text-transform: uppercase; letter-spacing: .1em; margin: 0; }
.wp-t { font-family: var(--font-display); font-size: 22px; margin: 2px 0 4px; }
.wp-m { color: #a89a85; font-size: 12px; margin: 0 0 6px; }
.wp-e { font-size: 13px; margin: 0 0 10px; }
.wp-b { display: flex; gap: 8px; }
.wp-b a { cursor: pointer; padding: 6px 10px; border-radius: 8px; border: 1px solid #2a2019; color: #efe3c8 !important; text-decoration: none; font-size: 13px; }
.wp-b a.wp-cta { background: url('/textures/gold-band.webp') center / cover, #f0a040; color: #120d0a !important; font-weight: 600; border-color: #f0a040; }
.leaflet-container { background: #130b09; font-family: var(--font-sans); }
.leaflet-tooltip { background: #1d1410; color: #f1e6cf; border: 1px solid #f0a04099; box-shadow: 0 6px 16px #000a; }
.leaflet-bar a { background: #1d1410 !important; color: #f0a040 !important; border-color: #33241b !important; }
</style>
