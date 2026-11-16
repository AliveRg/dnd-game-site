<script setup lang="ts">
import { ARTICLES } from '#shared/seo-pages'
const route = useRoute()
const page = ARTICLES.find((p) => p.slug === route.params.slug)
if (!page) throw createError({ statusCode: 404, statusMessage: 'Статья не найдена', fatal: true })
</script>

<template>
  <SeoPageView v-if="page" :page="page" />
</template>
