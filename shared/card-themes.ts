// Тёплый свет мира за диорамой на лицевой стороне карты (остальное оформление карт общее: орех, латунь, пергамент).
export type CardTheme = { glow: string }
const T = (glow: string): CardTheme => ({ glow })

export const STORY_THEMES: Record<string, CardTheme> = {
  gorodok: T('#7fae5a'),
  'vysshaya-instanciya-poteryannye-vo-vremeni': T('#9fc0e0'),
  'domik-u-morya': T('#5fa8b0'),
  'vysshaya-instanciya-mest-poluroslikov': T('#e0603a'),
  bastion: T('#e8c47a'),
  kashtanische: T('#e0883a'),
  'pod-steklom': T('#8fd6e6'),
  himera: T('#b08ad0'),
  'nalyansk-delo-7212': T('#a8d04a'),
  'mest-goblinov': T('#e0a24a'),
  'smert-v-stile-disko': T('#e07ab0'),
  'istorii-vysokoy-travy': T('#a8d07a'),
  'desyat-svechey': T('#f2b45a')
}
export const CARD_VARIANTS: Record<'paper' | 'dark' | 'gold', CardTheme> = { paper: T('#e0a24a'), dark: T('#e0a24a'), gold: T('#f2b45a') }
export const storyTheme = (slug?: string | null) => (slug && STORY_THEMES[slug]) || CARD_VARIANTS.dark
