<script setup lang="ts">
// Иллюстрация сюжета (широкая, 120×64). Цвет задаётся через color/текстовый класс родителя.
import { gameIcon } from '#shared/game-icons'
defineProps<{ slug?: string | null; width?: number }>()
</script>

<template>
  <svg class="game-icon" :width="width || 120" :height="(width || 120) * 64 / 120" viewBox="0 0 120 64" aria-hidden="true" v-html="gameIcon(slug)" />
</template>

<style>
.game-icon { overflow: visible; stroke-linecap: round; stroke-linejoin: round; }
.game-icon .s { stroke: currentColor; stroke-width: 2; }
.game-icon path:not([class*='f']), .game-icon .s:not([class*='f']) { fill: none; }
.game-icon .f1 { fill: currentColor; fill-opacity: .12; }
.game-icon .f2 { fill: currentColor; fill-opacity: .25; }
.game-icon .f3 { fill: currentColor; fill-opacity: .45; }
.game-icon .f4 { fill: #DF0000; fill-opacity: 1; }
.game-icon path.s:not(.f1):not(.f2):not(.f3):not(.f4) { fill: none; }
</style>
