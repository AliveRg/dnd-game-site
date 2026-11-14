<template>
  <!-- Приглашение в генератор героя -->
  <div data-allow-mismatch="class" class="card relative grid items-center gap-6 overflow-hidden md:grid-cols-[auto_1fr_auto]">
    <DecorIcon name="potion" class="hidden h-28 w-28 drop-shadow-[0_8px_10px_#000c] md:block" />
    <div>
      <h3 class="text-3xl">Собери героя заранее</h3>
      <p class="mt-1 text-ash">Кость судьбы решает редкость героя, 4d6 - характеристики. На выходе полный лист: навыки, атаки, заклинания и снаряжение. Иногда выпадают легендарные.</p>
    </div>
    <div class="flex justify-end"><NuxtLink to="/generator-geroya" class="btn-primary">Генератор героя</NuxtLink></div>
  </div>
</template>
