<script setup lang="ts">
// После заявки: игрок бросает d20, карта-«золотой билет» переворачивается. 20 = бонус (результат выбрал сервер).
const props = defineProps<{ roll: number | null; bonus: boolean; bonusText?: string | null; title: string; when?: string; players: number; id?: number | null }>()
const { $ymGoal } = useNuxtApp()
const dice = ref<{ roll: (n?: number) => Promise<number> }>()
const flipped = ref(false)
const rolled = ref(false)

async function throwDice() {
  if (rolled.value) return
  if (props.roll && dice.value) await dice.value.roll(props.roll)
  rolled.value = true
  $ymGoal('booking_dice', { roll: props.roll, bonus: props.bonus })
  setTimeout(() => (flipped.value = true), 250)
}
</script>

<template>
  <div class="flex flex-col items-center gap-6 py-4 text-center sm:flex-row sm:items-center sm:text-left">
    <div v-if="roll" class="flex flex-col items-center gap-2">
      <Dice3D ref="dice" size="clamp(120px, 30vw, 150px)" label="Бросить кубик удачи" @click="throwDice" />
      <p class="max-w-[12rem] text-center text-sm text-ash">{{ rolled ? `Выпало ${roll}` : 'Брось d20 на удачу: выпадет 20 - бонус' }}</p>
    </div>
    <TarotCard v-model:flipped="flipped" :interactive="rolled || !roll" variant="gold" width="min(260px, 70vw)" :glow="bonus">
      <p class="text-[11px] font-semibold uppercase tracking-[.25em]">Подтверждено</p>
      <p class="mt-2 font-display text-[34px] leading-none">Золотой<br />билет</p>
      <div class="mx-auto my-3 h-px w-3/4 bg-[#5a3a1566]" />
      <p class="text-sm font-semibold">{{ title }}</p>
      <p v-if="when" class="text-xs">{{ when }}</p>
      <p class="mt-1 text-xs">Мест: {{ players }}<span v-if="id"> · заявка №{{ id }}</span></p>
      <p v-if="bonus" class="mt-auto rounded-lg bg-[#2b1608] px-2 py-1.5 text-xs text-[#f6d58a]">🎲 Критический успех! Бонус: {{ bonusText }}</p>
      <p v-else class="mt-auto text-[11px]">Мастер напишет вам в ближайшее время</p>
    </TarotCard>
  </div>
</template>
