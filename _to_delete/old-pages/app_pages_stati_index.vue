<script setup lang="ts">
import { ARTICLES, pagePath } from '#shared/seo-pages'
const cfg = useRuntimeConfig().public
useSiteSeo({ title: 'Статьи о D&D и НРИ: правила, персонажи, расы, классы', description: 'Гайды для новичков: что такое D&D и НРИ, как играть, как создать персонажа, расы, классы, кубики и заклинания.' })
</script>

<template>
  <section class="section">
    <div class="container-x">
      <h1 class="section-title">Статьи о D&amp;D и НРИ</h1>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink v-for="a in ARTICLES" :key="a.slug" :to="pagePath(a)" class="card hover:border-candle">
          <h2 class="text-2xl">{{ a.h1 }}</h2>
          <p class="mt-2 text-sm text-ash">{{ a.description.replaceAll('{city}', cfg.cityIn) }}</p>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
