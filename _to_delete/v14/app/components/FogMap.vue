<script setup lang="ts">
// «Туман войны»: карта сюжета открывается по частям по мере заполнения стола.
// ratio 0..1 - доля занятых мест. Части карты открываются в случайном (но стабильном для сюжета) порядке.
const props = withDefaults(defineProps<{ image: string; ratio: number; seed: string; point?: { x: number; y: number } | null; regions?: number }>(), { regions: 12, point: null })

const box = ref<HTMLDivElement>()
const cvs = ref<HTMLCanvasElement>()
import { MAP_W, MAP_H } from '#shared/map-zones'

// Если своей карты у сюжета нет - показываем кусок карты миров вокруг его точки (zoom ×2)
const imgStyle = computed(() => {
  if (!props.point) return { inset: '0', width: '100%', height: '100%', objectFit: 'cover' as const }
  const px = (props.point.x / MAP_W) * 100
  const py = (props.point.y / MAP_H) * 100
  const left = Math.min(0, Math.max(-100, 25 - px)) // ширина 200% → сдвигаем, чтобы точка была ближе к центру
  const top = Math.min(0, Math.max(-100, 25 - py))
  return { width: '200%', height: '200%', left: `${left * 2}%`, top: `${top * 2}%` }
})

function rng(str: string) {
  let h = 2166136261
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296
}

const holes = computed(() => {
  const r = rng(props.seed)
  const cols = 4
  const rows = Math.ceil(props.regions / cols)
  const list = Array.from({ length: props.regions }, (_, i) => ({
    x: ((i % cols) + 0.5 + (r() - 0.5) * 0.6) / cols,
    y: (Math.floor(i / cols) + 0.5 + (r() - 0.5) * 0.6) / rows,
    k: r()
  }))
  return list.sort((a, b) => a.k - b.k)
})
const target = computed(() => (props.ratio >= 1 ? props.regions : Math.min(props.regions - 1, 2 + Math.round(props.ratio * (props.regions - 3)))))

let shown = 0
let raf = 0
function draw(progress: number) {
  const c = cvs.value
  const b = box.value
  if (!c || !b) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = b.clientWidth
  const h = b.clientHeight
  if (c.width !== w * dpr) { c.width = w * dpr; c.height = h * dpr }
  const ctx = c.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
  ctx.clearRect(0, 0, w, h)
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#0d0907f2'); g.addColorStop(1, '#1d1611f5')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'destination-out'
  const radius = Math.max(w, h) / 3.2
  holes.value.forEach((p, i) => {
    const a = Math.max(0, Math.min(1, progress - i))
    if (a <= 0) return
    const rg = ctx.createRadialGradient(p.x * w, p.y * h, 0, p.x * w, p.y * h, radius * (0.6 + 0.4 * a))
    rg.addColorStop(0, `rgba(0,0,0,${a})`); rg.addColorStop(0.55, `rgba(0,0,0,${0.85 * a})`); rg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = rg
    ctx.fillRect(0, 0, w, h)
  })
}
function animate() {
  cancelAnimationFrame(raf)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const to = target.value
  const step = () => {
    shown = reduce ? to : Math.min(to, shown + 0.06)
    draw(shown)
    if (shown < to) raf = requestAnimationFrame(step)
  }
  step()
}
let ro: ResizeObserver | undefined
onMounted(() => {
  // анимация стартует, когда блок появился на экране
  const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { animate(); io.disconnect() } }, { threshold: 0.3 })
  io.observe(box.value!)
  ro = new ResizeObserver(() => draw(shown))
  ro.observe(box.value!)
  draw(0)
})
watch(target, animate)
onBeforeUnmount(() => { cancelAnimationFrame(raf); ro?.disconnect() })
</script>

<template>
  <div ref="box" class="relative aspect-[10/7] overflow-hidden rounded-2xl border border-wood-2 bg-ink">
    <img :src="image" alt="Карта сюжета" class="absolute max-w-none select-none" :style="imgStyle" loading="lazy" draggable="false" />
    <canvas ref="cvs" class="absolute inset-0 h-full w-full" aria-hidden="true" />
    <slot />
  </div>
</template>
