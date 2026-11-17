<script setup lang="ts">
const route=useRoute()
const {data:post,error}=await usePreviewFetch<any>(`/api/posts/${route.params.slug}`)
if(error.value||!post.value||post.value.type!=='article')throw createError({statusCode:404,message:'Статья не найдена',fatal:true})
useSiteSeo({title:post.value.seo_title||post.value.title,description:post.value.seo_description||post.value.excerpt,image:post.value.cover||undefined,type:'article'})
</script>
<template><div><div class="container-x pt-8"><NuxtLink to="/stati" class="text-candle">← Статьи</NuxtLink></div><PublishedPost :post="post"/></div></template>
