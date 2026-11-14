<script setup lang="ts">
// Посадочные SEO-страницы: /dnd-belgorod, /nri-belgorod и т.д. Контент - shared/seo-pages.ts
import { LANDINGS } from '#shared/seo-pages'
const route = useRoute()
const page = LANDINGS.find((p) => p.slug === route.params.slug)
if (!page) throw createError({ statusCode: 404, statusMessage: 'Страница не найдена', fatal: true })
</script>

<template>
  <SeoPageView v-if="page" :page="page" />
</template>
