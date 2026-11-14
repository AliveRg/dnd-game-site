<script setup lang="ts">
// Предметы-декор в плоском векторном стиле (вместо 3D-картинок): свеча, свиток, ключ, книга, череп, кубок, зелье, гвозди.
// Палитра: золото клуба + фирменные цвета D&D (драконий красный #DF0000, пергамент #EEE5CE/#F7F2E6, серебро #959595).
import { SKULL_SVG } from '#shared/skull'
export type DecorName = 'candle' | 'scroll' | 'key' | 'book' | 'skull' | 'goblet' | 'potion' | 'nails'
defineProps<{ name: DecorName }>()

const spark = (x: number, y: number, s = 1) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0-4 1-1 4 0 1 1 0 4-1 1-4 0-1-1Z" fill="#ffd28a"/>`

const ICONS: Record<Exclude<DecorName, 'skull'>, string> = {
  candle: `
    <circle cx="32" cy="15" r="13" fill="#f0a040" opacity=".16"/>
    <ellipse cx="32" cy="55.5" rx="20" ry="5.5" fill="#9a5410"/>
    <ellipse cx="32" cy="53" rx="20" ry="5.5" fill="#f0a040"/>
    <path d="M50 51.5c7 0 7-8 0-8" fill="none" stroke="#f0a040" stroke-width="3" stroke-linecap="round"/>
    <rect x="24" y="24" width="16" height="29" rx="2" fill="#EEE5CE"/>
    <rect x="24" y="24" width="5" height="29" rx="2" fill="#F7F2E6"/>
    <rect x="35" y="24" width="5" height="29" rx="2" fill="#d6c59c"/>
    <ellipse cx="32" cy="24" rx="8" ry="2.4" fill="#F7F2E6"/>
    <path d="M26.5 24v8a1.8 1.8 0 0 0 3.6 0v-5" fill="#F7F2E6"/>
    <ellipse cx="32" cy="52.5" rx="12" ry="2.6" fill="#ffd28a" opacity=".5"/>
    <path d="M32 23.5v-3.5" stroke="#040404" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M32 3c5.5 6.5 7.5 9.5 7.5 13.2a7.5 7.5 0 0 1-15 0C24.5 12 28 8.6 32 3Z" fill="#DF0000"/>
    <path d="M32 8.5c3.2 4 4.4 6.2 4.4 8.2a4.4 4.4 0 0 1-8.8 0c0-2.6 1.8-4.8 4.4-8.2Z" fill="#f0a040"/>
    <ellipse cx="32" cy="17.4" rx="1.9" ry="2.8" fill="#fff6d8"/>
    ${spark(50, 12)}${spark(13, 22, 0.7)}`,
  key: `
    <g transform="rotate(-8 32 32)">
      <path fill-rule="evenodd" d="M20 7a12.5 12.5 0 1 1 0 25 12.5 12.5 0 1 1 0-25Zm0 6.5a6 6 0 1 0 0 12 6 6 0 1 0 0-12Z" fill="#f0a040"/>
      <path d="M9.6 14.5A12.5 12.5 0 0 1 20 7v6.5a6 6 0 0 0-4.7 2.3Z" fill="#ffd28a"/>
      <path d="M27 26 56 55l-4.2 4.2-29-29Z" fill="#f0a040"/>
      <path d="M27 26 56 55" stroke="#ffd28a" stroke-width="1.6"/>
      <path d="M46.5 45.5 39.6 52.4l3.4 3.4 6.9-6.9ZM39 38l-5.6 5.6 3.4 3.4 5.6-5.6Z" fill="#c07a26"/>
      <path d="M20 0l3.4 4.2L20 8.4l-3.4-4.2Z" fill="#DF0000" stroke="#fff6d8" stroke-width=".8"/>
    </g>${spark(54, 12)}`,
  scroll: `
    <g transform="rotate(-8 32 32)">
      <path d="M14 17h36v30H14Z" fill="#EEE5CE"/>
      <path d="M14 17h8v30h-8Z" fill="#F7F2E6"/>
      <rect x="9" y="11" width="46" height="9" rx="4.5" fill="#F7F2E6"/>
      <rect x="9" y="16" width="46" height="4" rx="2" fill="#d6c59c"/>
      <rect x="9" y="44" width="46" height="9" rx="4.5" fill="#F7F2E6"/>
      <rect x="9" y="49" width="46" height="4" rx="2" fill="#d6c59c"/>
      <path d="M20 26h24M20 31h19M20 36h22" stroke="#b9a882" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M39 46 36 61l5-3 4 3-1-15Z" fill="#a30000"/>
      <circle cx="41.5" cy="46" r="7.5" fill="#DF0000"/>
      <circle cx="41.5" cy="46" r="4.2" fill="none" stroke="#ff7a6a" stroke-width="1.3"/>
      <circle cx="39.4" cy="43.6" r="1.4" fill="#fff" opacity=".7"/>
    </g>`,
  book: `
    <rect x="16" y="11" width="37" height="45" rx="2.5" fill="#F7F2E6"/>
    <path d="M51 13v41M48 13v41" stroke="#d6c59c" stroke-width="1.4"/>
    <rect x="11" y="9" width="37" height="45" rx="3" fill="#a3121a"/>
    <rect x="11" y="9" width="8" height="45" rx="3" fill="#c41d24"/>
    <path d="M48 9v9l-9-9ZM48 54v-9l-9 9Z" fill="#f0a040"/>
    <path d="M11 13v-1a3 3 0 0 1 3-3h1v4Z M11 50v1a3 3 0 0 0 3 3h1v-4Z" fill="#f0a040"/>
    <circle cx="31" cy="31.5" r="10" fill="none" stroke="#f0a040" stroke-width="2.6"/>
    <path d="M31 24l6.4 3.7v7.4L31 38.8l-6.4-3.7v-7.4Z" fill="#DF0000" stroke="#ffd28a" stroke-width="1.3"/>
    <path d="M31 24v14.8M24.6 27.7l12.8 7.4M37.4 27.7l-12.8 7.4" stroke="#ff8a7a" stroke-width=".8" opacity=".8"/>
    <path d="M40 54v9l3-2.2 3 2.2v-9" fill="#DF0000"/>
    ${spark(56, 8)}`,
  goblet: `
    <path d="M15 9h34c0 15-6.5 23-17 23S15 24 15 9Z" fill="#f0a040"/>
    <path d="M18.5 9h8c0 13 2 19 5.5 23C22 31 18.5 21.5 18.5 9Z" fill="#ffd28a"/>
    <path d="M42 9h7c0 15-6.5 23-17 23 6-3 10-10 10-23Z" fill="#c07a26"/>
    <ellipse cx="32" cy="9" rx="17" ry="3.8" fill="#9a5410"/>
    <ellipse cx="32" cy="9.6" rx="14" ry="2.5" fill="#a30000"/>
    <path d="M29 31.5h6l-1 15h-4Z" fill="#c07a26"/>
    <ellipse cx="32" cy="38.5" rx="5.2" ry="2.6" fill="#f0a040"/>
    <path d="M19.5 53c0-4.4 6-6.8 12.5-6.8S44.5 48.6 44.5 53Z" fill="#f0a040"/>
    <ellipse cx="32" cy="53" rx="12.5" ry="3" fill="#9a5410"/>
    <path d="M32 15.5l4.3 4.3-4.3 4.3-4.3-4.3Z" fill="#DF0000" stroke="#fff6d8" stroke-width="1"/>
    ${spark(53, 14)}${spark(10, 30, 0.7)}`,
  potion: `
    <circle cx="32" cy="40" r="17" fill="#F7F2E6" fill-opacity=".1"/>
    <path d="M15.1 42Q23.6 38 32 42T48.9 42A17 17 0 0 1 15.1 42Z" fill="#DF0000"/>
    <path d="M15.1 42Q23.6 38 32 42T48.9 42" fill="none" stroke="#ff7a6a" stroke-width="1.6"/>
    <path d="M20.5 47.5a13 13 0 0 0 6.5 6" stroke="#ff9a8a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="38" cy="47" r="1.8" fill="#fff" opacity=".7"/><circle cx="34" cy="51" r="1.1" fill="#fff" opacity=".6"/>
    <circle cx="32" cy="40" r="17" fill="none" stroke="#EEE5CE" stroke-width="2.6"/>
    <path d="M27.5 14h9v10.5h-9Z" fill="#F7F2E6" fill-opacity=".12" stroke="#EEE5CE" stroke-width="2.6" stroke-linejoin="round"/>
    <rect x="25.5" y="7" width="13" height="8" rx="2.2" fill="#c07a26"/>
    <rect x="25.5" y="7" width="4.5" height="8" rx="2.2" fill="#e09a50"/>
    <path d="M21.5 31.5a13 13 0 0 1 6-6" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".85"/>
    ${spark(51, 20)}`,
  nails: `
    <g transform="translate(32 34)">
      <g transform="rotate(-24)"><rect x="-7" y="-27" width="14" height="4.5" rx="1.6" fill="#cfcfcf"/><path d="M-2.6-22.5h5.2v37L0 21l-2.6-6.5Z" fill="#959595"/><path d="M-2.6-22.5H-1v37l-1.6 1.5Z" fill="#d8d8d8"/></g>
      <g transform="rotate(14) translate(6 2)"><rect x="-7" y="-27" width="14" height="4.5" rx="1.6" fill="#cfcfcf"/><path d="M-2.6-22.5h5.2v37L0 21l-2.6-6.5Z" fill="#959595"/><path d="M-2.6-22.5H-1v37l-1.6 1.5Z" fill="#d8d8d8"/></g>
      <g transform="rotate(48) translate(4 6)"><rect x="-7" y="-27" width="14" height="4.5" rx="1.6" fill="#cfcfcf"/><path d="M-2.6-22.5h5.2v37L0 21l-2.6-6.5Z" fill="#7a7a7a"/><path d="M-2.6-22.5H-1v37l-1.6 1.5Z" fill="#bdbdbd"/></g>
    </g>`
}
</script>

<template>
  <svg v-if="name === 'skull'" viewBox="0 0 100 100" class="decor-icon" aria-hidden="true" v-html="SKULL_SVG" />
  <svg v-else viewBox="0 0 64 64" class="decor-icon" aria-hidden="true" v-html="ICONS[name]" />
</template>

<style>
.decor-icon { display: block; overflow: visible; }
</style>
