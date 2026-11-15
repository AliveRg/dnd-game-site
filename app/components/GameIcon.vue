<script setup lang="ts">
// Иллюстрация сюжета: расписная диорама мира (public/art/story-*.webp). width - ширина в px; маленькие (<100) берут лёгкую версию.
import { storyArt } from '#shared/story-art'
const props = defineProps<{ slug?: string | null; width?: number }>()
const w = computed(() => props.width || 120)
</script>

<template>
  <img class="game-icon" :src="storyArt(slug, w < 100)" alt="" :width="w" :height="Math.round(w * 2 / 3)" loading="lazy" decoding="async" />
</template>

<style>
.game-icon { display: block; object-fit: contain; filter: drop-shadow(0 6px 10px #0009); }
</style>
