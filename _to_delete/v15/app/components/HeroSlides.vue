<script setup lang="ts">
// Фон hero: фото сменяются с плавным зумом. Добавляй фото в массив (лучше webp 1920px, до 250 КБ).
const slides = ['/photos/hero-master.webp', '/photos/hero-maps.webp', '/photos/hero-room.webp', '/photos/hero-girl.webp']
const i = ref(0)
const root = ref<HTMLElement>()
const paused = ref(false)
let t: ReturnType<typeof setInterval> | undefined
let io: IntersectionObserver | undefined
onMounted(() => {
  t = setInterval(() => !paused.value && (i.value = (i.value + 1) % slides.length), 7000)
  // ушли со первого экрана - анимация на паузе (не грузит видеокарту)
  io = new IntersectionObserver(([e]) => (paused.value = !e?.isIntersecting))
  io.observe(root.value!)
})
onBeforeUnmount(() => { clearInterval(t); io?.disconnect() })
</script>

<template>
  <div ref="root" class="absolute inset-0 overflow-hidden" :class="paused && 'hero-paused'" aria-hidden="true">
    <TransitionGroup enter-active-class="transition-opacity duration-[1500ms]" leave-active-class="transition-opacity duration-[1500ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <img v-for="(src, idx) in slides" v-show="idx === i" :key="src" :src="src" alt="" class="kenburns absolute inset-0 h-full w-full object-cover" :fetchpriority="idx === 0 ? 'high' : 'low'" width="1920" height="1080" :loading="idx === 0 ? 'eager' : 'lazy'" decoding="async" />
    </TransitionGroup>
    <!-- тёмно-красная тонировка: тёплые фото уходят в неоновую гамму сайта -->
    <div class="absolute inset-0" style="background: #3a0000; mix-blend-mode: color; opacity: .45" />
    <div class="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/60 to-ink" />
  </div>
</template>
