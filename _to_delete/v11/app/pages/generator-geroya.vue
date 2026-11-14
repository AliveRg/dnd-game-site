<script setup lang="ts">
// Генератор героя D&D 5e: характеристики броском 4d6 (убрать меньший) ×6, вид и класс по PHB 2024.
// Результат - карта персонажа; «Записаться с этим героем» кладёт его в комментарий заявки.
useSiteSeo({
  title: 'Генератор персонажа D&D 5e онлайн - броски 4d6',
  description: 'Создайте героя D&D за минуту: бросьте характеристики 4d6, выберите вид и класс - и возьмите персонажа на первую игру в клубе.'
})
const { $ymGoal } = useNuxtApp()

const SPECIES = ['Аасимар', 'Голиаф', 'Гном', 'Дварф', 'Драконорождённый', 'Орк', 'Полурослик', 'Тифлинг', 'Человек', 'Эльф']
const CLASSES = ['Бард', 'Варвар', 'Воин', 'Волшебник', 'Друид', 'Жрец', 'Колдун', 'Монах', 'Паладин', 'Плут', 'Следопыт', 'Чародей']
const STATS = ['Сила', 'Ловкость', 'Телосложение', 'Интеллект', 'Мудрость', 'Харизма']

const name = ref('')
const species = ref(SPECIES[8]!)
const klass = ref(CLASSES[2]!)
const rolls = ref<{ dice: number[]; total: number }[]>([])
const rolling = ref(false)
const flipped = ref(false)

const d6 = () => 1 + Math.floor(Math.random() * 6)
const mod = (v: number) => { const m = Math.floor((v - 10) / 2); return (m >= 0 ? '+' : '') + m }
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]!
const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

async function rollStats() {
  rolling.value = true
  flipped.value = false
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  // «тряска» кубиков перед результатом
  for (let k = 0; k < (reduce ? 1 : 8); k++) {
    rolls.value = STATS.map(() => { const d = [d6(), d6(), d6(), d6()]; return { dice: d, total: 0 } })
    await new Promise((r) => setTimeout(r, 70))
  }
  rolls.value = STATS.map(() => {
    const d = [d6(), d6(), d6(), d6()]
    const total = d.reduce((a, b) => a + b, 0) - Math.min(...d)
    return { dice: d, total }
  })
  rolling.value = false
  $ymGoal('hero_generated')
  setTimeout(() => (flipped.value = true), 200)
}
function randomize() {
  species.value = pick(SPECIES)
  klass.value = pick(CLASSES)
}
const heroText = computed(() =>
  `Мой герой: ${name.value || 'Безымянный'}, ${species.value}, ${klass.value}. ` + rolls.value.map((r, i) => `${STATS[i]!.slice(0, 3)} ${r.total}`).join(', ')
)
function bookWithHero() {
  try { sessionStorage.setItem('hero', heroText.value) } catch {}
  // форма записи - внизу этой же страницы
  window.dispatchEvent(new CustomEvent('hero-ready', { detail: heroText.value }))
  scrollToEl('#booking')
}
const minDie = (d: number[]) => d.indexOf(Math.min(...d))
</script>

<template>
  <section class="section">
    <div class="container-x grid items-start gap-10 lg:grid-cols-[1fr_auto]">
      <div>
        <h1 class="section-title mb-3">Генератор героя</h1>
        <p class="mb-8 max-w-xl text-ash">Классический способ D&amp;D: для каждой характеристики бросаем 4 шестигранника и убираем меньший. Выберите вид и класс - и приходите играть этим героем.</p>

        <div class="card max-w-xl space-y-4">
          <div><label class="label">Имя героя</label><input v-model="name" class="input" placeholder="Например, Тордек" maxlength="40" /></div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div><label class="label">Вид</label><select v-model="species" class="input"><option v-for="s in SPECIES" :key="s">{{ s }}</option></select></div>
            <div><label class="label">Класс</label><select v-model="klass" class="input"><option v-for="c in CLASSES" :key="c">{{ c }}</option></select></div>
          </div>
          <div class="flex flex-wrap gap-3">
            <button class="btn-primary" :disabled="rolling" @click="rollStats">🎲 Бросить 4d6 ×6</button>
            <button class="btn-ghost" @click="randomize">Случайный вид и класс</button>
          </div>

          <div v-if="rolls.length" class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div v-for="(r, i) in rolls" :key="i" class="rounded-lg border border-wood-2 bg-ink/60 p-2 text-center">
              <p class="text-xs text-ash">{{ STATS[i] }}</p>
              <p class="text-xl tracking-wider">
                <span v-for="(d, j) in r.dice" :key="j" :class="!rolling && j === minDie(r.dice) ? 'opacity-30' : 'text-candle'">{{ FACES[d - 1] }}</span>
              </p>
              <p v-if="!rolling" class="font-display text-2xl">{{ r.total }} <span class="text-sm text-ash">({{ mod(r.total) }})</span></p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center gap-4 lg:sticky lg:top-28">
        <TarotCard v-model:flipped="flipped" :interactive="rolls.length > 0 && !rolling" variant="paper" width="min(300px, 80vw)">
          <p class="text-[11px] uppercase tracking-[.25em] text-[#8a5a1f]">{{ species }} · {{ klass }}</p>
          <p class="mt-1 font-display text-[30px] leading-tight">{{ name || 'Безымянный герой' }}</p>
          <div class="mx-auto my-3 h-px w-2/3 bg-[#8a5a1f66]" />
          <div class="grid grid-cols-3 gap-2">
            <div v-for="(r, i) in rolls" :key="i" class="rounded-md border border-[#8a5a1f55] bg-[#fff3] py-1">
              <p class="text-[10px] uppercase tracking-wider text-[#6b4a24]">{{ STATS[i]!.slice(0, 3) }}</p>
              <p class="font-display text-2xl leading-none">{{ r.total }}</p>
              <p class="text-[11px]">{{ mod(r.total) }}</p>
            </div>
          </div>
          <p class="mt-auto text-[11px] text-[#6b4a24]">Сумма: {{ rolls.reduce((a, r) => a + r.total, 0) }}</p>
        </TarotCard>
        <button v-if="rolls.length && !rolling" class="btn-primary" @click="bookWithHero">Записаться с этим героем</button>
        <p v-else class="text-sm text-ash">Бросьте кубики - карта откроется</p>
      </div>
    </div>
  </section>
</template>
