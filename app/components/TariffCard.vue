<script setup lang="ts">
// Тариф как предмет D&D: обычный / редкий / легендарный. Анимации - только transform/opacity (дёшево для GPU).
import { TIER_LABEL, REGULAR_PRICE_4H, PROMO_UNTIL } from '#shared/utils/pricing'
const props = defineProps<{ t: { id: string; title: string; hours: number; price: number; note: string; tier: 'common' | 'rare' | 'legendary'; badge?: string }; selected?: boolean; compact?: boolean }>()
const until = new Date(PROMO_UNTIL).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
const embers = Array.from({ length: 7 }, (_, i) => ({ left: `${10 + i * 13}%`, '--d': `${2.2 + (i % 3) * 0.7}s`, '--delay': `${-i * 0.55}s` }))
</script>

<template>
  <div class="tariff" :class="[`t-${t.tier}`, { selected, compact }]">
    <span v-if="t.tier === 'legendary'" class="t-ring" aria-hidden="true" />
    <!-- Выбранный тариф отмечается 3D-монетой -->
    <Coin3D v-if="selected" class="t-coin" :size="compact ? 40 : 52" />
    <div class="t-body">
      <span v-if="t.tier === 'legendary'" class="t-embers" aria-hidden="true"><i v-for="(e, i) in embers" :key="i" :style="e" /></span>
      <div class="t-head">
        <span class="t-tier">{{ TIER_LABEL[t.tier] }}</span>
        <span v-if="t.badge" class="badge">{{ t.badge }}</span>
      </div>
      <img :src="`/art/tier-${t.tier}.webp`" alt="" class="t-gem" width="160" height="160" loading="lazy" decoding="async" />
      <p class="t-price">{{ t.price.toLocaleString('ru-RU') }} ₽</p>
      <p class="t-title">{{ t.title }}</p>
      <template v-if="!compact">
        <p class="mt-1 text-sm text-ash">с человека · {{ t.hours }} {{ t.hours === 6 ? 'часов' : 'часа' }} игры</p>
        <p v-if="t.id === 'promo4'" class="mt-1 text-xs text-candle">Акция до {{ until }}, далее {{ REGULAR_PRICE_4H }} ₽</p>
        <p class="mt-3 flex-1 text-sm text-parchment/80">{{ t.note }}</p>
        <div class="mt-4 flex justify-end"><slot /></div>
      </template>
    </div>
  </div>
</template>

