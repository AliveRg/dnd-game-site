<script setup lang="ts">
import { privacyPolicy, consentText, LEGAL_UPDATED } from '#shared/legal'
// Два документа на одной странице, переключаются кнопками: /privacy и /privacy?doc=soglasie
const cfg = useRuntimeConfig().public
const route = useRoute()
const router = useRouter()
const doc = computed(() => (route.query.doc === 'soglasie' ? 'soglasie' : 'policy'))
const docs = {
  policy: { tab: 'Политика конфиденциальности', title: 'Политика конфиденциальности', blocks: privacyPolicy(cfg.siteName, cfg.siteUrl) },
  soglasie: { tab: 'Согласие на обработку данных', title: 'Согласие на обработку персональных данных', blocks: consentText(cfg.siteName, cfg.siteUrl) }
}
const cur = computed(() => docs[doc.value])
const pick = (d: 'policy' | 'soglasie') => router.replace({ query: d === 'policy' ? {} : { doc: d } })
useSiteSeo({ title: 'Политика конфиденциальности и согласие на обработку данных', description: 'Как клуб обрабатывает и защищает персональные данные. Текст согласия на обработку.' })
useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })
</script>

<template>
  <section class="section">
    <div class="container-x">
      <SectionTitle icon="scroll" as="h1">Документы</SectionTitle>
      <div class="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Документы">
        <button v-for="(d, k) in docs" :key="k" type="button" role="tab" :aria-selected="doc === k" class="doc-tab" :class="doc === k && 'on'" @click="pick(k)">{{ d.tab }}</button>
      </div>
      <article class="card max-w-[57rem] md:p-9" role="tabpanel">
        <h2 class="text-3xl md:text-4xl">{{ cur.title }}</h2>
        <p class="mt-2 text-xs uppercase tracking-widest text-candle">Редакция от {{ LEGAL_UPDATED }}</p>
        <ol class="legal mt-6">
          <li v-for="b in cur.blocks" :key="b.h">
            <h3>{{ b.h }}</h3>
            <p v-for="(t, i) in b.p" :key="i">{{ t }}</p>
          </li>
        </ol>
      </article>
    </div>
  </section>
</template>

<style>
.doc-tab { padding: 10px 16px; border-radius: 10px; font-weight: 600; font-size: 15px; color: #F7F2E6; border: 1px solid #4a1010;
  background: var(--panel); transition: border-color .25s, box-shadow .25s, color .25s; }
.doc-tab:hover { border-color: #DF0000aa; box-shadow: 0 0 16px #DF000044; }
.doc-tab.on { color: #040404; border-color: #ff8a7a; background: linear-gradient(180deg, #fff3, #0000 45%, #0002), var(--gold); box-shadow: inset 0 1px 0 #fff7, 0 0 18px #DF000044; }
.legal { counter-reset: lg; display: grid; gap: 22px; }
.legal > li { counter-increment: lg; position: relative; padding-left: 44px; }
.legal > li::before { content: counter(lg); position: absolute; left: 0; top: 0; width: 30px; height: 30px; display: grid; place-items: center; border-radius: 50%;
  font-size: 14px; font-weight: 800; color: #040404; background: var(--gold); box-shadow: inset 0 1px 0 #fff6, 0 2px 6px #0008; }
.legal h3 { font-size: 22px; line-height: 1.2; color: #F7F2E6; margin-bottom: 6px; }
.legal p { color: #c9c2b4; line-height: 1.6; margin-top: 6px; }
</style>
