<script setup lang="ts">
// «Доверься судьбе»: бросок d20 выбирает сюжет → карта переворачивается с ним → кнопка записи
import { shortTitle } from '#shared/story-art'
const { $ymGoal } = useNuxtApp()
const { data: games } = await useGames()

const dice = ref<{ roll: (n?: number) => Promise<number> }>()
const open = ref(false)
const flipped = ref(false)
const result = ref(0)
const game = ref<any>(null)

async function go() {
  if (!games.value.length || !dice.value) return
  open.value = false
  flipped.value = false
  const r = await dice.value.roll()
  result.value = r
  // одна и та же история не выпадает два раза подряд
  const list = games.value
  let i = (r - 1) % list.length
  if (list.length > 1 && list[i]?.slug === game.value?.slug) i = (i + 1 + (r % (list.length - 1))) % list.length
  game.value = list[i]
  $ymGoal('fate_roll', { result: r, game: game.value?.slug })
  open.value = true
  setTimeout(() => (flipped.value = true), 450)
}
function close() { open.value = false }
onMounted(() => window.addEventListener('keydown', (e) => e.key === 'Escape' && close()))
const verdict = computed(() => (result.value === 20 ? 'Критический успех!' : result.value === 1 ? 'Провал… но судьба даёт шанс' : `Выпало ${result.value}`))
</script>

<template>
  <div class="flex items-center gap-4">
    <Dice3D ref="dice" size="clamp(110px, 22vw, 170px)" label="Бросить кубик судьбы" @click="go" />
    <div>
      <p class="font-display text-2xl text-candle">Доверься судьбе</p>
      <p class="max-w-[16rem] text-sm text-ash">Брось кубик - и он выберет историю для твоей первой партии</p>
    </div>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0" leave-active-class="transition duration-200" leave-to-class="opacity-0">
        <div v-if="open && game" class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/85 p-4" role="dialog" aria-modal="true" aria-label="Выбор судьбы" @click.self="close">
          <div class="flex flex-col items-center gap-5 py-8">
            <div class="relative">
            <TarotCard v-model:flipped="flipped" :interactive="false" width="min(320px, 82vw)">
              <GameIcon :slug="game.slug" :width="230" class="mx-auto -mt-2 mb-1 w-full flex-none" />
              <p class="text-xs uppercase tracking-[.2em] text-[#5a3416]">{{ verdict }}</p>
              <p v-if="game.meta?.series" class="mt-3 text-[11px] uppercase tracking-widest text-[#6b4a24]">{{ game.meta.series }}</p>
              <p class="mt-1 font-display text-[28px] leading-none">{{ shortTitle(game.title, game.meta?.series) }}</p>
              <div class="mx-auto my-3 h-px w-2/3 bg-[#5a341666]" />
              <p class="line-clamp-3 text-sm leading-snug">{{ game.excerpt }}</p>
              <div class="mt-auto flex flex-wrap justify-center gap-2 pt-3">
                <span class="fate-tag">{{ game.meta?.kind }}</span>
                <span class="fate-tag gap-1.5"><IconPeople /> {{ game.meta?.players }}</span>
                <span v-if="game.meta?.level" class="fate-tag">ур. {{ game.meta.level }}</span>
                <span v-if="game.meta?.adult" class="fate-tag !bg-blood">18+</span>
              </div>
            </TarotCard>
            <!-- «?» - подробнее о сюжете: маленькая золотая кнопка над картой, не спорит с «Записаться» -->
            <NuxtLink v-show="flipped" :to="`/games/${game.slug}`" class="fate-more" title="Подробнее о сюжете" aria-label="Подробнее о сюжете" @click="close">?</NuxtLink>
            </div>
            <div class="flex flex-wrap justify-center gap-3">
              <button class="btn-ghost" @click="go"><img src="/art/decor-dice.webp" alt="" class="h-6 w-6 object-contain" />Бросить ещё</button>
              <NuxtLink to="#booking" class="btn-primary" @click="close">Записаться</NuxtLink>
            </div>
            <button class="fate-close" @click="close">Закрыть</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.fate-more { position: absolute; top: -12px; right: -12px; z-index: 2; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%;
  font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #100904; background: radial-gradient(circle at 35% 30%, #f3e6c8, #e0a24a 55%, #7e4515);
  box-shadow: 0 0 0 2px #100904, 0 0 0 3px #e0a24a77, 0 4px 10px #000a; opacity: .82; transition: opacity .2s, transform .2s, box-shadow .2s; animation: fate-more-in .4s .5s both; }
.fate-more:hover { opacity: 1; transform: scale(1.08); box-shadow: 0 0 0 2px #100904, 0 0 0 3px #f6c873, 0 0 16px #e0a24aaa; }
@keyframes fate-more-in { from { opacity: 0; transform: scale(.5); } }
.fate-close { font-size: 14px; color: #b3a285; text-decoration: underline; text-underline-offset: 3px; transition: color .2s, text-shadow .2s; }
.fate-close:hover { color: #fff; text-shadow: 0 0 10px #ffffff66; }
.fate-tag { display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: .02em;
  color: #f3e6c8; background: linear-gradient(180deg, #4a2a10, #2a1608); box-shadow: inset 0 1px 0 #ffffff22, 0 2px 4px #0005; }
</style>
