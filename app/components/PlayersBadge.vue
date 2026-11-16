<script setup lang="ts">
// Инфографика «сколько игроков»: золотой медальон с фигурками и числом
withDefaults(defineProps<{ players?: string | number; size?: 'xs' | 'sm' | 'md'; caption?: boolean }>(), { caption: true })
</script>

<template>
  <div class="players-badge" :class="size" :title="`Игроков: ${players}`">
    <img src="/art/ui-players.webp" alt="" class="pb-ico object-contain" width="26" height="26" loading="lazy" />
    <span class="pb-num">{{ /\d/.test(String(players ?? '')) ? players : '?' }}</span>
    <span v-if="caption" class="pb-cap">игроков</span>
  </div>
</template>

<style>
.players-badge { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; min-width: 58px; padding: 6px 8px 6px; border-radius: 14px;
  color: #f3e6c8; background: radial-gradient(120% 90% at 50% 0%, #7e451555, #0000 60%), linear-gradient(180deg, #2f190a, #1d1107);
  border: 1px solid #a8813c; box-shadow: inset 0 1px 0 #f2b45a33, 0 4px 12px #000a; }
.players-badge .pb-ico { width: 26px; height: 26px; }
.players-badge .pb-num { font-family: var(--font-display); font-size: 22px; font-weight: 700; line-height: .9; color: #f2b45a; }
.players-badge .pb-cap { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; opacity: .8; }
.players-badge.sm { min-width: 48px; padding: 5px 6px 4px; border-radius: 11px; }
.players-badge.sm .pb-ico { width: 22px; height: 22px; }
.players-badge.sm .pb-num { font-size: 18px; }
.players-badge.sm .pb-cap { font-size: 7.5px; }
.players-badge.xs { min-width: 41px; padding: 4px 5px 4px; border-radius: 9px; }
.players-badge.xs .pb-ico { width: 18px; height: 18px; }
.players-badge.xs .pb-num { font-size: 15.5px; }
</style>
