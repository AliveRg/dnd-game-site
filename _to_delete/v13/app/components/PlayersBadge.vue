<script setup lang="ts">
// Инфографика «сколько игроков»: золотой медальон с фигурками и числом
withDefaults(defineProps<{ players?: string | number; size?: 'xs' | 'sm' | 'md'; caption?: boolean }>(), { caption: true })
</script>

<template>
  <div class="players-badge" :class="size" :title="`Игроков: ${players}`">
    <IconPeople class="pb-ico" />
    <span class="pb-num">{{ /\d/.test(String(players ?? '')) ? players : '?' }}</span>
    <span v-if="caption" class="pb-cap">игроков</span>
  </div>
</template>

<style>
.players-badge { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; min-width: 58px; padding: 7px 8px 6px; border-radius: 14px;
  color: #040404; background: radial-gradient(120% 90% at 50% 0%, #fff4, #0000 55%), var(--gold); box-shadow: inset 0 1px 0 #fff8, inset 0 -2px 0 #0004, 0 4px 12px #000a, 0 0 0 2px #040404, 0 0 0 3px #DF000088; }
.players-badge .pb-ico { font-size: 18px; }
.players-badge .pb-num { font-family: var(--font-display); font-size: 22px; font-weight: 700; line-height: .9; }
.players-badge .pb-cap { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; opacity: .8; }
.players-badge.sm { min-width: 48px; padding: 5px 6px 4px; border-radius: 11px; }
.players-badge.sm .pb-ico { font-size: 14px; }
.players-badge.sm .pb-num { font-size: 18px; }
.players-badge.sm .pb-cap { font-size: 7.5px; }
/* xs: на лицевой стороне карты сюжета, на 15% меньше sm и без подписи */
.players-badge.xs { min-width: 41px; padding: 5px 5px 4px; border-radius: 9px; gap: 2px; }
.players-badge.xs .pb-ico { font-size: 12px; }
.players-badge.xs .pb-num { font-size: 15.5px; }
</style>
