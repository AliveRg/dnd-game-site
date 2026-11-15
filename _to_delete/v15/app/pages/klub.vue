<script setup lang="ts">
// Объединённая страница: О клубе + Статьи + Новости
import { ARTICLES, pagePath } from '#shared/seo-pages'
const cfg = useRuntimeConfig().public
useSiteSeo({
  title: `Клуб НРИ ${cfg.cityIn}: о нас, статьи и новости`,
  description: `${cfg.siteName} - клуб настольных ролевых игр ${cfg.cityIn}. Как проходят игры, правила стола, гайды по D&D и новости клуба.`
})
const tab = ref<'news' | 'novelty' | 'article'>('news')
const { data: posts } = await useFetch<any[]>('/api/posts', { query: { type: tab }, default: () => [] })
const tabs = [{ id: 'news', label: 'Новости' }, { id: 'novelty', label: 'Новинки' }, { id: 'article', label: 'Заметки' }] as const
const rules = ['Уважаем других игроков и их время', 'Обсуждаем границы перед хоррор-историями', 'Отмена - не позже чем за 24 часа', 'Новичкам всегда помогаем с правилами']
</script>

<template>
  <div>
    <!-- О клубе -->
    <section id="o-klube" class="section">
      <div class="container-x grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionTitle icon="candle" as="h1">О клубе</SectionTitle>
          <p class="text-lg text-parchment/85">{{ cfg.siteName }} - клуб настольных ролевых игр {{ cfg.cityIn }}. Мастер готовит историю заранее, а вы просто приходите: кубики, листы персонажей, карты и миниатюры уже ждут на столе. <!-- TODO: текст заказчика --></p>
          <h3 class="mt-6 text-2xl">Мастер</h3>
          <div class="mt-3 flex flex-col gap-5 sm:flex-row">
            <img src="/photos/master.webp" alt="Мастер клуба за ширмой с указкой" class="photo-neon aspect-[3/4] w-full flex-none object-cover sm:w-56" loading="lazy" decoding="async" />
            <p class="text-ash">TODO: пара абзацев о мастере - опыт, любимые системы, стиль игры. Для SEO и доверия это один из самых важных блоков.</p>
          </div>
        </div>
        <div class="card">
          <h3 class="mb-3 text-2xl">Правила стола</h3>
          <ul class="space-y-2 text-ash">
            <li v-for="r in rules" :key="r" class="flex gap-2"><span class="text-candle">✦</span>{{ r }}</li>
          </ul>
          <div class="mt-5 flex justify-end"><NuxtLink to="/kontakty" class="btn-ghost">Как нас найти</NuxtLink></div>
        </div>
      </div>
    </section>

    <!-- Галерея -->
    <section id="galereya" class="section">
      <div class="container-x">
        <SectionTitle icon="candle">Фото клуба</SectionTitle>
        <PhotoGallery />
      </div>
    </section>

    <!-- Статьи (SEO) -->
    <section id="stati" class="section">
      <div class="container-x">
        <SectionTitle icon="book">Статьи о D&amp;D и НРИ</SectionTitle>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink v-for="a in ARTICLES" :key="a.slug" :to="pagePath(a)" class="card flex flex-col p-5 transition hover:border-candle/70">
            <h3 class="text-2xl">{{ a.h1 }}</h3>
            <p class="mt-2 flex-1 text-sm text-ash">{{ a.description.replaceAll('{city}', cfg.cityIn) }}</p>
            <span class="mt-3 self-end text-sm text-candle">Читать →</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Новости из админки -->
    <section id="novosti" class="section">
      <div class="container-x">
        <SectionTitle icon="scroll">Новости и новинки</SectionTitle>
        <div class="mb-6 flex flex-wrap gap-2">
          <button v-for="t in tabs" :key="t.id" class="nav-pill" :class="tab === t.id && 'router-link-exact-active'" @click="tab = t.id">{{ t.label }}</button>
        </div>
        <p v-if="!posts.length" class="text-ash">Пока пусто - скоро здесь появятся записи.</p>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink v-for="p in posts" :key="p.id" :to="`/news/${p.slug}`" class="card overflow-hidden p-0 hover:border-candle/70">
            <img v-if="p.cover" :src="p.cover" :alt="p.title" loading="lazy" class="aspect-[16/10] w-full object-cover" />
            <div class="p-5">
              <p class="text-xs text-ash">{{ new Date(p.created_at).toLocaleDateString('ru-RU') }}</p>
              <h3 class="mt-1 text-2xl">{{ p.title }}</h3>
              <p class="mt-2 text-sm text-ash">{{ p.excerpt }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
