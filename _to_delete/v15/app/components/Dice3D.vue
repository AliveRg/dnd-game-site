<script setup lang="ts">
// 3D-кубик d20 в плоском векторном стиле: красные грани (цвет D&D), ступенчатый свет, тёмный контур.
// three.js грузится лениво, только в браузере. Если WebGL нет - показываем плоскую картинку.
// Использование: <Dice3D ref="dice" @click="..." />  →  await dice.value.roll(17)  // или roll() - случайно
import type * as THREE_NS from 'three'

const props = withDefaults(defineProps<{ size?: string; initial?: number; label?: string }>(), { size: '220px', initial: 20, label: 'Бросить кубик' })
const emit = defineEmits<{ click: []; rolled: [number] }>()

const wrap = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
const failed = ref(false)
const rolling = ref(false)
const value = ref(props.initial)
const flash = ref<'' | 'crit' | 'fumble'>('')

let T: typeof THREE_NS
let renderer: THREE_NS.WebGLRenderer | null = null
let scene: THREE_NS.Scene, camera: THREE_NS.PerspectiveCamera, die: THREE_NS.Group, holder: THREE_NS.Group
const faceQuat: Record<number, THREE_NS.Quaternion> = {}
let raf = 0
let visible = true
let anim: { start: THREE_NS.Quaternion; target: THREE_NS.Quaternion; axis: THREE_NS.Vector3; turns: number; t0: number; dur: number; done: (n: number) => void; n: number } | null = null

