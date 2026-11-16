// Общие данные клуба: один запрос на всё приложение. При переходах между страницами берём уже загруженное,
// поэтому навигация не ждёт сервер. refresh() по-прежнему перезапрашивает.
const reuse = (key: string, nuxt: any, ctx: { cause: string }) => (ctx.cause === 'refresh:manual' ? undefined : nuxt.payload.data[key] ?? nuxt.static.data[key])

export const useGames = () => useFetch<any[]>('/api/games', { key: 'games', default: () => [], getCachedData: reuse })
export const useSessions = () => useFetch<any[]>('/api/sessions', { key: 'sessions', default: () => [], getCachedData: reuse })