<style>
.tariff { position: relative; border-radius: 16px; isolation: isolate; transition: transform var(--t) var(--ease); height: 100%; }
.tariff:hover { transform: translateY(-3px); }
/* Уголки растут с редкостью: corner-progression-1 → 3 → 4 */
.t-body { --cn: 'corner-progression-1'; position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; padding: 18px 18px 16px; border-radius: inherit; overflow: hidden;
  background: radial-gradient(90% 50% at 50% 30%, var(--tg, #7e451522), #0000 70%), linear-gradient(180deg, #24150a, #140b05); border: 1px solid #5a3416; box-shadow: inset 0 1px 0 #f2b45a14; }
.t-body::before { content: ''; position: absolute; inset: 3px; pointer-events: none; z-index: 2; background: var(--corners); }
.t-common .t-body { --corners: url('/art/corner-progression-1-tl.webp') top left / 40px no-repeat, url('/art/corner-progression-1-tr.webp') top right / 40px no-repeat, url('/art/corner-progression-1-bl.webp') bottom left / 40px no-repeat, url('/art/corner-progression-1-br.webp') bottom right / 40px no-repeat; }
.t-rare .t-body { --corners: url('/art/corner-progression-3-tl.webp') top left / 50px no-repeat, url('/art/corner-progression-3-tr.webp') top right / 50px no-repeat, url('/art/corner-progression-3-bl.webp') bottom left / 50px no-repeat, url('/art/corner-progression-3-br.webp') bottom right / 50px no-repeat; --tg: #e0a24a33; }
.t-legendary .t-body { --corners: url('/art/corner-progression-4-tl.webp') top left / 60px no-repeat, url('/art/corner-progression-4-tr.webp') top right / 60px no-repeat, url('/art/corner-progression-4-bl.webp') bottom left / 60px no-repeat, url('/art/corner-progression-4-br.webp') bottom right / 60px no-repeat; --tg: #c0392b33; }
.compact .t-body { padding: 12px; }
.compact .t-body::before { background-size: 30px; }
.t-head { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 24px; padding: 0 34px; }
.compact .t-head { padding: 0 18px; }
.t-tier { font-size: 10px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; }
.t-gem { width: 96px; height: 96px; margin: 4px auto 2px; object-fit: contain; filter: drop-shadow(0 8px 12px #000b); transition: transform var(--t-slow) var(--ease); }
.tariff:hover .t-gem { transform: translateY(-4px) rotate(-4deg) scale(1.05); }
.compact .t-gem { width: 54px; height: 54px; margin: 2px auto 0; }
.t-price { font-family: var(--font-display); font-size: 42px; line-height: 1; font-weight: 700; text-align: center; }
.compact .t-price { font-size: 26px; }
.t-title { margin-top: 4px; font-size: 15px; color: #f3e6c8; text-align: center; }
.compact .t-title { font-size: 12px; color: #b3a285; }

/* Обычный: бронза, спокойно */
.t-common .t-tier { color: #c79a6b; }
.t-common .t-price { color: #e6c8a3; }
.t-common.selected .t-body { border-color: #c79a6b; box-shadow: 0 0 0 1px #c79a6b66; }

/* Редкий: янтарь, мягкий свет свечи */
.t-rare .t-tier { color: #f2b45a; }
.t-rare .t-body { border-color: #a8813c; }
.t-rare .t-price { background: var(--gold-text); -webkit-background-clip: text; background-clip: text; color: transparent; }
.t-rare::after { content: ''; position: absolute; inset: -1px; z-index: 0; border-radius: inherit; opacity: .35; box-shadow: 0 0 24px #e0a24a77; transition: opacity var(--t) var(--ease); }
.t-rare:hover::after, .t-rare.selected::after { opacity: 1; }
.t-rare.selected .t-body { border-color: #f6c873; }

/* Легендарный: рубин, бегущая огненная рамка и искры */
.t-legendary .t-tier { color: #f2b45a; text-shadow: 0 0 8px #c0392b; }
.t-legendary .t-body { border-color: transparent; margin: 2px; height: calc(100% - 4px); }
.t-ring { position: absolute; inset: 0; z-index: 0; border-radius: inherit; overflow: hidden; }
.t-ring::before { content: ''; position: absolute; left: 50%; top: 50%; width: 250%; aspect-ratio: 1; translate: -50% -50%;
  background: conic-gradient(#7a1a12, #f6c873, #c0392b, #7e4515, #7a1a12); animation: t-spin 5s linear infinite; will-change: transform; }
.t-legendary { box-shadow: 0 0 26px #c0392b44; }
.t-legendary:hover, .t-legendary.selected { box-shadow: 0 0 36px #e0603a77; }
.t-legendary .t-gem { animation: t-gem 3s ease-in-out infinite; }
.t-legendary .t-price { background: linear-gradient(180deg, #fff1c9, #f2b45a 50%, #c0392b); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0 10px #c0392b55); }
.t-embers { position: absolute; inset: 0; pointer-events: none; z-index: -1; }
.t-embers i { position: absolute; bottom: -6px; width: 4px; height: 4px; border-radius: 50%; background: #f6c873; box-shadow: 0 0 6px #e0603a;
  animation: t-ember var(--d) linear infinite; animation-delay: var(--delay); opacity: 0; }
@keyframes t-spin { to { transform: rotate(360deg); } }
@keyframes t-gem { 50% { transform: translateY(-4px) scale(1.05); } }
@keyframes t-ember { 0% { transform: translateY(0) translateX(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-160px) translateX(10px); opacity: 0; } }
.t-coin { position: absolute !important; z-index: 3; top: -18px; right: -14px; }
@media (prefers-reduced-motion: reduce) { .t-ring::before, .t-legendary .t-gem, .t-embers i { animation: none; } }
</style>
