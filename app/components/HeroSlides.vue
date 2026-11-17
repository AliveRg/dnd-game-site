<script setup lang="ts">
// Фон hero: фото сменяются с плавным зумом. Добавляй фото в массив (лучше webp 1920px, до 250 КБ).
const {data:content}=await useFetch<any>('/api/site-content',{key:'site-content'})
const defaults = ['/photos/hero-room.webp', '/photos/g-shelves.webp', '/photos/g-minis.webp']
const slides = computed(()=>content.value?.home?.images?.length?content.value.home.images.map((p:any)=>p.url):defaults)
const i = ref(0)
const root = ref<HTMLElement>()
const paused = ref(false)
let t: ReturnType<typeof setInterval> | undefined
let io: IntersectionObserver | undefined
onMounted(() => {
  t = setInterval(() => !paused.value && (i.value = (i.value + 1) % slides.value.length), 7000)
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
    <div class="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/60 to-ink" />
  </div>
</template>
