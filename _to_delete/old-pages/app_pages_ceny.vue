<script setup lang="ts">
const cfg = useRuntimeConfig().public
useSiteSeo({ title: `Цены на игры D&D и НРИ ${cfg.cityIn} — от 1500 ₽`, description: `Стоимость партии ${cfg.cityIn}: 4 часа — 2000 ₽ по акции, 6 часов — 3000 ₽, по приглашению — 1500 ₽. Скидка за друзей.` })
</script>

<template>
  <section class="section">
    <div class="container-x">
      <h1 class="section-title">Цены</h1>
      <PricingCards />
      <div class="mt-12 text-center"><NuxtLink to="/raspisanie" class="btn-primary">Выбрать дату</NuxtLink></div>
    </div>
  </section>
</template>
