<script setup lang="ts">
// Воксельная гекс-карта (three.js, грузится лениво). Все локации сначала - белые платформы.
// Наведение (или выбор) «строит» локацию за ~1.35 с: платформа окрашивается в грунт → растут слои земли →
// верхний слой (трава/снег/песок/лава…) → окружение (деревья, дома, животные) выпрыгивает с отскоком.
// Рисуем только когда что-то меняется: в покое карта не грузит видеокарту.
import type * as THREE_NS from 'three'
import { buildWorld, HEX_R } from '#shared/voxel-world'

const props = defineProps<{ selected?: string | null; hover?: string | null }>()
const emit = defineEmits<{ hover: [id: string | null, pos: { x: number; y: number } | null]; pick: [id: string] }>()

const wrap = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
const failed = ref(false)
const ready = ref(false)

let T: typeof THREE_NS
let renderer: THREE_NS.WebGLRenderer | null = null
let scene: THREE_NS.Scene, camera: THREE_NS.OrthographicCamera, mesh: THREE_NS.InstancedMesh
let world: ReturnType<typeof buildWorld>
let picks: THREE_NS.Mesh[] = []
const ray = { r: null as THREE_NS.Raycaster | null, v: null as THREE_NS.Vector2 | null }
// по зонам: диапазон инстансов, прогресс постройки 0..1
const zr: Record<string, { from: number; to: number; p: number; center: [number, number]; top: number; tint: [number, number, number] }> = {}
let base: Float32Array // x, y, z, s, ph, d на кубик
let target: Float32Array // цвет цели (линейный RGB)
let white: THREE_NS.Color
let mapHover: string | null = null
let raf = 0
let last = 0
const BUILD = 1.35, UNBUILD = 0.5

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const backOut = (t: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) }

function writeZone(id: string) {
  const z = zr[id]!
  const m = mesh.instanceMatrix.array as Float32Array
  const col = mesh.instanceColor!.array as Float32Array
  const Tm = z.p * BUILD
  for (let i = z.from; i < z.to; i++) {
    const b = i * 6
    const x = base[b]!, y = base[b + 1]!, zz = base[b + 2]!, s = base[b + 3]!, ph = base[b + 4]!, d = base[b + 5]!
    let k = 1, yo = 0, mix = 1
    if (ph === 0) mix = clamp(Tm / 0.45 - d * 0.5)
    else {
      const start = ph === 1 ? 0.15 : ph === 2 ? 0.42 : 0.8
      const t = clamp((Tm - start - d * (ph === 3 ? 0.25 : 0.3)) / 0.3)
      k = ph === 3 ? Math.max(0, backOut(t)) : clamp(t * 1.4)
      yo = (1 - t) * (ph === 3 ? 0 : 1.6)
      mix = ph === 3 ? 1 : clamp(t * 1.5)
    }
    const o = i * 16
    const sk = s * k
    m[o] = sk; m[o + 5] = sk; m[o + 10] = sk
    m[o + 12] = x; m[o + 13] = y + yo; m[o + 14] = zz
    const c = i * 3
    // «белое» состояние чуть подкрашено цветом биома (26%), чтобы зоны читались до постройки
    const w0 = white.r * 0.74 + z.tint[0] * 0.26, w1 = white.g * 0.74 + z.tint[1] * 0.26, w2 = white.b * 0.74 + z.tint[2] * 0.26
    col[c] = w0 + (target[c]! - w0) * mix
    col[c + 1] = w1 + (target[c + 1]! - w1) * mix
    col[c + 2] = w2 + (target[c + 2]! - w2) * mix
  }
}

const wanted = (id: string) => (id === props.selected || id === props.hover || id === mapHover ? 1 : 0)
function tick(now: number) {
  raf = 0
  if (!renderer) return
  const dt = Math.min(0.12, (now - (last || now)) / 1000)
  last = now
  let busy = false
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  for (const id in zr) {
    const z = zr[id]!
    const w = wanted(id)
    if (z.p === w) continue
    z.p = reduce ? w : w > z.p ? Math.min(w, z.p + dt / BUILD) : Math.max(w, z.p - dt / UNBUILD)
    writeZone(id)
    busy = true
  }
  if (busy) { mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor!.needsUpdate = true }
  renderer.render(scene, camera)
  if (busy) raf = requestAnimationFrame(tick)
  else last = 0
}
function kick() { if (renderer && !raf) raf = requestAnimationFrame(tick) }
watch(() => [props.selected, props.hover], kick)

