<script setup lang="ts">
const {data:content}=await useFetch<any>('/api/site-content',{key:'site-content'})
const image=computed(()=>content.value?.home?.images?.[0]?.url||'/images/club/07-world-maps-1600.webp')
</script>
<template><div class="absolute inset-0 overflow-hidden" aria-hidden="true"><img :src="image" alt="" fetchpriority="high" width="1672" height="941" class="absolute inset-0 h-full w-full object-cover object-center" /><div class="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink" /></div></template>
