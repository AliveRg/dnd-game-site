// Картинка сюжета/мира: зона карты → файл в public/art (story-<zone>.webp и уменьшенная story-<zone>-sm.webp).
import { zoneOfGame } from './map-zones'

export function storyArt(slug?: string | null, small = false) {
  const zone = slug ? zoneOfGame(slug)?.id : undefined
  if (!zone) return '/art/dice-d20.webp'
  return `/art/story-${zone}${small ? '-sm' : ''}.webp`
}

// Название без серии: «Сказки Полуденного Королевства: Каштанище» → «Каштанище» (серия выводится отдельно)
export const shortTitle = (title: string, series?: string | null) =>
  series && title.startsWith(series) && title.includes(':') ? title.slice(title.indexOf(':') + 1).trim() : title