async function init() {
  try {
    T = await import('three')
    renderer = new T.WebGLRenderer({ canvas: canvas.value!, antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch {
    failed.value = true
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.outputColorSpace = T.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = T.PCFSoftShadowMap
  scene = new T.Scene()
  world = buildWorld()
  white = new T.Color(0xece6d8)

  // свет: мягкое небо + солнце с тенями (как у макетов из кубиков)
  scene.add(new T.HemisphereLight(0xfff4e0, 0x40505a, 1.6))
  const sun = new T.DirectionalLight(0xffffff, 2.1)
  sun.position.set(-30, 60, 32)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 50, bottom: -50, near: 1, far: 160 })
  sun.shadow.bias = -0.0006
  sun.shadow.normalBias = 0.02
  scene.add(sun)

  // кубики всех локаций одним InstancedMesh (одна отрисовка)
  const total = world.zones.reduce((s, z) => s + z.vox.length, 0)
  const box = new T.BoxGeometry(1, 1, 1)
  mesh = new T.InstancedMesh(box, new T.MeshLambertMaterial({ color: 0xffffff }), total)
  mesh.castShadow = mesh.receiveShadow = true
  mesh.instanceColor = new T.InstancedBufferAttribute(new Float32Array(total * 3), 3)
  mesh.instanceMatrix.setUsage(T.DynamicDrawUsage)
  base = new Float32Array(total * 6)
  target = new Float32Array(total * 3)
  const c = new T.Color()
  let i = 0
  for (const z of world.zones) {
    const tint: [number, number, number] = [0, 0, 0]
    let nt = 0
    zr[z.id] = { from: i, to: i + z.vox.length, p: 0, center: z.center, top: z.top, tint }
    for (const v of z.vox) {
      base.set([v.x, v.y, v.z, v.s, v.ph, v.d], i * 6)
      c.setHex(v.c)
      target.set([c.r, c.g, c.b], i * 3)
      if (v.ph === 2) { tint[0] += c.r; tint[1] += c.g; tint[2] += c.b; nt++ }
      i++
    }
    if (nt) { tint[0] /= nt; tint[1] /= nt; tint[2] /= nt }
    writeZone(z.id)
  }
  mesh.frustumCulled = false
  scene.add(mesh)

  // вода: мелководье из плоских кубиков (светлее у берега) + глубокая вода с мягким краем
  const sh = world.shallow
  const water = new T.InstancedMesh(new T.BoxGeometry(1, 0.6, 1), new T.MeshLambertMaterial({ color: 0xffffff }), sh.length)
  water.receiveShadow = true
  const mtx = new T.Matrix4()
  const near = new T.Color(0x86d3dc), far = new T.Color(0x3b8ca5)
  const tiles = world.zones.flatMap((z) => z.tiles)
  sh.forEach(([x, z], k) => {
    const d = Math.min(...tiles.map((t) => Math.hypot(t[0] - x, t[1] - z)))
    const f = clamp((d - HEX_R + 0.5) / 3)
    mtx.makeTranslation(x, -1.15 - f * 0.25 + ((x * 7 + z * 13) % 3) * 0.03, z)
    water.setMatrixAt(k, mtx)
    water.setColorAt(k, near.clone().lerp(far, f))
  })
  scene.add(water)
  const g = document.createElement('canvas'); g.width = g.height = 256
  const gx = g.getContext('2d')!
  const grad = gx.createRadialGradient(128, 128, 40, 128, 128, 128)
  grad.addColorStop(0, 'rgba(47,111,128,1)'); grad.addColorStop(0.72, 'rgba(36,84,104,.9)'); grad.addColorStop(1, 'rgba(19,11,9,0)')
  gx.fillStyle = grad; gx.fillRect(0, 0, 256, 256)
  const tex = new T.CanvasTexture(g); tex.colorSpace = T.SRGBColorSpace
  const sea = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }))
  sea.rotation.x = -Math.PI / 2
  sea.scale.set((world.bounds.maxX + 14) * 2, (world.bounds.maxZ + 14) * 2, 1)
  sea.position.y = -1.55
  scene.add(sea)

  // невидимые гексы для наведения
  const pickMat = new T.MeshBasicMaterial()
  for (const z of world.zones) for (const [x, y] of z.tiles) {
    const h = z.top + 4
    const p = new T.Mesh(new T.CylinderGeometry(HEX_R + 0.5, HEX_R + 0.5, h, 6), pickMat)
    p.rotation.y = Math.PI / 2
    p.position.set(x, h / 2 - 1.5, y)
    p.userData.zone = z.id
    p.visible = false
    picks.push(p)
    scene.add(p)
  }
  ray.r = new T.Raycaster()
  ray.v = new T.Vector2()

  camera = new T.OrthographicCamera(-1, 1, 1, -1, 1, 400)
  const e = (31 * Math.PI) / 180
  camera.position.set(0, Math.sin(e) * 160, Math.cos(e) * 160)
  camera.lookAt(0, 0, 2)
  resize()
  ready.value = true
  kick()
}

