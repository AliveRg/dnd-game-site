<script setup lang="ts">
// Плашка о cookie при первом заходе. Запоминаем выбор в localStorage.
const show = ref(false)
onMounted(() => {
  try { show.value = !localStorage.getItem('cookie-ok') } catch { show.value = true }
})
function ok() { show.value = false; try { localStorage.setItem('cookie-ok', '1') } catch {} }
</script>

<template>
  <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 translate-y-4" leave-active-class="transition duration-200" leave-to-class="opacity-0 translate-y-4">
    <div v-if="show" class="card fixed bottom-4 left-4 right-4 z-40 flex flex-col gap-3 p-4 sm:right-auto sm:max-w-md" role="dialog" aria-label="Уведомление о cookie">
      <div class="flex items-start gap-3">
        <img src="/decor/potion.webp" alt="" class="h-10 w-10 flex-none object-contain" />
        <p class="text-sm text-ash">Мы используем cookie и Яндекс Метрику, чтобы сайт работал и становился удобнее. Подробнее - в <NuxtLink to="/privacy" class="text-candle underline">политике</NuxtLink>.</p>
      </div>
      <div class="flex justify-end"><button class="btn-primary px-4 py-2 text-sm" @click="ok">Понятно</button></div>
    </div>
  </Transition>
</template>
