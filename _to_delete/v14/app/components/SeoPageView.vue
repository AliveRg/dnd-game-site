<script setup lang="ts">
import { ALL_SEO_PAGES, pagePath, fillCity, type SeoPage } from '#shared/seo-pages'

const props = defineProps<{ page: SeoPage }>()
const cfg = useRuntimeConfig().public
const t = (s: string) => fillCity(s, cfg.cityIn, cfg.city)
const p = props.page
const isArticle = p.kind === 'article'

useSiteSeo({ title: t(p.title), description: t(p.description), type: isArticle ? 'article' : 'website' })

const site = cfg.siteUrl.replace(/\/$/, '')
const crumbs = isArticle
  ? [{ name: 'Главная', path: '/' }, { name: 'Статьи', path: '/klub#stati' }, { name: t(p.h1), path: pagePath(p) }]
  : [{ name: 'Главная', path: '/' }, { name: t(p.h1), path: pagePath(p) }]

const ld: object[] = [{
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: site + c.path }))
}]
if (isArticle) ld.push({ '@context': 'https://schema.org', '@type': 'Article', headline: t(p.h1), description: t(p.description), inLanguage: 'ru', author: { '@type': 'Organization', name: cfg.siteName } })
if (p.faq?.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: t(f.q), acceptedAnswer: { '@type': 'Answer', text: t(f.a) } })) })
useHead({ script: ld.map((x) => ({ type: 'application/ld+json', innerHTML: JSON.stringify(x) })) })

const related = p.related.map((s) => ALL_SEO_PAGES.find((x) => x.slug === s)).filter(Boolean) as SeoPage[]
</script>

<template>
  <article class="container-x max-w-4xl py-12">
    <nav class="mb-6 text-sm text-ash" aria-label="Хлебные крошки">
      <template v-for="(c, i) in crumbs" :key="c.path">
        <NuxtLink v-if="i < crumbs.length - 1" :to="c.path" class="hover:text-candle">{{ c.name }}</NuxtLink>
        <span v-else class="text-parchment/70">{{ c.name }}</span>
        <span v-if="i < crumbs.length - 1"> / </span>
      </template>
    </nav>

    <h1 class="text-4xl leading-tight md:text-5xl">{{ t(p.h1) }}</h1>
    <p class="mt-6 text-lg text-parchment/85">{{ t(p.intro) }}</p>

    <section v-for="s in p.sections" :key="s.h2" class="mt-10">
      <h2 class="text-3xl">{{ t(s.h2) }}</h2>
      <p class="mt-3 text-ash">{{ t(s.text) }}</p>
      <ul v-if="s.list" class="mt-3 list-disc space-y-1 pl-6">
        <li v-for="li in s.list" :key="li">{{ t(li) }}</li>
      </ul>
      <div v-if="s.link" class="mt-4 flex justify-end"><NuxtLink :to="s.link.to" class="btn-primary">{{ s.link.label }}</NuxtLink></div>
    </section>

    <section v-if="p.faq?.length" class="mt-12">
      <h2 class="text-3xl">Вопросы</h2>
      <FaqList class="mt-4" :items="p.faq.map((f) => ({ q: t(f.q), a: t(f.a) }))" />
    </section>

    <!-- CTA на каждой SEO-странице: статьи тоже ведут в запись -->
    <section class="card mt-10 grid items-center gap-8 md:grid-cols-2">
      <div>
        <p class="font-display text-3xl">{{ isArticle ? 'Хотите попробовать вживую?' : 'Запишитесь на партию' }}</p>
        <p class="mt-2 text-ash">4 часа истории с мастером - 2000 ₽ по акции. До 5 игроков.</p>
        <div class="mt-4 flex justify-end"><NuxtLink to="/raspisanie" class="btn-ghost">Расписание и цены</NuxtLink></div>
      </div>
      <QuickForm />
    </section>

    <section v-if="related.length" class="mt-14">
      <h2 class="mb-4 text-2xl">Читайте также</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink v-for="r in related" :key="r.slug" :to="pagePath(r)" class="card p-4 hover:border-candle">
          <p class="font-display text-xl">{{ t(r.h1) }}</p>
          <p class="mt-1 text-sm text-ash">{{ t(r.description) }}</p>
        </NuxtLink>
      </div>
    </section>
  </article>
</template>
