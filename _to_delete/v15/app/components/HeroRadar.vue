<script setup lang="ts">
// Радар-шестиугольник характеристик (0-20). Значения плавно «перетекают» при новом броске.
import { ABILITIES } from '#shared/hero-rules'
const props = defineProps<{ values: number[]; color?: string }>()
const shown = ref(props.values.map(() => 0))
let raf = 0
watch(
  () => props.values.join(','),
  () => {
    if (import.meta.server) { shown.value = [...props.values]; return }
    cancelAnimationFrame(raf)
    const from = [...shown.value], to = props.values, t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 700), e = 1 - Math.pow(1 - t, 3)
      shown.value = from.map((f, i) => f + ((to[i] ?? 0) - f) * e)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
  },
  { immediate: true }
)
onBeforeUnmount(() => import.meta.client && cancelAnimationFrame(raf))
const R = 84, C = 110
const pt = (i: number, v: number) => { const a = -Math.PI / 2 + (i * Math.PI) / 3; return [C + Math.cos(a) * R * (v / 20), C + Math.sin(a) * R * (v / 20)] as const }
const ring = (v: number) => ABILITIES.map((_, i) => pt(i, v).join(',')).join(' ')
const poly = computed(() => shown.value.map((v, i) => pt(i, v).join(',')).join(' '))
</script>

<template>
  <svg viewBox="0 0 220 220" class="hero-radar" role="img" :aria-label="`Характеристики: ${ABILITIES.map((a, i) => `${a.short} ${values[i]}`).join(', ')}`">
    <polygon v-for="v in [20, 15, 10, 5]" :key="v" :points="ring(v)" fill="none" stroke="#ffffff1f" stroke-width="1" />
    <line v-for="(_, i) in ABILITIES" :key="'l' + i" :x1="C" :y1="C" :x2="pt(i, 20)[0]" :y2="pt(i, 20)[1]" stroke="#ffffff14" />
    <polygon :points="ring(10)" fill="none" stroke="#ffffff40" stroke-dasharray="3 3" />
    <polygon :points="poly" :fill="color || '#DF0000'" fill-opacity=".28" :stroke="color || '#DF0000'" stroke-width="2.5" stroke-linejoin="round" />
    <circle v-for="(v, i) in shown" :key="'p' + i" :cx="pt(i, v)[0]" :cy="pt(i, v)[1]" r="3.5" :fill="color || '#DF0000'" />
    <text v-for="(a, i) in ABILITIES" :key="a.id" :x="pt(i, 24.5)[0]" :y="pt(i, 24.5)[1] + 4" text-anchor="middle" class="hr-lbl">{{ a.short }} {{ values[i] || '' }}</text>
  </svg>
</template>

<style>
.hero-radar { width: 100%; height: auto; overflow: visible; }
.hr-lbl { font: 700 10px var(--font-sans); fill: #EEE5CE; letter-spacing: .04em; }
</style>
