<script setup lang="ts">
// Предметы-декор в расписном стиле (public/art/decor-*.webp, исходники public/test-assets/png).
export type DecorName = 'candle' | 'scroll' | 'key' | 'book' | 'skull' | 'goblet' | 'potion' | 'nails' | 'dice'
defineProps<{ name: DecorName }>()
</script>

<template>
  <img :src="`/art/decor-${name}.webp`" alt="" width="256" height="256" class="decor-icon" loading="lazy" decoding="async" />
</template>

<style>
.decor-icon { display: block; object-fit: contain; }
</style>
