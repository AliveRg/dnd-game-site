<script setup lang="ts">
const cfg=useRuntimeConfig().public
const {data:posts}=await usePreviewFetch<any[]>('/api/posts',{query:{type:'article',limit:100},default:()=>[]})
useSiteSeo({title:'Статьи о D&D и настольных ролевых играх',description:'Материалы клуба: знакомство с настольными ролевыми играми, советы новичкам и истории за игровым столом.'})
</script>
<template><section class="section"><div class="container-x"><SectionTitle icon="book" as="h1">Статьи</SectionTitle><p v-if="!posts.length" class="text-ash">Материалы готовятся к публикации.</p><div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><NuxtLink v-for="post in posts" :key="post.id" :to="`/stati/${post.slug}`" class="card"><img v-if="post.cover" :src="post.cover" :alt="post.meta?.coverAlt||post.title" loading="lazy" class="mb-4 aspect-video w-full rounded-xl object-cover"/><h2 class="text-2xl">{{post.title}}</h2><p class="mt-2 text-ash">{{post.excerpt}}</p></NuxtLink></div></div></section></template>
