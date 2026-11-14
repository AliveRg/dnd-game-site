<script setup lang="ts">
// Вход в подземелье: один раз за сессию, до первой отрисовки ставим data-intro на <html> (см. IntroGate.vue).
// Через 2.7 с атрибут снимается, чтобы анимации входа не мешали hover-эффектам.
useHead({
  script: [{
    tagPosition: 'head',
    innerHTML: "(function(){try{var d=document.documentElement;if(location.pathname.indexOf('/dragons')===0||sessionStorage.getItem('hv-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;sessionStorage.setItem('hv-intro','1');d.setAttribute('data-intro','');setTimeout(function(){d.removeAttribute('data-intro')},2700)}catch(e){}})()"
  }]
})
</script>

<template>
  <!-- Золотая полоска загрузки при переходах между страницами -->
  <NuxtLoadingIndicator color="linear-gradient(90deg,#9a5410,#ffd28a,#f0a040)" :height="3" :throttle="0" />
  <IntroGate />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
