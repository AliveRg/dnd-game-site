<template>
  <!-- Приглашение в генератор героя -->
  <div data-allow-mismatch="class" class="card relative grid items-center gap-6 overflow-hidden md:grid-cols-[auto_1fr_auto]">
    <img src="/decor/potion.webp" alt="" class="hidden h-28 w-auto drop-shadow-[0_8px_10px_#000c] md:block" loading="lazy" />
    <div>
      <h3 class="text-3xl">Собери героя заранее</h3>
      <p class="mt-1 text-ash">Брось характеристики 4d6, выбери вид и класс - и приходи играть своим персонажем.</p>
    </div>
    <div class="flex justify-end"><NuxtLink to="/generator-geroya" class="btn-primary">Генератор героя</NuxtLink></div>
  </div>
</template>
