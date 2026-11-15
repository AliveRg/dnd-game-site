<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError }>()
useHead({ title: 'Страница недоступна', meta: [{ name: 'robots', content: 'noindex' }] })
</script>
<template><NuxtLayout><section class="container-x min-h-[60vh] py-20 text-center"><p class="text-6xl text-candle">{{ error.statusCode }}</p><h1 class="mt-6 text-3xl">{{ error.statusCode === 404 ? 'Страница не найдена' : 'Не удалось загрузить страницу' }}</h1><p class="mt-4 text-ash">Вернитесь на главную или свяжитесь с клубом.</p><button class="btn-primary mt-8" @click="clearError({ redirect: '/' })">На главную</button></section></NuxtLayout></template>
