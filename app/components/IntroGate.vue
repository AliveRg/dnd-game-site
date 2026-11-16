<script setup lang="ts">
// Вход в подземелье (~2.3 с, один раз за сессию): темнота → загораются два факела, виден вход с красным флагом →
// «шагаем» в проём → сайт проявляется сверху вниз. Только CSS: работает и до загрузки JS, сам исчезает.
// Включается атрибутом data-intro на <html> (ставит скрипт в app.vue), при reduced-motion и в админке не показывается.
</script>

<template>
  <div class="intro-gate" aria-hidden="true">
    <svg class="ig-scene" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="ig-light" cx=".5" cy=".55" r=".6">
          <stop offset="0" stop-color="#e0a24a" stop-opacity=".22" />
          <stop offset="1" stop-color="#100904" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="ig-torch" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#f6c873" stop-opacity=".6" />
          <stop offset="1" stop-color="#b16f23" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- каменная стена -->
      <rect width="400" height="300" fill="#140b05" />
      <g fill="#24150a" stroke="#100904" stroke-width="2">
        <path d="M0 40h60v26H0ZM62 40h70v26H62ZM334 40h66v26h-66ZM262 40h70v26h-70ZM0 68h35v26H0ZM37 68h70v26H37ZM300 68h70v26h-70ZM372 68h28v26h-28Z" />
        <path d="M0 96h60v26H0ZM62 96h66v26H62ZM272 96h66v26h-66ZM340 96h60v26h-60ZM0 124h40v26H0ZM42 124h70v26H42ZM288 124h70v26h-70ZM360 124h40v26h-40Z" />
        <path d="M0 152h60v26H0ZM62 152h70v26H62ZM268 152h70v26h-70ZM340 152h60v26h-60ZM0 180h36v26H0ZM38 180h76v26H38ZM286 180h76v26h-76ZM364 180h36v26h-36Z" />
        <path d="M0 208h60v26H0ZM62 208h72v26H62ZM266 208h72v26h-72ZM340 208h60v26h-60ZM0 236h44v26H0ZM46 236h80v26H46ZM274 236h80v26h-80ZM356 236h44v26h-44ZM0 264h400v36H0Z" />
      </g>
      <rect width="400" height="300" fill="url(#ig-light)" />
      <!-- арка из камней и тёмный проём -->
      <path d="M138 300V158a62 62 0 0 1 124 0V300Z" fill="#070402" />
      <g stroke="#0a0605" stroke-width="2">
        <path d="M122 300V158a78 78 0 0 1 156 0V300h-16V158a62 62 0 0 0-124 0V300Z" fill="#3a2c25" />
        <path d="M122 158a78 78 0 0 1 22-54l11 11a62 62 0 0 0-17 43Z" fill="#4a3a31" />
        <path d="M188 80h24l-3 17h-18Z" fill="#5a4639" />
        <path d="M122 200h16M122 245h16M262 200h16M262 245h16M150 96l10 12M250 96l-10 12" fill="none" />
      </g>
      <!-- красный флаг над входом -->
      <rect x="166" y="34" width="68" height="6" rx="3" fill="#a8813c" />
      <path d="M172 40h56v84l-28-15-28 15Z" fill="#7a1a12" />
      <path d="M200 40h28v84l-28-15Z" fill="#5a120c" />
      <path d="M176 44h48M176 114l24-12 24 12" stroke="#e0a24a" stroke-width="2" fill="none" />
      <image href="/art/logo-96.webp" x="179" y="52" width="42" height="42" />
      <!-- факелы -->
      <g v-for="x in [92, 308]" :key="x" :transform="`translate(${x} 150)`">
        <circle class="ig-glow" r="58" fill="url(#ig-torch)" />
        <path d="M-12 18h24l-4 8h-16Z" fill="#a8813c" />
        <path d="M-4 20h8l-2 46h-4Z" fill="#7a4a22" />
        <path d="M-9 4h18l-3 16H-6Z" fill="#45250e" />
        <path d="M-9 8h18M-8 13h16" stroke="#5a4232" stroke-width="2" />
        <g class="ig-flame">
          <path d="M0-36C9-24 13-17 13-9A13 13 0 0 1-13-9C-13-17-8-24 0-36Z" fill="#e07a2a" />
          <path d="M0-26C6-18 8-13 8-8A8 8 0 0 1-8-8C-8-13-5-18 0-26Z" fill="#f6c873" />
          <ellipse cy="-7" rx="3.4" ry="5" fill="#fff6dc" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style>
.intro-gate { display: none; }
[data-intro] .intro-gate { display: block; position: fixed; inset: 0; z-index: 200; background: #100904; pointer-events: none;
  animation: ig-out .55s 1.5s ease forwards; }
.ig-scene { width: 100%; height: 100%; display: block; transform-origin: 50% 70%;
  animation: ig-show .45s ease both, ig-enter 1.05s .55s cubic-bezier(.55, 0, .85, .35) forwards; }
.ig-flame { transform-origin: 0 -2px; animation: ig-ignite .4s .1s cubic-bezier(.3, 1.6, .5, 1) backwards, ig-flicker .16s ease-in-out infinite alternate; }
.ig-glow { animation: ig-glow .5s .15s ease backwards, ig-pulse .3s ease-in-out infinite alternate; }
@keyframes ig-show { from { opacity: 0; } }
@keyframes ig-enter { 0% { transform: scale(1); } 75% { opacity: 1; } 100% { transform: scale(3.4); opacity: 0; } }
@keyframes ig-ignite { from { transform: scale(0); } }
@keyframes ig-flicker { to { transform: scale(1.06, .93) skewX(3deg); } }
@keyframes ig-glow { from { opacity: 0; } }
@keyframes ig-pulse { to { opacity: .8; } }
@keyframes ig-out { to { opacity: 0; visibility: hidden; } }

/* Сайт проявляется сверху вниз - той же анимацией, что и блоки при прокрутке */
@keyframes intro-rv { from { opacity: 0; transform: translateY(26px); } }
[data-intro] header { animation: intro-rv .7s cubic-bezier(.2, .7, .2, 1) 1.45s both; }
[data-intro] main section:first-of-type > :not(.container-x),
[data-intro] main section:first-of-type .container-x > :not(.hero-frame),
[data-intro] .hero-frame > * { animation: intro-rv .7s cubic-bezier(.2, .7, .2, 1) both; animation-delay: calc(1.55s + var(--ii, 0) * .09s); }
[data-intro] main section:first-of-type > :not(.container-x) { animation-name: ig-show; animation-delay: 1.4s; }
[data-intro] .hero-frame > :nth-child(2), [data-intro] main section:first-of-type .container-x > :nth-child(2) { --ii: 1; }
[data-intro] .hero-frame > :nth-child(3), [data-intro] main section:first-of-type .container-x > :nth-child(3) { --ii: 2; }
[data-intro] .hero-frame > :nth-child(4), [data-intro] main section:first-of-type .container-x > :nth-child(4) { --ii: 3; }
[data-intro] .hero-frame > :nth-child(5), [data-intro] main section:first-of-type .container-x > :nth-child(5) { --ii: 4; }
[data-intro] .hero-frame > :nth-child(n + 6), [data-intro] main section:first-of-type .container-x > :nth-child(n + 6) { --ii: 5; }
</style>
