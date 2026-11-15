<script setup lang="ts">
// 3D-кубик d20 из модели (орех и латунь) в стиле расписных ассетов клуба.
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

// Модель: public/test-assets/models/dice-d20.glb (орех, выпуклые цифры). Первые 20 треугольников первого меша - грани,
// грань i несёт число i+1, верх цифры смотрит на третью вершину грани. Цифры перекрашиваем в латунь, чтобы читались.
const MODEL = '/test-assets/models/dice-d20.glb'

async function init() {
  let GLTFLoader: any
  try {
    T = await import('three')
    GLTFLoader = (await import('three/examples/jsm/loaders/GLTFLoader.js')).GLTFLoader
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

  // тёплый свет комнаты: лампа сверху слева + слабый контровой
  scene.add(new T.HemisphereLight(0xfff0d6, 0x3a1c08, 1.8))
  const key = new T.DirectionalLight(0xffe2b0, 3.2); key.position.set(-2, 3, 4); scene.add(key)
  const rim = new T.DirectionalLight(0xf2b45a, 1.2); rim.position.set(3, -1, -2); scene.add(rim)

  let model: THREE_NS.Object3D
  try {
    model = (await new GLTFLoader().loadAsync(MODEL)).scene
  } catch {
    renderer.dispose(); renderer = null
    failed.value = true
    return
  }
  const meshes: THREE_NS.Mesh[] = []
  model.traverse((o: any) => o.isMesh && meshes.push(o))
  const body = meshes[0]!
  const geo = body.geometry as THREE_NS.BufferGeometry
  const pos = geo.getAttribute('position')
  geo.clearGroups(); geo.addGroup(0, 60, 0); geo.addGroup(60, pos.count - 60, 1)
  body.material = [
    new T.MeshStandardMaterial({ color: 0x8a4e1e, roughness: 0.7 }),
    new T.MeshStandardMaterial({ color: 0xf2b45a, roughness: 0.35, metalness: 0.6, emissive: 0x7e4515, emissiveIntensity: 0.9 })
  ]
  if (meshes[1]) meshes[1].material = new T.MeshStandardMaterial({ color: 0x45250e, roughness: 0.8 })

  // ориентация «грань N смотрит в камеру, цифра стоит ровно»
  const Z = new T.Vector3(0, 0, 1)
  for (let f = 0; f < 20; f++) {
    const a = new T.Vector3().fromBufferAttribute(pos, f * 3)
    const b = new T.Vector3().fromBufferAttribute(pos, f * 3 + 1)
    const c = new T.Vector3().fromBufferAttribute(pos, f * 3 + 2)
    const cen = a.clone().add(b).add(c).divideScalar(3)
    const qa = new T.Quaternion().setFromUnitVectors(cen.clone().normalize(), Z)
    const up = c.clone().sub(cen).normalize().applyQuaternion(qa)
    const qz = new T.Quaternion().setFromAxisAngle(Z, Math.atan2(up.x, up.y))
    faceQuat[f + 1] = qz.multiply(qa)
  }

  die = new T.Group()
  die.add(model)
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
      <img v-if="failed" src="/art/dice-d20.webp" alt="" class="dice3d-flat" />
    </button>
    <span class="dice3d-shadow" aria-hidden="true" />
    <span class="sr-only" aria-live="polite">{{ rolling ? 'Бросок…' : `Выпало ${value}` }}</span>
  </div>
</template>

<style>
.dice3d { position: relative; aspect-ratio: 1; max-width: 100%; }
.dice3d-btn { all: unset; position: relative; display: block; width: 100%; height: 100%; cursor: pointer; border-radius: 50%; }
.dice3d-btn:focus-visible { outline: 2px solid #e0a24a; outline-offset: 4px; }
.dice3d-btn:disabled { cursor: progress; }
.dice3d-canvas { position: absolute; left: -40%; top: -40%; width: 180% !important; height: 180% !important; display: block; pointer-events: none; }
.dice3d-shadow { position: absolute; left: 22%; right: 22%; bottom: 4%; height: 10%; border-radius: 50%; background: radial-gradient(#000c, #0000 70%); z-index: -1; }
.dice3d.crit::before, .dice3d.fumble::before { content: ''; position: absolute; inset: -10%; border-radius: 50%; z-index: -1; animation: dice-flash 1.6s ease-out; }
.dice3d.crit::before { background: radial-gradient(#f2b45aaa, #0000 65%); }
.dice3d.fumble::before { background: radial-gradient(#7a1a12aa, #0000 65%); }
@keyframes dice-flash { from { opacity: 1; transform: scale(.6); } to { opacity: 0; transform: scale(1.3); } }
.dice3d-flat { width: 100%; height: 100%; object-fit: contain; }
</style>
