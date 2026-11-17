<script setup lang="ts">
import { CLUB_PHONE, CLUB_PHONE_LABEL, CLUB_ADDRESS } from '#shared/club-content'
const {data:content}=await useFetch<any>('/api/site-content',{key:'site-content'})
useSiteSeo({title:'Контакты D&D-Club — Белгород, проспект Славы, 9Г',description:'Очные игры D&D в Белгороде. Адрес — проспект Славы, 9Г. Телефон +7 (999) 999-99-99. Оставьте заявку на игру в клубе.'})
</script>
<template>
 <section class="section"><div class="container-x">
  <SectionTitle icon="candle" as="h1">{{content?.contacts?.title||'Контакты'}}</SectionTitle>
  <p class="mb-6 whitespace-pre-line text-ash">{{content?.contacts?.text||'D&D-Club — клуб настольных ролевых игр в городе Белгороде. Играем очно в клубе.'}}</p>
  <div class="grid gap-4 sm:grid-cols-2">
   <div class="card"><h2 class="text-2xl">Адрес клуба</h2><p class="mt-3">Белгород, {{CLUB_ADDRESS}}</p><a class="btn-ghost mt-4" href="https://yandex.ru/maps/?text=Белгород%2C%20проспект%20Славы%2C%209Г" target="_blank" rel="noopener">Показать на карте</a></div>
   <div class="card"><h2 class="text-2xl">Записаться по телефону</h2><a :href="'tel:'+CLUB_PHONE" class="mt-3 block text-2xl text-candle" @click="$ymGoal('phone_click')">{{CLUB_PHONE_LABEL}}</a><p class="mt-3 text-ash">Дату и время игры согласуем при записи.</p></div>
  </div>
  <div class="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]"><QuickForm/><img :src="content?.contacts?.images?.[0]?.url||'/photos/room.webp'" :alt="content?.contacts?.images?.[0]?.alt||'Игровая комната клуба в Белгороде'" class="photo-neon aspect-[16/11] w-full object-cover" loading="lazy"/></div>
 </div></section>
</template>