function resize() {
  if (!renderer || !wrap.value) return
  const w = wrap.value.clientWidth, h = wrap.value.clientHeight
  renderer.setSize(w, h, false)
  const aspect = w / h
  const halfW = world.bounds.maxX - 1, halfH = world.bounds.maxZ * 0.56 + 6
  const half = Math.max(halfW, halfH * aspect)
  camera.left = -half; camera.right = half; camera.top = half / aspect; camera.bottom = -half / aspect
  camera.updateProjectionMatrix()
  kick()
}

function zoneAt(e: PointerEvent): string | null {
  if (!renderer || !ray.r) return null
  const r = canvas.value!.getBoundingClientRect()
  ray.v!.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
  ray.r.setFromCamera(ray.v!, camera)
  const hit = ray.r.intersectObjects(picks, false)[0]
  return (hit?.object.userData.zone as string) ?? null
}
function screenOf(id: string) {
  const z = zr[id]!
  const v = new T.Vector3(z.center[0], z.top + 2.5, z.center[1]).project(camera)
  const r = canvas.value!.getBoundingClientRect()
  return { x: ((v.x + 1) / 2) * r.width, y: ((1 - v.y) / 2) * r.height }
}
function onMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  const id = zoneAt(e)
  if (id === mapHover) return
  mapHover = id
  canvas.value!.style.cursor = id ? 'pointer' : ''
  emit('hover', id, id ? screenOf(id) : null)
  kick()
}
function onLeave() { if (mapHover) { mapHover = null; emit('hover', null, null); kick() } }
function onClick(e: PointerEvent | MouseEvent) { const id = zoneAt(e as PointerEvent); if (id) emit('pick', id) }
defineExpose({ screenOf: (id: string) => (renderer ? screenOf(id) : null) })

let io: IntersectionObserver | undefined
let ro: ResizeObserver | undefined
onMounted(() => {
  io = new IntersectionObserver(([en]) => { if (en?.isIntersecting && !renderer && !failed.value) { io?.disconnect(); init() } }, { rootMargin: '300px' })
  io.observe(wrap.value!)
  ro = new ResizeObserver(() => resize())
  ro.observe(wrap.value!)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  io?.disconnect(); ro?.disconnect()
  renderer?.dispose()
  renderer = null
})
</script>

<template>
  <div ref="wrap" class="voxel-map" :class="ready && 'is-ready'">
    <canvas v-show="!failed" ref="canvas" class="voxel-canvas" @pointermove="onMove" @pointerleave="onLeave" @click="onClick" />
    <img v-if="failed" src="/images/world-map-v2.webp" alt="Карта миров клуба" class="h-full w-full rounded-2xl object-cover" />
    <div v-if="!ready && !failed" class="voxel-skel" aria-hidden="true"><span v-for="n in 12" :key="n" :style="{ '--i': n }" /></div>
  </div>
</template>

<style>
.voxel-map { position: relative; width: 100%; aspect-ratio: 16 / 10.5; }
/* Без рамки: карта отделена от фона мягким свечением воды */
.voxel-map::before { content: ''; position: absolute; inset: 4% 2%; border-radius: 50%; z-index: -1; pointer-events: none;
  background: radial-gradient(closest-side, #3b8ca566, #DF000014 60%, #0000); filter: blur(20px); }
.voxel-canvas { position: absolute; inset: 0; width: 100% !important; height: 100% !important; display: block; touch-action: manipulation;
  opacity: 0; transition: opacity .6s; }
.is-ready .voxel-canvas { opacity: 1; }
.voxel-skel { position: absolute; inset: 18% 14%; display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
.voxel-skel span { aspect-ratio: 1.15; background: #ece6d814; clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);
  animation: vx-pulse 1.4s ease-in-out infinite; animation-delay: calc(var(--i) * .08s); }
@keyframes vx-pulse { 50% { background: #ece6d82e; } }
</style>
