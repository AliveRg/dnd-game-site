<script setup lang="ts">
import { SKULL_SVG } from '#shared/skull'
</script>

<template>
  <!-- Логотип: векторный череп. Источник - shared/skull.ts -->
  <svg viewBox="0 0 100 100" aria-hidden="true" class="logo-skull" v-html="SKULL_SVG" />
</template>

<style>
.logo-skull { width: 40px; height: 40px; flex: none; filter: drop-shadow(0 0 6px #DF000044); }
</style>
