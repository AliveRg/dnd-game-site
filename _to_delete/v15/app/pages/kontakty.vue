<script setup lang="ts">
const cfg = useRuntimeConfig().public
useSiteSeo({ title: `Контакты - клуб НРИ ${cfg.cityIn}`, description: `Как нас найти: адрес клуба настольных ролевых игр ${cfg.cityIn}, Telegram, VK.` })
</script>

<template>
  <!-- Та же сетка, что у остальных блоков: левый край совпадает с заголовками ниже -->
  <section class="section">
    <div class="container-x">
      <SectionTitle icon="candle" as="h1">Контакты</SectionTitle>
      <!-- TODO: адрес, карта Яндекса (iframe), Telegram, VK, часы работы. Адрес + карта - сильный сигнал для локального SEO -->
      <p class="-mt-3 text-ash">{{ cfg.city }}, адрес уточняется.</p>
      <div class="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,28rem)_1fr]">
        <QuickForm />
        <img src="/photos/room.webp" alt="Игровая комната клуба" class="photo-neon aspect-[3/4] w-full max-w-sm justify-self-center object-cover lg:justify-self-end" loading="lazy" decoding="async" />
      </div>
    </div>
  </section>
</template>
