<template>
  <!-- Логотип: расписной череп на фоне кубиков (public/art/logo.webp, исходник public/test-assets/png/logo-skull.png) -->
  <img src="/art/logo-96.webp" srcset="/art/logo-96.webp 1x, /art/logo.webp 2x" alt="" width="44" height="44" class="logo-skull" decoding="async" />
</template>

<style>
.logo-skull { width: 44px; height: 44px; flex: none; object-fit: contain; filter: drop-shadow(0 2px 6px #000c) drop-shadow(0 0 10px #f2b45a33); transition: transform var(--t) var(--ease); }
a:hover > .logo-skull { transform: rotate(-6deg) scale(1.06); }
</style>
