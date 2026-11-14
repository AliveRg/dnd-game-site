<script setup lang="ts">
const cfg = useRuntimeConfig().public
useSiteSeo({ title: `Новости, новинки и статьи о НРИ | ${cfg.siteName}`, description: 'Анонсы новых партий, новинки клуба и статьи о настольных ролевых играх.' })
const tab = ref<'news' | 'novelty' | 'article'>('news')
const { data: posts } = await useFetch<any[]>('/api/posts', { query: { type: tab }, default: () => [] })
const tabs = [{ id: 'news', label: 'Новости' }, { id: 'novelty', label: 'Новинки' }, { id: 'article', label: 'Статьи' }] as const
</script>

<template>
  <section class="section">
    <div class="container-x">
      <h1 class="section-title">Новости и статьи</h1>
      <div class="mb-8 flex gap-2">
        <button v-for="t in tabs" :key="t.id" class="btn-ghost py-2" :class="tab === t.id && 'border-candle text-candle'" @click="tab = t.id">{{ t.label }}</button>
      </div>
      <p v-if="!posts.length" class="text-ash">Пока пусто — скоро здесь появятся записи.</p>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="p in posts" :key="p.id" :to="`/news/${p.slug}`" class="card overflow-hidden p-0 hover:border-candle">
          <img v-if="p.cover" :src="p.cover" :alt="p.title" loading="lazy" class="aspect-[16/10] w-full object-cover" />
          <div class="p-5">
            <p class="text-xs text-ash">{{ new Date(p.created_at).toLocaleDateString('ru-RU') }}</p>
            <h2 class="mt-1 text-2xl">{{ p.title }}</h2>
            <p class="mt-2 text-sm text-ash">{{ p.excerpt }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
