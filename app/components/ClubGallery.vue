<script setup lang="ts">
import {CLUB_PHOTOS} from '#shared/club-content'
const props=defineProps<{images?:{url:string;alt:string}[]}>()
const images=computed(()=>props.images??CLUB_PHOTOS)
</script>
<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <figure v-for="image in images" :key="image.url" class="card overflow-hidden !p-0">
      <img :src="image.url" :srcset="image.url.includes('/images/club/') ? `${image.url.replace('-960.webp','-480.webp')} 480w, ${image.url} 960w, ${image.url.replace('-960.webp','-1600.webp')} 1600w`:undefined" sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" :alt="image.alt" width="941" height="1672" loading="lazy" class="aspect-[4/5] w-full object-cover object-top" />
      <figcaption class="p-3 text-sm text-ash">{{image.alt}}</figcaption>
    </figure>
  </div>
</template>
