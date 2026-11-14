// Цвета миров для карт и карты мира (плоский векторный стиль).
// c1 - фон карты, c2 - рамка и «земля», c3 - светлые детали, c4 - камень/акцент, ink - текст.
export type CardTheme = { c1: string; c2: string; c3: string; c4: string; ink: string }
const T = (c1: string, c2: string, c3: string, c4 = '#DF0000', ink = '#F7F2E6'): CardTheme => ({ c1, c2, c3, c4, ink })

export const STORY_THEMES: Record<string, CardTheme> = {
  gorodok: T('#1f3a2a', '#3f7a4f', '#a6e3a1'), // зелёный городок у леса
  'vysshaya-instanciya-poteryannye-vo-vremeni': T('#1b2a45', '#4a6fa8', '#bcd8ff'), // снежный хребет
  'domik-u-morya': T('#12343a', '#2b7c86', '#9fe6e6'), // морская гавань
  'vysshaya-instanciya-mest-poluroslikov': T('#3a0c12', '#a3182a', '#ff9a9a'), // трон Асмодея
  bastion: T('#3a2a14', '#a07a3a', '#f3d9a0', '#DF0000'), // белая пустыня
  kashtanische: T('#3a1e0e', '#b8561c', '#ffc58a'), // осеннее королевство
  'pod-steklom': T('#10303a', '#2f8fa6', '#b5f1ff'), // стеклянный купол
  himera: T('#24142e', '#6a3a86', '#d9b3ff', '#DF0000'), // мёртвый лес
  'nalyansk-delo-7212': T('#1e2a0e', '#6a8f1c', '#d8ff7a', '#DF0000'), // токсичный город
  'mest-goblinov': T('#2a2a12', '#7a7a2a', '#e8e08a'), // лагерь гоблинов
  'smert-v-stile-disko': T('#36102e', '#b8327a', '#ffb3e0'), // диско
  'istorii-vysokoy-travy': T('#1c3414', '#5f9a2c', '#d2f59a'), // высокая трава
  'desyat-svechey': T('#1a1430', '#4a3a8a', '#F7F2E6') // озеро свечей
}
export const CARD_VARIANTS: Record<'paper' | 'dark' | 'gold', CardTheme> = {
  paper: T('#F7F2E6', '#d9c49a', '#a8844a', '#DF0000', '#040404'),
  dark: T('#110e0e', '#5a0000', '#DF0000', '#DF0000'),
  gold: T('#f6d58a', '#a30000', '#F7F2E6', '#DF0000', '#040404')
}
export const storyTheme = (slug?: string | null) => (slug && STORY_THEMES[slug]) || CARD_VARIANTS.dark
