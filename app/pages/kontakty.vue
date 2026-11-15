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
      <ul class="-mt-2 grid gap-3 sm:grid-cols-3">
        <!-- TODO: подставить адрес и ссылки клуба (Telegram, VK), когда их пришлёт заказчик -->
        <li class="contact-row"><img src="/art/ui-location.webp" alt="" /><span><b>Адрес</b>{{ cfg.city }}, уточняется</span></li>
        <li class="contact-row"><img src="/art/ui-telegram.webp" alt="" /><span><b>Telegram</b>скоро здесь</span></li>
        <li class="contact-row"><img src="/art/ui-vk.webp" alt="" /><span><b>ВКонтакте</b>скоро здесь</span></li>
      </ul>
      <div class="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,28rem)_1fr]">
        <QuickForm />
        <img src="/photos/room.webp" alt="Игровая комната клуба" class="photo-neon aspect-[3/4] w-full max-w-sm justify-self-center object-cover lg:justify-self-end" loading="lazy" decoding="async" />
      </div>
    </div>
  </section>
</template>

<style>
.contact-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px 10px 10px; border-radius: 14px; border: 1px solid #5a3416; background: linear-gradient(180deg, #24150a, #160c05); }
.contact-row img { width: 48px; height: 48px; flex: none; object-fit: contain; filter: drop-shadow(0 4px 6px #000a); }
.contact-row b { display: block; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #e0a24a; }
.contact-row span { color: #f3e6c8; font-size: 15px; }
</style>
