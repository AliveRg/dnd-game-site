<script setup lang="ts">
// FAQ: каждый вопрос - отдельная плашка, плюс превращается в крестик, ответ плавно раскрывается
defineProps<{ items: { q: string; a: string }[] }>()
</script>

<template>
  <div class="grid gap-3">
    <details v-for="(f, i) in items" :key="f.q" class="faq-item" :name="'faq'" :open="i === 0">
      <summary>
        <span class="faq-num">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="flex-1">{{ f.q }}</span>
        <span class="faq-plus" aria-hidden="true" />
      </summary>
      <p class="faq-a">{{ f.a }}</p>
    </details>
  </div>
</template>

<style>
:root { interpolate-size: allow-keywords; }
.faq-item { border-radius: 14px; border: 1px solid #4a1010; overflow: hidden;
  background: var(--panel);
  box-shadow: inset 0 1px 0 #ffffff0d, 0 4px 14px #0006; transition: border-color .25s, box-shadow .25s; }
.faq-item:hover { border-color: #DF000088; }
.faq-item[open] { border-color: #DF0000aa; box-shadow: inset 0 1px 0 #ffffff12, 0 6px 22px #000a, 0 0 18px #DF000022; }
.faq-item summary { list-style: none; display: flex; align-items: center; gap: 14px; padding: 16px 18px; cursor: pointer; font-size: 18px; color: #F7F2E6; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-num { font-family: var(--font-display); font-size: 20px; color: #DF0000; min-width: 26px; }
.faq-plus { position: relative; flex: none; width: 30px; height: 30px; border-radius: 50%; border: 1px solid #DF000077; transition: transform .35s cubic-bezier(.3,.7,.25,1), background .25s; }
.faq-plus::before, .faq-plus::after { content: ''; position: absolute; left: 50%; top: 50%; width: 12px; height: 2px; margin: -1px 0 0 -6px; border-radius: 2px; background: #ff8a7a; }
.faq-plus::after { transform: rotate(90deg); }
.faq-item[open] .faq-plus { transform: rotate(135deg); background: #DF000022; } /* «+» → «×» */
.faq-a { padding: 0 18px 18px 58px; color: #959595; line-height: 1.6; }
/* плавное раскрытие (Chrome/Edge; в остальных - мгновенно) */
.faq-item::details-content { block-size: 0; overflow: hidden; transition: block-size .35s ease, content-visibility .35s allow-discrete; }
.faq-item[open]::details-content { block-size: auto; }
@media (max-width: 640px) { .faq-a { padding-left: 18px; } .faq-item summary { font-size: 16px; } }
</style>
