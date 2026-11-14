<script setup lang="ts">
// Согласие на обработку ПД.
// Первое нажатие на галочку открывает окно с текстом согласия → «Согласен» ставит галочку. Дальше галочка переключается свободно.
// Нажали «Отправить» без галочки → nudge(): под строкой появляется подсказка, а ссылка и галочка мягко подсвечиваются.
const model = defineModel<boolean>({ default: false })
const props = defineProps<{ field?: string }>()
const open = ref(false)
const read = ref(false)
const hint = ref(false)
const pulse = ref(0)
function toggle() {
  if (model.value) { model.value = false; return }
  if (read.value) model.value = true
  else open.value = true
}
function accept() { read.value = true; model.value = true; open.value = false }
function show() { open.value = true }
function nudge() { hint.value = true; pulse.value++ }
watch(model, (v) => v && (hint.value = false))
defineExpose({ show, nudge })
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (open.value = false)
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
const site = useRuntimeConfig().public.siteName
</script>

<template>
  <div>
    <div :key="pulse" class="consent-row flex items-start gap-2.5 text-xs text-ash" :class="hint && 'nudge'">
      <button type="button" role="checkbox" :aria-checked="model" :data-field="props.field" class="consent-box" :class="model && 'on'" aria-label="Согласие на обработку персональных данных" @click="toggle" />
      <span class="pt-px">Прочитал и согласен на
        <button type="button" class="consent-link" @click="show">обработку персональных данных</button></span>
    </div>
    <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-200" leave-to-class="opacity-0">
      <p v-if="hint" class="consent-hint" role="status">
        Отметьте галочку слева, чтобы отправить заявку. Текст согласия открывается по золотой ссылке.
      </p>
    </Transition>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
        <div v-if="open" class="fixed inset-0 z-[60] grid place-items-center bg-ink/85 p-4" role="dialog" aria-modal="true" aria-label="Согласие на обработку персональных данных" @click.self="open = false">
          <div class="card max-h-[85vh] w-full max-w-lg overflow-y-auto">
            <div class="mb-3 flex items-center gap-3">
              <DecorIcon name="scroll" class="h-12 w-12 flex-none" />
              <h3 class="text-3xl">Согласие на обработку данных</h3>
            </div>
            <div class="space-y-2 text-sm text-ash">
              <p>Отправляя заявку, я даю согласие клубу «{{ site }}» на обработку моих персональных данных: имени и контакта для связи (Telegram, VK или e-mail).</p>
              <p>Цель: связаться со мной по поводу записи на игру. Данные не передаются третьим лицам и хранятся не дольше, чем нужно для этой цели.</p>
              <p>Согласие можно отозвать в любой момент, написав нам. Полный текст: <NuxtLink to="/privacy?doc=soglasie" class="text-candle underline" @click="open = false">согласие на обработку</NuxtLink> и <NuxtLink to="/privacy" class="text-candle underline" @click="open = false">политика конфиденциальности</NuxtLink>.</p>
            </div>
            <div class="mt-5 flex justify-end gap-3">
              <button type="button" class="btn-ghost" @click="open = false">Закрыть</button>
              <button type="button" class="btn-primary" @click="accept">Согласен</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.consent-box { flex: none; width: 18px; height: 18px; margin-top: 1px; border-radius: 4px; border: 1px solid #3a3333; background: #040404; display: grid; place-content: center; cursor: pointer; transition: box-shadow .3s, border-color .3s; }
.consent-box.on { background: var(--gold); border-color: #ff8a7a; }
.consent-box.on::after { content: ''; width: 9px; height: 5px; border: 2px solid #040404; border-top: 0; border-right: 0; transform: rotate(-45deg) translate(1px, -1px); }
.consent-box:focus-visible { outline: 2px solid #DF0000; outline-offset: 2px; }
/* Ссылка на текст согласия - золотая плашка-подсветка, чтобы было видно, что это ссылка */
.consent-link { color: #F7F2E6; font-weight: 600; padding: 0 4px; margin: 0 -2px; border-radius: 4px; background: #DF00001f; box-shadow: inset 0 -1px 0 #DF000099; transition: background .2s, color .2s; }
.consent-link:hover { background: #DF000038; color: #F7F2E6; }
/* Мягкая подсказка: два спокойных «вдоха» свечения на галочке и ссылке */
.consent-row.nudge .consent-box { border-color: #ff8a7a; animation: c-glow 1.4s ease-in-out 2; }
.consent-row.nudge .consent-link { animation: c-glow 1.4s ease-in-out 2; }
@keyframes c-glow { 50% { box-shadow: 0 0 0 3px #DF000033, 0 0 14px #DF000066; } }
.consent-hint { margin-top: 8px; padding: 7px 10px 7px 12px; border-left: 2px solid #DF0000; border-radius: 0 8px 8px 0; background: #DF000012; font-size: 12px; line-height: 1.4; color: #EEE5CE; }
@media (prefers-reduced-motion: reduce) { .consent-row.nudge * { animation: none !important; } }
</style>
