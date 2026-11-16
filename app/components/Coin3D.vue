<script setup lang="ts">
// 3D-монета (public/test-assets/models/coin-bronze.glb): влетает с вращением и слегка покачивается.
// Ставится на выбранный тариф. Если WebGL нет - показываем картинку монеты.
import type * as THREE_NS from 'three'

const props = withDefaults(defineProps<{ size?: number }>(), { size: 52 })
const canvas = ref<HTMLCanvasElement>()
const failed = ref(false)

let renderer: THREE_NS.WebGLRenderer | null = null
let raf = 0
let alive = true

// модель грузим один раз на всю страницу
let modelPromise: Promise<THREE_NS.Object3D> | null = null
async function loadModel(T: typeof THREE_NS) {
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
  return (await new GLTFLoader().loadAsync('/test-assets/models/coin-bronze.glb')).scene as THREE_NS.Object3D
}

onMounted(async () => {
  try {
    const T = await import('three')
    modelPromise ||= loadModel(T)
    const model = (await modelPromise).clone(true)
    if (!alive || !canvas.value) return
    renderer = new T.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = T.SRGBColorSpace
    renderer.setSize(props.size * 1.6, props.size * 1.6, false)
    const scene = new T.Scene()
    scene.add(new T.HemisphereLight(0xfff0d6, 0x2a1406, 1.4))
    const key = new T.DirectionalLight(0xffe2b0, 2.6); key.position.set(-2, 3, 4); scene.add(key)
    model.traverse((o: any) => { if (o.isMesh) o.material = new T.MeshStandardMaterial({ color: 0xd08a3a, metalness: 0.75, roughness: 0.32, emissive: 0x3a1c06, emissiveIntensity: 0.5 }) })
    const coin = new T.Group(); coin.add(model); scene.add(coin)
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 20)
    camera.position.set(0, 0, 6)
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    let last = 0
    const loop = (now: number) => {
      if (!renderer) return
      raf = requestAnimationFrame(loop)
      const t = (now - t0) / 1000
      if (t > 0.8 && now - last < 40) return // после влёта ~25 кадров/с
      last = now
      if (reduce) { coin.rotation.set(0.15, -0.35, 0); renderer.render(scene, camera); cancelAnimationFrame(raf); return }
      const k = Math.min(1, t / 0.75), e = 1 - Math.pow(1 - k, 3)
      coin.rotation.y = (1 - e) * Math.PI * 4 - 0.35 + Math.sin(t * 1.4) * 0.35 * e
      coin.rotation.x = 0.15
      coin.scale.setScalar(0.3 + 0.7 * e + (k >= 1 ? 0 : Math.sin(k * Math.PI) * 0.15))
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(loop)
  } catch {
    failed.value = true
  }
})
onBeforeUnmount(() => {
  alive = false
  cancelAnimationFrame(raf)
  renderer?.dispose()
  renderer = null
})
</script>

<template>
  <span class="coin3d" :style="{ width: `${size}px`, height: `${size}px` }" aria-hidden="true">
    <canvas v-if="!failed" ref="canvas" />
    <img v-else src="/art/ui-coin-gold.webp" alt="" />
  </span>
</template>

<style>
.coin3d { position: relative; display: block; }
.coin3d canvas { position: absolute; left: -30%; top: -30%; width: 160% !important; height: 160% !important; filter: drop-shadow(0 4px 6px #000c); }
.coin3d img { width: 100%; height: 100%; object-fit: contain; }
</style>
