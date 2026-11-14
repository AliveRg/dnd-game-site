<script setup lang="ts">
const cfg = useRuntimeConfig().public
useSiteSeo({ title: `О клубе — ${cfg.siteName}, НРИ ${cfg.cityIn}`, description: 'Кто мы, как проходят игры, мастера и правила клуба настольных ролевых игр.' })
</script>

<template>
  <section class="container-x max-w-3xl py-12">
    <h1 class="text-4xl md:text-5xl">О клубе</h1>
    <p class="mt-6 text-lg text-parchment/85">{{ cfg.siteName }} — клуб настольных ролевых игр {{ cfg.cityIn }}. <!-- TODO: текст заказчика --></p>
    <h2 class="mt-10 text-3xl">Мастер</h2>
    <p class="mt-3 text-ash">TODO: фото и пара абзацев о мастере — опыт, любимые системы, стиль игры. Для SEO и доверия это один из самых важных блоков.</p>
    <h2 class="mt-10 text-3xl">Правила стола</h2>
    <ul class="mt-3 list-disc space-y-1 pl-6 text-ash">
      <li>Уважаем других игроков и их время</li>
      <li>Обсуждаем границы перед хоррор-историями</li>
      <li>Отмена — не позже чем за 24 часа</li>
    </ul>
  </section>
</template>
