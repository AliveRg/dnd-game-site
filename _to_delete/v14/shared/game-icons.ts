// Иллюстрации-иконки сюжетов, широкие (viewBox 0 0 120 64). Цвет - currentColor.
// Классы: f1/f2/f3 - заливки с разной прозрачностью, s - контур. Ключ - slug; без иконки → 'd20'.
const I: Record<string, string> = {
  // Городок: домики у леса, светятся окна, над ними тревожная луна
  gorodok: `
    <path class="f1" d="M4 58h112"/>
    <path class="f2 s" d="M10 58V40l-4 2 10-14 10 14-4-2v18Z M96 58V36l-4 2 10-15 10 15-4-2v22Z"/>
    <path class="f3 s" d="M28 58V38l12-10 12 10v20Z M56 58V34l14-12 14 12v24Z"/>
    <path class="s" d="M24 40l16-14 16 14M52 36l18-16 18 16"/>
    <rect class="f4" x="34" y="44" width="5" height="5"/><rect class="f4" x="63" y="40" width="5" height="5"/><rect class="f4" x="73" y="40" width="5" height="5"/>
    <path class="s" d="M66 58v-9h8v9M40 58v-6"/>
    <path class="f2" d="M100 10a7 7 0 1 0 6 11 6 6 0 1 1-6-11Z"/>`,
  // Потерянные во времени: снежный хребет, цитадель на вершине, песочные часы
  'vysshaya-instanciya-poteryannye-vo-vremeni': `
    <path class="f2 s" d="M2 60l22-30 10 12 16-28 18 26 10-12 20 32Z"/>
    <path class="f4" d="M44 22l6-8 6 9-4-2-3 4-3-3ZM20 36l4-6 4 5-3-1-2 2Z"/>
    <path class="f3 s" d="M44 30v-8h3v3h3v-3h3v8Z"/>
    <path class="s" d="M98 14h14M98 50h14M100 14c0 10 10 12 10 18s-10 8-10 18M110 14c0 10-10 12-10 18s10 8 10 18"/>
    <path class="f3" d="M103 44l2-4 2 4Z M102 18h6l-3 4Z"/>`,
  // Месть Полуросликов: контракт Асмодея с печатью и скрещённые клинки
  'vysshaya-instanciya-mest-poluroslikov': `
    <path class="f1 s" d="M38 10h44v38c0 4-3 6-6 6H44c-3 0-6-2-6-6Z"/>
    <path class="s" d="M46 20h28M46 27h28M46 34h18"/>
    <circle class="f3 s" cx="72" cy="44" r="7"/><path class="f4" d="M72 39l1.5 3.5 3.5.5-2.5 2.5.6 3.5-3.1-1.7-3.1 1.7.6-3.5-2.5-2.5 3.5-.5Z"/>
    <path class="s" d="M6 58 32 22M32 22l3-6 2 2-1 6M12 48l6 4M114 58 88 22M88 22l-3-6-2 2 1 6M108 48l-6 4"/>`,
  // Домик у Моря: таверна на сваях у пирса, корабль, волны
  'domik-u-morya': `
    <path class="f3 s" d="M14 38V24l14-10 14 10v14Z"/><path class="s" d="M10 26l18-14 18 14M24 38v-8h8v8"/>
    <path class="s" d="M8 38h40M14 38v14M28 38v14M42 38v14"/>
    <path class="f2 s" d="M74 44h36l-6 8H80Z"/><path class="s" d="M92 44V10"/><path class="f1 s" d="M92 12l14 26H92ZM92 16 80 38h12Z"/>
    <path class="s" d="M2 54c6 4 12 4 18 0s12-4 18 0 12 4 18 0 12-4 18 0 12 4 18 0 12-4 18 0"/>
    <path class="s" d="M10 61c6 3 12 3 18 0s12-3 18 0 12 3 18 0 12-3 18 0 12 3 18 0"/>`,
  // Бастион: крепость среди белых дюн
  bastion: `
    <path class="f1" d="M0 64c14-14 32-14 46-6 14-10 34-12 50-2 10-4 18-2 24 2v6Z"/>
    <path class="f3 s" d="M24 50V22h8v-6h4v6h4v-6h4v6h4v-6h4v6h4v-6h4v6h8v28Z"/>
    <path class="f2 s" d="M16 50V14h10v36ZM78 50V14h10v36Z"/>
    <path class="s" d="M14 14h14l-7-8ZM76 14h14l-7-8Z"/>
    <path class="f4" d="M46 50V38c0-4 3-6 6-6s6 2 6 6v12Z"/>
    <path class="s" d="M4 58c10-6 22-6 32 0M86 58c10-6 20-6 30 0"/>`,
  // Каштанище: колючее каштановое чудище с горящими глазами на дороге
  kashtanische: `
    <path class="f1" d="M10 60c20-6 80-6 100 0"/>
    <path class="f3 s" d="M60 14c16 0 26 11 26 24 0 12-11 20-26 20S34 50 34 38c0-13 10-24 26-24Z"/>
    <path class="s" d="M60 14V6M48 17l-4-7M72 17l4-7M38 26l-7-4M82 26l7-4M35 40h-8M85 40h8M40 52l-6 5M80 52l6 5"/>
    <path class="f4" d="M50 34l8 3-8 3ZM70 34l-8 3 8 3Z"/>
    <path class="s" d="M50 47c6 3 14 3 20 0"/>
    <path class="f2 s" d="M10 46c0-4 3-7 6-7s6 3 6 7-3 6-6 6-6-2-6-6ZM16 39V24l8-3"/>`,
  // Под Стеклом: две стеклянные комнаты с фигурами, глаз наблюдает из тьмы
  'pod-steklom': `
    <path class="f1 s" d="M14 26h36v32H14ZM70 26h36v32H70Z"/>
    <path class="s" d="M18 30l8 8M74 30l8 8"/>
    <circle class="f3" cx="32" cy="38" r="4"/><path class="f3" d="M26 58v-8c0-4 3-6 6-6s6 2 6 6v8Z"/>
    <circle class="f3" cx="88" cy="38" r="4"/><path class="f3" d="M82 58v-8c0-4 3-6 6-6s6 2 6 6v8Z"/>
    <path class="s" d="M44 12c10-8 22-8 32 0-10 8-22 8-32 0Z"/><circle class="f4" cx="60" cy="12" r="4"/>`,
  // Химера: зимний лес, следы на снегу и нож
  himera: `
    <path class="f1" d="M0 56c30-6 90-6 120 0v8H0Z"/>
    <path class="f2 s" d="M14 52 24 14l10 38ZM40 52l8-30 8 30ZM98 52l10-34 10 34Z"/>
    <path class="f4" d="M20 30l4-4 4 4ZM45 36l3-3 3 3ZM104 34l4-4 4 4Z"/>
    <path class="s" d="M64 50 90 24M90 24l6-2-2 6M70 44l-4-4"/>
    <circle class="f3" cx="62" cy="60" r="1.6"/><circle class="f3" cx="70" cy="58" r="1.6"/><circle class="f3" cx="78" cy="60" r="1.6"/><circle class="f3" cx="86" cy="58" r="1.6"/>
    <path class="s" d="M60 6v10M55 11h10M56.5 7.5l7 7M63.5 7.5l-7 7"/>`,
  // Налянск, Дело №7212: НИИ в зарослях гигантских лопухов, бабочка-мутант
  'nalyansk-delo-7212': `
    <path class="f3 s" d="M30 58V26h40v32Z"/><path class="s" d="M30 26l20-10 20 10M36 34h6v6h-6ZM48 34h6v6h-6ZM60 34h6v6h-6ZM36 46h6v6h-6ZM60 46h6v6h-6ZM48 58v-12h6v12"/>
    <path class="f2 s" d="M4 58c2-16 10-26 20-26-2 10-8 18-20 26ZM96 58c-2-16-10-26-20-26 2 10 8 18 20 26ZM88 58c6-20 18-28 28-26-4 12-12 20-28 26Z"/>
    <path class="s" d="M100 10v14"/>
    <path class="f4 s" d="M100 14c-4-8-14-8-14-2s6 8 14 6ZM100 14c4-8 14-8 14-2s-6 8-14 6ZM100 18c-6 0-12 4-10 8s8 0 10-6ZM100 18c6 0 12 4 10 8s-8 0-10-6Z"/>`,
  // Месть Гоблинов: голова гоблина с ушами и топор
  'mest-goblinov': `
    <path class="f3 s" d="M60 14c12 0 20 9 20 20 0 12-8 22-20 22S40 46 40 34c0-11 8-20 20-20Z"/>
    <path class="f2 s" d="M41 30 14 18l12 18ZM79 30l27-12-12 18Z"/>
    <path class="f4" d="M48 32l9 3-9 3ZM72 32l-9 3 9 3Z"/>
    <path class="s" d="M50 46c6 4 14 4 20 0M54 46l1 4M66 46l-1 4M58 41h4"/>
    <path class="s" d="M98 60 112 32M108 30c6-2 10 2 10 8l-8 0-4-6Z"/>`,
  // Смерть в стиле Диско: диско-шар, лупа детектива и галстук
  'smert-v-stile-disko': `
    <path class="s" d="M44 2v8"/><circle class="f2 s" cx="44" cy="26" r="16"/>
    <path class="s" d="M28 26h32M30 18h28M30 34h28M44 10c-7 7-7 25 0 32M44 10c7 7 7 25 0 32"/>
    <path class="f4" d="M36 15l3 3-3 3-3-3Z"/>
    <circle class="f1 s" cx="84" cy="34" r="12"/><path class="s" d="M93 43l14 14"/>
    <path class="s" d="M20 50l1 3 3 1-3 1-1 3-1-3-3-1 3-1ZM68 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>`,
  // Истории Высокой Травы: раскрытый журнал, из которого растёт трава, и дух-огонёк
  'istorii-vysokoy-travy': `
    <path class="f1 s" d="M60 58c-10-6-30-6-44-2V18c14-4 34-4 44 2ZM60 58c10-6 30-6 44-2V18c-14-4-34-4-44 2Z"/>
    <path class="s" d="M60 20v38M24 26c8-2 18-2 26 0M24 34c8-2 18-2 26 0M70 26c8-2 18-2 26 0"/>
    <path class="f3 s" d="M76 42c0-10-4-16-8-22 0 8 2 14 8 22ZM84 42c0-12 6-20 12-26-2 10-4 18-12 26ZM90 42c2-8 8-12 14-14-4 6-8 10-14 14Z"/>
    <circle class="f4" cx="36" cy="10" r="4"/><path class="s" d="M30 10h-4M46 10h-4M36 4V2"/>`,
  // Десять свечей: ряд свечей, часть уже погасла
  'desyat-svechey': `
    <path class="f1" d="M4 58h112"/>
    <path class="f3 s" d="M8 58V36h8v22ZM20 58V32h8v26ZM32 58V38h8v20ZM44 58V30h8v28ZM56 58V34h8v24ZM68 58V30h8v28ZM80 58V36h8v22ZM92 58V32h8v26ZM104 58V38h8v20Z"/>
    <path class="f4" d="M12 34c2-4 3-5 3-8-2 1-4 3-4 6 0 1 0 1 1 2ZM48 28c2-4 3-5 3-8-2 1-4 3-4 6 0 1 0 1 1 2ZM72 28c2-4 3-5 3-8-2 1-4 3-4 6 0 1 0 1 1 2ZM96 30c2-4 3-5 3-8-2 1-4 3-4 6 0 1 0 1 1 2Z"/>
    <path class="s" d="M24 32c0-3 1-5 3-7M36 38c0-3-1-5 1-8M60 34c0-3 2-5 0-8M84 36c0-3 1-5 3-7M108 38c0-3-1-5 1-8" opacity=".5"/>`,
  d20: `<path class="f2 s" d="M60 4 86 18v28L60 60 34 46V18Z"/><path class="s" d="M60 4 47 40h26ZM47 40 34 18M73 40l13-22M47 40l13 20 13-20"/>`
}
export const gameIcon = (slug?: string | null) => (slug && I[slug]) || I.d20!

// Название без серии: «Сказки Полуденного Королевства: Каштанище» → «Каштанище» (серия выводится отдельно)
export const shortTitle = (title: string, series?: string | null) =>
  series && title.startsWith(series) && title.includes(':') ? title.slice(title.indexOf(':') + 1).trim() : title
