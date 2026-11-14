<script setup lang="ts">
// Заголовок секции с предметом-декором слева (свеча, книга, ключ…)
defineProps<{ icon?: 'candle' | 'scroll' | 'key' | 'book' | 'skull' | 'goblet' | 'potion' | 'nails'; as?: 'h1' | 'h2' }>()
</script>

<template>
  <div class="mb-6 flex items-end gap-3">
    <img v-if="icon" :src="`/decor/${icon}.webp`" alt="" class="h-12 w-12 flex-none object-contain drop-shadow-[0_6px_8px_#000c] md:h-16 md:w-16" decoding="async" />
    <component :is="as || 'h2'" class="text-3xl text-parchment md:text-5xl"><slot /></component>
  </div>
</template>
