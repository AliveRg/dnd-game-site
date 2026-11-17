<script setup lang="ts">
const route=useRoute()
const {data:post,error}=await usePreviewFetch<any>(`/api/posts/${route.params.slug}`)
if(error.value||!post.value||post.value.type!=='reference')throw createError({statusCode:404,message:'Материал не найден',fatal:true})
useSiteSeo({title:post.value.seo_title||post.value.title,description:post.value.seo_description||post.value.excerpt,image:post.value.cover||undefined,type:'article'})
</script>
<template><div><div class="container-x pt-8"><NuxtLink to="/spravochnik" class="text-candle">← Справочник</NuxtLink></div><PublishedPost :post="post"/></div></template>
