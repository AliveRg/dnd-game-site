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
.faq-item { border-radius: 14px; border: 1px solid #5a3416; overflow: hidden;
  background: var(--panel);
  box-shadow: inset 0 1px 0 #ffffff0d, 0 4px 14px #0006; transition: border-color .25s, box-shadow .25s; }
.faq-item:hover { border-color: #e0a24a88; }
.faq-item[open] { border-color: #e0a24aaa; box-shadow: inset 0 1px 0 #ffffff12, 0 6px 22px #000a, 0 0 18px #e0a24a22; }
.faq-item summary { list-style: none; display: flex; align-items: center; gap: 14px; padding: 16px 18px; cursor: pointer; font-size: 18px; color: #f3e6c8; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-num { font-family: var(--font-display); font-size: 20px; color: #e0a24a; min-width: 26px; }
.faq-plus { position: relative; flex: none; width: 30px; height: 30px; border-radius: 50%; border: 1px solid #e0a24a77; transition: transform .35s cubic-bezier(.3,.7,.25,1), background .25s; }
.faq-plus::before, .faq-plus::after { content: ''; position: absolute; left: 50%; top: 50%; width: 12px; height: 2px; margin: -1px 0 0 -6px; border-radius: 2px; background: #f6c873; }
.faq-plus::after { transform: rotate(90deg); }
.faq-item[open] .faq-plus { transform: rotate(135deg); background: #e0a24a22; } /* «+» → «×» */
.faq-a { padding: 0 18px 18px 58px; color: #b3a285; line-height: 1.6; }
/* плавное раскрытие (Chrome/Edge; в остальных - мгновенно) */
.faq-item::details-content { block-size: 0; overflow: hidden; transition: block-size .35s ease, content-visibility .35s allow-discrete; }
.faq-item[open]::details-content { block-size: auto; }
@media (max-width: 640px) { .faq-a { padding-left: 18px; } .faq-item summary { font-size: 16px; } }
</style>