// --- атлас граней: 5×4 ячейки, плоский векторный стиль: красная грань, светлая вставка, цифра цвета пергамента ---
const CELL = 256
const TRI = { top: [128, 30], bl: [18, 222], br: [238, 222] } as const
function makeAtlas(numbers: number[]) {
  const c = document.createElement('canvas')
  c.width = CELL * 5
  c.height = CELL * 4
  const ctx = c.getContext('2d')!
  const tri = (k: number) => {
    const cx = 128, cy = 158
    const p = (q: readonly number[]) => [cx + (q[0] - cx) * k, cy + (q[1] - cy) * k] as const
    const [a, b, d] = [p(TRI.top), p(TRI.bl), p(TRI.br)]
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); ctx.closePath()
  }
  for (let f = 0; f < 20; f++) {
    ctx.save()
    ctx.translate((f % 5) * CELL, Math.floor(f / 5) * CELL)
    ctx.fillStyle = '#c80d0d'; ctx.fillRect(0, 0, CELL, CELL) // корпус: драконий красный, чуть глубже
    tri(0.78); ctx.fillStyle = '#df1f17'; ctx.fill() // вставка-фаска
    tri(0.78); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,214,200,.55)'; ctx.stroke()
    const n = numbers[f]!
    ctx.font = `800 ${n >= 10 ? 74 : 86}px Georgia, "Times New Roman", serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = '#4a0606'; ctx.strokeText(String(n), 128, 160)
    ctx.fillStyle = n === 20 ? '#F7F2E6' : '#F7F2E6'; ctx.fillText(String(n), 128, 160)
    ctx.restore()
  }
  return c
}

async function init() {
  try {
    T = await import('three')
    renderer = new T.WebGLRenderer({ canvas: canvas.value!, antialias: true, alpha: true, powerPreference: 'low-power' })
  } catch {
    failed.value = true
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.outputColorSpace = T.SRGBColorSpace

  scene = new T.Scene()
  camera = new T.PerspectiveCamera(32, 1, 0.1, 50)
  camera.position.set(0, 0, 4.4 * 1.8) // кубик того же размера на увеличенном холсте

  // мультяшный свет: три ступени яркости → грани выглядят как плоская векторная заливка
  scene.add(new T.AmbientLight(0xffffff, 1.1))
  const key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(-2, 3, 4); scene.add(key)

  // геометрия: икосаэдр без индексов → 20 отдельных треугольников
  const geo = new T.IcosahedronGeometry(1, 0)
  const pos = geo.getAttribute('position')
  const normals: THREE_NS.Vector3[] = []
  const tops: THREE_NS.Vector3[] = []
  for (let f = 0; f < 20; f++) {
    const a = new T.Vector3().fromBufferAttribute(pos, f * 3)
    const b = new T.Vector3().fromBufferAttribute(pos, f * 3 + 1)
    const c = new T.Vector3().fromBufferAttribute(pos, f * 3 + 2)
    const cen = a.clone().add(b).add(c).divideScalar(3)
    normals.push(cen.clone().normalize())
    tops.push(a.clone().sub(cen).normalize())
  }
  // противоположные грани в сумме дают 21, как у настоящего d20
  const numbers = new Array<number>(20).fill(0)
  let next = 1
  for (let f = 0; f < 20; f++) {
    if (numbers[f]) continue
    const opp = normals.findIndex((n, i) => i !== f && !numbers[i] && n.dot(normals[f]!) < -0.99)
    numbers[f] = next
    if (opp >= 0) numbers[opp] = 21 - next
    next++
  }
  // UV: вершина a → верх треугольника, b → низ-лево, c → низ-право
  const uv = new Float32Array(60 * 2)
  const W = CELL * 5, H = CELL * 4
  for (let f = 0; f < 20; f++) {
    const ox = (f % 5) * CELL, oy = Math.floor(f / 5) * CELL
    const pts = [TRI.top, TRI.bl, TRI.br]
    pts.forEach((p, i) => { uv[(f * 3 + i) * 2] = (ox + p[0]) / W; uv[(f * 3 + i) * 2 + 1] = 1 - (oy + p[1]) / H })
  }
  geo.setAttribute('uv', new T.BufferAttribute(uv, 2))

  const atlas = new T.CanvasTexture(makeAtlas(numbers))
  atlas.colorSpace = T.SRGBColorSpace
  atlas.anisotropy = renderer.capabilities.getMaxAnisotropy()
  const steps = new T.DataTexture(new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]), 3, 1)
  steps.minFilter = steps.magFilter = T.NearestFilter
  steps.needsUpdate = true
  const body = new T.MeshToonMaterial({ map: atlas, gradientMap: steps })

  die = new T.Group()
  die.add(new T.Mesh(geo, body))
  // толстый тёмный контур (обратные грани чуть больше кубика) + светлые линии рёбер - как в векторной иллюстрации
  const hull = new T.Mesh(geo, new T.MeshBasicMaterial({ color: 0x2a0505, side: T.BackSide }))
  hull.scale.setScalar(1.07)
  die.add(hull)
  const edges = new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color: 0xffc9b8, transparent: true, opacity: 0.6 }))
  edges.scale.setScalar(1.003)
  die.add(edges)

  // ориентация «грань N смотрит в камеру, цифра стоит ровно»
  const Z = new T.Vector3(0, 0, 1)
  for (let f = 0; f < 20; f++) {
    const qa = new T.Quaternion().setFromUnitVectors(normals[f]!, Z)
    const up = tops[f]!.clone().applyQuaternion(qa)
    const qz = new T.Quaternion().setFromAxisAngle(Z, Math.atan2(up.x, up.y))
    faceQuat[numbers[f]!] = qz.multiply(qa)
  }

  holder = new T.Group()
  holder.rotation.x = -0.28 // смотрим чуть сверху
  holder.add(die)
  scene.add(holder)
  die.quaternion.copy(faceQuat[props.initial] ?? faceQuat[20]!)

  resize()
  loop()
}

function resize() {
  if (!renderer || !wrap.value) return
  const w = Math.round(wrap.value.clientWidth * 1.8) // холст на 80% больше блока (запас под подскок)
  renderer.setSize(w, w, false)
  camera.aspect = 1
  camera.updateProjectionMatrix()
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3)
let lastIdle = 0
function loop() {
  raf = 0
  if (!visible || !renderer || document.hidden) return // не на экране - цикл стоит, перезапускается из IntersectionObserver
  raf = requestAnimationFrame(loop)
  const now = performance.now()
  // в покое - ~20 кадров/с (лёгкое покачивание), во время броска - полная частота
  if (!anim && now - lastIdle < 50) return
  if (!anim) lastIdle = now
  if (anim) {
    const t = Math.min(1, (now - anim.t0) / anim.dur)
    const spin = new T.Quaternion().setFromAxisAngle(anim.axis, anim.turns * Math.PI * 2 * (1 - ease(t)))
    const q = spin.multiply(anim.target)
    if (t < 0.12) die.quaternion.copy(anim.start).slerp(q, t / 0.12)
    else die.quaternion.copy(q)
    die.position.y = Math.abs(Math.sin(t * Math.PI * 3)) * (1 - t) * 0.55
    const s = t > 0.9 ? 1 + Math.sin((t - 0.9) / 0.1 * Math.PI) * 0.08 : 1
    die.scale.setScalar(s)
    if (t >= 1) { const a = anim; anim = null; die.position.y = 0; a.done(a.n) }
  } else {
    // лёгкое покачивание в покое
    const base = faceQuat[value.value]!
    const wob = new T.Quaternion().setFromEuler(new T.Euler(Math.sin(now / 1300) * 0.06, Math.sin(now / 1700) * 0.09, 0))
    die.quaternion.copy(wob.multiply(base))
  }
  renderer.render(scene, camera)
}

/** Бросок. n - нужный результат (1-20), без него - случайный. Возвращает выпавшее число. */
function roll(n?: number): Promise<number> {
  const result = n && n >= 1 && n <= 20 ? n : 1 + Math.floor(Math.random() * 20)
  flash.value = ''
  if (failed.value || !renderer || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    value.value = result
    finish(result)
    return Promise.resolve(result)
  }
  rolling.value = true
  return new Promise((resolve) => {
    const axis = new T.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
    if (!raf) loop()
  anim = { start: die.quaternion.clone(), target: faceQuat[result]!.clone(), axis, turns: 3 + Math.random() * 1.5, t0: performance.now(), dur: 1700, n: result,
      done: (r) => { value.value = r; rolling.value = false; finish(r); resolve(r) } }
  })
}
function finish(r: number) {
  flash.value = r === 20 ? 'crit' : r === 1 ? 'fumble' : ''
  emit('rolled', r)
}
defineExpose({ roll, value, rolling })

const onVis = () => { if (!document.hidden && visible && renderer && !raf) loop() }
let ro: ResizeObserver | undefined
let io: IntersectionObserver | undefined
onMounted(() => {
  document.addEventListener('visibilitychange', onVis)
  // грузим three только когда кубик почти на экране
  io = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting
    if (visible && !renderer && !failed.value) init()
    else if (visible && renderer && !raf) loop()
  }, { rootMargin: '200px' })
  io.observe(wrap.value!)
  ro = new ResizeObserver(resize)
  ro.observe(wrap.value!)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  document.removeEventListener('visibilitychange', onVis)
  io?.disconnect(); ro?.disconnect()
  renderer?.dispose()
})
</script>

<template>
  <div ref="wrap" class="dice3d" :class="flash" :style="{ width: size }">
    <button type="button" class="dice3d-btn" :aria-label="label" :disabled="rolling" @click="emit('click')">
      <canvas v-show="!failed" ref="canvas" class="dice3d-canvas" />
      <span v-if="failed" class="dice3d-flat">{{ value }}</span>
    </button>
    <span class="dice3d-shadow" aria-hidden="true" />
    <span class="sr-only" aria-live="polite">{{ rolling ? 'Бросок…' : `Выпало ${value}` }}</span>
  </div>
</template>

<style>
.dice3d { position: relative; aspect-ratio: 1; max-width: 100%; }
.dice3d-btn { all: unset; position: relative; display: block; width: 100%; height: 100%; cursor: pointer; border-radius: 50%; }
.dice3d-btn:focus-visible { outline: 2px solid #DF0000; outline-offset: 4px; }
.dice3d-btn:disabled { cursor: progress; }
.dice3d-canvas { position: absolute; left: -40%; top: -40%; width: 180% !important; height: 180% !important; display: block; pointer-events: none; }
.dice3d-shadow { position: absolute; left: 22%; right: 22%; bottom: 4%; height: 10%; border-radius: 50%; background: radial-gradient(#000c, #0000 70%); z-index: -1; }
.dice3d.crit::before, .dice3d.fumble::before { content: ''; position: absolute; inset: -10%; border-radius: 50%; z-index: -1; animation: dice-flash 1.6s ease-out; }
.dice3d.crit::before { background: radial-gradient(#f6d58aaa, #0000 65%); }
.dice3d.fumble::before { background: radial-gradient(#8a1c1caa, #0000 65%); }
@keyframes dice-flash { from { opacity: 1; transform: scale(.6); } to { opacity: 0; transform: scale(1.3); } }
.dice3d-flat { display: grid; place-items: center; width: 100%; height: 100%; font: 700 48px Georgia, serif; color: #f6d58a;
  clip-path: polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%); background: #c80d0d; color: #F7F2E6; }
</style>
