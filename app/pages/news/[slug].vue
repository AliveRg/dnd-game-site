<script setup lang="ts">
const route = useRoute()
const cfg = useRuntimeConfig().public
const { data: post, error } = await usePreviewFetch<any>(`/api/posts/${route.params.slug}`)
if (error.value || !post.value || !['news','novelty'].includes(post.value.type)) throw createError({ statusCode: 404, message: 'Запись не найдена', fatal: true })
useSiteSeo({ title: post.value.seo_title || `${post.value.title} | ${cfg.siteName}`, description: post.value.seo_description || post.value.excerpt, image: post.value.cover || undefined, type: 'article' })
const paragraphs = computed(() => String(post.value.body || '').split(/\n{2,}/))
</script>

<template>
  <article class="container-x max-w-3xl py-12">
    <NuxtLink to="/klub#novosti" class="text-sm text-candle">← Все записи</NuxtLink>
    <h1 class="mt-4 text-4xl md:text-5xl">{{ post.title }}</h1>
    <img v-if="post.cover" :src="post.cover" :alt="post.title" class="my-8 w-full rounded-2xl" />
    <div class="space-y-4 text-lg leading-relaxed">
      <p v-for="(p, i) in paragraphs" :key="i" class="whitespace-pre-line">{{ p }}</p>
    </div>
  </article>
</template>
