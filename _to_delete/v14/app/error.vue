<script setup lang="ts">
// 404 «Ты заблудился в подземелье»: бросок d20 решает, куда выведет тропа.
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error?.statusCode === 404)
useHead({ title: is404.value ? 'Страница не найдена' : 'Ошибка', meta: [{ name: 'robots', content: 'noindex' }] })

const dice = ref<{ roll: (n?: number) => Promise<number> }>()
const msg = ref('')
const busy = ref(false)
const PATHS: { range: [number, number]; to: string; text: string }[] = [
  { range: [20, 20], to: '/raspisanie', text: 'Критический успех! Портал ведёт прямо к расписанию игр' },
  { range: [17, 19], to: '/', text: 'Ты нашёл выход на главную площадь' },
  { range: [13, 16], to: '/games#karta', text: 'В сундуке оказалась карта миров' },
  { range: [7, 12], to: '/games', text: 'Тропа выводит к библиотеке сюжетов' },
  { range: [2, 6], to: '/klub#stati', text: 'Ты забрёл в читальный зал. Тоже неплохо' }
]
async function roll() {
  if (busy.value || !dice.value) return
  busy.value = true
  const r = await dice.value.roll()
  if (r === 1) { msg.value = 'Критический провал! Ловушка захлопнулась. Брось ещё раз'; busy.value = false; return }
  const p = PATHS.find((x) => r >= x.range[0] && r <= x.range[1])!
  msg.value = `Выпало ${r}. ${p.text}…`
  setTimeout(() => clearError({ redirect: p.to }), 1600)
}
</script>

<template>
  <NuxtLayout>
    <section class="container-x flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <template v-if="is404">
        <p class="font-display text-7xl text-candle">404</p>
        <h1 class="mt-2 text-3xl md:text-4xl">Ты заблудился в подземелье</h1>
        <p class="mt-3 max-w-md text-ash">Факел догорает, а коридоры все одинаковые. Брось кубик - и посмотрим, куда выведет судьба.</p>
        <div class="my-8"><Dice3D ref="dice" size="180px" label="Бросить кубик, чтобы найти путь" @click="roll" /></div>
        <p class="min-h-[1.5rem] text-lg" aria-live="polite">{{ msg || 'Нажми на кубик' }}</p>
        <NuxtLink to="/" class="mt-6 text-sm text-ash underline" @click.prevent="clearError({ redirect: '/' })">или просто вернуться на главную</NuxtLink>
      </template>
      <template v-else>
        <h1 class="text-4xl">Что-то пошло не так</h1>
        <p class="mt-3 text-ash">{{ error?.statusCode }} - попробуйте обновить страницу.</p>
        <button class="btn-primary mt-6" @click="clearError({ redirect: '/' })">На главную</button>
      </template>
    </section>
  </NuxtLayout>
</template>
