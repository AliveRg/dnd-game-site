<template>
  <!-- Золотая полоска загрузки при переходах между страницами -->
  <NuxtLoadingIndicator color="linear-gradient(90deg,#9a5410,#ffd28a,#f0a040)" :height="3" :throttle="0" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
