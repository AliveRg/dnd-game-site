<script setup lang="ts">
const cfg=useRuntimeConfig().public
const {data:content}=await useFetch<any>('/api/site-content',{key:'site-content'})
const {data:posts}=await useFetch<any[]>('/api/posts',{query:{type:'news'},default:()=>[]})
useSiteSeo({title:`О клубе — ${cfg.siteName}`,description:`Клуб настольных ролевых игр ${cfg.cityIn}: атмосфера, фотографии, новости и истории за игровым столом.`})
</script>
<template>
 <div><section class="section"><div class="container-x"><SectionTitle icon="candle" as="h1">{{content?.club?.title||'О клубе'}}</SectionTitle><p class="max-w-3xl whitespace-pre-line text-lg text-ash">{{content?.club?.text||`${cfg.siteName} — клуб настольных ролевых игр ${cfg.cityIn}. Приходите за историями, общением и атмосферой приключения. Кубики, карты, миниатюры и листы персонажей уже ждут на столе.`}}</p><div class="mt-6 flex flex-wrap gap-3"><NuxtLink to="/informaciya" class="btn-ghost">Как проходит игра</NuxtLink><NuxtLink to="/kontakty" class="btn-ghost">Как нас найти</NuxtLink></div></div></section>
 <section class="section"><div class="container-x"><SectionTitle icon="book">Фотографии клуба</SectionTitle><ClubGallery :images="content?.club?.images" /></div></section>
 <section id="novosti" class="section"><div class="container-x"><SectionTitle icon="scroll">Новости клуба</SectionTitle><p v-if="!posts.length" class="text-ash">Здесь появятся новости клуба.</p><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><NuxtLink v-for="post in posts" :key="post.id" :to="`/news/${post.slug}`" class="card"><img v-if="post.cover" :src="post.cover" :alt="post.meta?.coverAlt||post.title" loading="lazy" class="mb-4 aspect-video w-full rounded-xl object-cover"/><h3 class="text-2xl">{{post.title}}</h3><p class="mt-2 text-ash">{{post.excerpt}}</p></NuxtLink></div></div></section></div>
</template>
