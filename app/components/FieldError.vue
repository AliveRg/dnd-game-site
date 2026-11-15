<script setup lang="ts">
// Подсказка-ошибка поля в стиле сайта (вместо системного «Заполните это поле»)
defineProps<{ msg?: string | null }>()
</script>

<template>
  <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150" leave-to-class="opacity-0">
    <p v-if="msg" class="field-error" role="alert">
      <span class="field-error-ico" aria-hidden="true">!</span>{{ msg }}
    </p>
  </Transition>
</template>

<style>
.field-error { position: relative; z-index: 5; margin-top: 8px; display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px 7px 8px; border-radius: 10px;
  font-size: 13px; color: #f3e6c8; border: 1px solid #e0a24a99;
  background: #23150a;
  box-shadow: 0 8px 20px #000a, 0 0 12px #e0a24a33; }
.field-error::before { content: ''; position: absolute; top: -6px; left: 18px; width: 10px; height: 10px; transform: rotate(45deg);
  background: #2a1810; border-left: 1px solid #e0a24a99; border-top: 1px solid #e0a24a99; }
.field-error-ico { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; font-weight: 800; font-size: 13px; color: #100904;
  background: #e0a24a; box-shadow: inset 0 1px 0 #fff6; }
</style>
