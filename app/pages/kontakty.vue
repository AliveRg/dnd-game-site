<script setup lang="ts">
import {CLUB_PHONE,CLUB_PHONE_LABEL} from '#shared/club-content'
const cfg=useRuntimeConfig().public
const {data:content}=await useFetch<any>('/api/site-content',{key:'site-content'})
const address=computed(()=>content.value?.contacts?.address||`${cfg.city}, точный адрес уточните по телефону`)
const mapUrl=computed(()=>`https://yandex.ru/maps/?text=${encodeURIComponent(content.value?.contacts?.address||cfg.city)}`)
const {$ymGoal}=useNuxtApp()
useSiteSeo({title:`Контакты — клуб НРИ ${cfg.cityIn}`,description:`Телефон клуба ${CLUB_PHONE_LABEL}. Свяжитесь с нами, узнайте адрес и оставьте заявку на настольную ролевую игру.`})
</script>
<template><section class="section"><div class="container-x"><SectionTitle icon="candle" as="h1">{{content?.contacts?.title||'Контакты'}}</SectionTitle><div class="grid gap-8 lg:grid-cols-2"><div><a :href="`tel:${CLUB_PHONE}`" class="text-2xl text-candle" @click="$ymGoal('phone_click')">{{CLUB_PHONE_LABEL}}</a><p class="mt-4 text-lg text-ash">{{address}}</p><p v-if="content?.contacts?.text" class="mt-4 whitespace-pre-line text-ash">{{content.contacts.text}}</p><a :href="mapUrl" target="_blank" rel="noopener noreferrer" class="btn-ghost mt-6">Открыть карту и маршрут</a><p class="mt-3 text-sm text-ash">Точку клуба покажем после уточнения адреса.</p><div class="mt-8"><QuickForm /></div></div><img :src="content?.contacts?.images?.[0]?.url||'/images/club/06-room-960.webp'" :alt="content?.contacts?.images?.[0]?.alt||'Игровая комната клуба с картой на столе'" width="941" height="1672" class="max-h-[750px] w-full rounded-2xl object-cover object-top" /></div></div></section></template>
