<script setup lang="ts">
// Объединённая страница: Цены + Расписание (календарь записи - блок внизу, он есть на каждой странице)
const cfg = useRuntimeConfig().public
useSiteSeo({
  title: `Расписание игр и цены - D&D и НРИ ${cfg.cityIn}`,
  description: `Ближайшие партии ${cfg.cityIn} и цены: 4 часа - 2000 ₽ по акции, 6 часов - 3000 ₽, по приглашению - 1500 ₽. Запись онлайн.`
})
</script>

<template>
  <section class="section">
    <div class="container-x">
      <SectionTitle icon="goblet" as="h1">Расписание и цены</SectionTitle>
      <PricingCards />
    </div>
  </section>
</template>
