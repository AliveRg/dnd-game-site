<script setup lang="ts">
import { TARIFFS, TARIFFS_BY_PRICE, MAX_PLAYERS, estimatePrice } from '#shared/utils/pricing'

interface Session {
  id: number
  starts_at: string
  duration_h: string
  max_players: number
  price: number
  is_weekly: boolean
  note: string
  game_slug: string | null
  game_title: string | null
  game_excerpt: string | null
  seats_left: number
  demo?: boolean
}

const { $ymGoal } = useNuxtApp()
const { data: realSessions, refresh } = await useSessions()
const { data: games } = await useGames()

const sessions = computed<Session[]>(() => realSessions.value)


// --- Календарь: 5 недель вперёд, начиная с понедельника текущей недели ---
const dayKey = (d: Date) => d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' }) // YYYY-MM-DD
const days = computed(() => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  return Array.from({ length: 35 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
})
const byDay = computed(() => {
  const m = new Map<string, Session[]>()
  for (const s of sessions.value) {
    const k = dayKey(new Date(s.starts_at))
    m.set(k, [...(m.get(k) ?? []), s])
  }
  return m
})
const todayKey = dayKey(new Date())
const selectedDay = ref<string | null>(null)
const selected = ref<Session | null>(null)
const daySessions = computed(() => (selectedDay.value ? byDay.value.get(selectedDay.value) ?? [] : []))

const dayFull = (k: string) => (byDay.value.get(k) ?? []).every((s) => s.seats_left === 0)
function pickDay(d: Date) {
  const k = dayKey(d)
  if (!byDay.value.has(k)) return
  selectedDay.value = k
  const list = byDay.value.get(k)!.filter((s) => s.seats_left > 0)
  selected.value = list.length === 1 ? list[0]! : null
}
const fmtTime = (s: string) => new Date(s).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' })
const fmtDate = (s: string) => new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long', timeZone: 'Europe/Moscow' })

// --- Форма ---
const form = reactive({ name: '', contact: '', players: 1, tariff: 'promo4', invitedBy: '', comment: '', consent: false, website: '' })
const maxSeats = computed(() => (selected.value ? Math.min(selected.value.seats_left, MAX_PLAYERS) : MAX_PLAYERS))
watch(maxSeats, (m) => { if (form.players > m) form.players = Math.max(1, m) })
const price = computed(() => estimatePrice(form.tariff, form.players))

const requestId = ref('')
const state = ref<'idle' | 'sending' | 'ok' | 'error'>('idle')
const error = ref('')
const { errors, check, clear } = useFormCheck<'name' | 'contact' | 'players' | 'consent'>()
const res = ref<{ id: number | null; roll: number | null; bonus: boolean; bonusText: string | null } | null>(null)
const sentTitle = ref('')
const sentWhen = ref('')
const sentPlayers = ref(1)
// Герой из генератора (/generator-geroya) - подставляем в комментарий
onMounted(() => {
  try {
    const hero = sessionStorage.getItem('hero')
    if (hero && !form.comment) form.comment = hero
  } catch {}
  window.addEventListener('tariff-pick', (e: any) => (form.tariff = e.detail))
  window.addEventListener('hero-ready', (e: any) => { form.comment = e.detail; try { sessionStorage.setItem('hero', e.detail) } catch {} })
})
const consentRef = ref<{ show: () => void; nudge: () => void }>()
async function submit() {
  if (!form.consent) { consentRef.value?.nudge(); return }
  const ok = check({
    name: () => (form.name.trim().length < 2 ? 'Как к вам обращаться?' : null),
    contact: () => (form.contact.trim().length < 3 ? 'Оставьте Telegram, VK или e-mail - напишем туда' : null),
    players: () => (form.players < 1 || form.players > maxSeats.value ? `Можно от 1 до ${maxSeats.value} мест` : null),
    consent: () => (!form.consent ? 'Нужно согласие, иначе мы не сможем ответить' : null)
  }, 'bk-')
  if (!ok) return
  state.value = 'sending'
  error.value = ''
  try {
    requestId.value ||= crypto.randomUUID()
    res.value = await $fetch('/api/calendar-booking', { method: 'POST', body: { ...form, source:'extended', requestId:requestId.value, sessionId: selected.value && !selected.value.demo ? selected.value.id : null,
      comment: selected.value?.demo ? `[Желаемая дата: ${fmtDate(selected.value.starts_at)}, ${fmtTime(selected.value.starts_at)}, ${selected.value.game_title}] ${form.comment}` : form.comment, utm: getUtm() } }) as any
    sentTitle.value = selected.value?.game_title ?? 'Партия - подберём дату'
    sentWhen.value = selected.value ? `${fmtDate(selected.value.starts_at)}, ${fmtTime(selected.value.starts_at)}` : ''
    sentPlayers.value = form.players
    state.value = 'ok'
    $ymGoal('booking_sent')
    refresh()
  } catch (e: any) {
    state.value = 'error'
    error.value = e?.data?.message || 'Не получилось отправить, попробуйте ещё раз'
  }
}
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-2">
    <!-- Календарь -->
    <div class="card">
      <div class="mb-3 grid grid-cols-7 text-center text-xs text-ash">
        <span v-for="w in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="w">{{ w }}</span>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="d in days"
          :key="d.toISOString()"
          type="button"
          class="relative aspect-square rounded-lg text-sm transition"
          :class="[
            !byDay.has(dayKey(d)) ? 'text-ash/40 cursor-default' : dayFull(dayKey(d)) ? 'day-full' : 'bg-candle/15 text-candle hover:bg-candle/30',
            selectedDay === dayKey(d) && 'ring-2 ring-candle',
            dayKey(d) === todayKey && 'font-bold underline'
          ]"
          @click="pickDay(d)"
        >
          {{ d.getDate() }}
          <span v-if="byDay.has(dayKey(d))" class="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" :class="dayFull(dayKey(d)) ? 'bg-[#b3a285]' : 'bg-candle'" />
        </button>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ash">
        <span class="inline-flex items-center gap-1.5"><i class="h-2 w-2 rounded-full bg-candle" />есть места</span>
        <span class="inline-flex items-center gap-1.5"><i class="h-2 w-2 rounded-full bg-[#b3a285]" />всё занято</span>
        <span v-if="!sessions.length" class="ml-auto text-xs text-ash">Дату согласуем при записи</span>
      </div>
      <div v-if="!selectedDay" class="mt-4 text-sm text-ash">Выберите подсвеченный день.</div>

      <div v-if="daySessions.length" class="mt-4 space-y-3">
        <button
          v-for="s in daySessions"
          :key="s.id"
          type="button"
          class="flex w-full items-center gap-4 rounded-xl border p-4 text-left transition"
          :class="s.seats_left === 0 ? 'cursor-not-allowed border-[#b3a28555] opacity-70' : selected?.id === s.id ? 'border-candle bg-candle/10' : 'border-wood-2 hover:border-candle/60'"
          :disabled="s.seats_left === 0"
          @click="selected = s"
        >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-semibold">{{ fmtTime(s.starts_at) }} · {{ s.game_title || 'Партия' }}</span>
              <span v-if="s.is_weekly" class="badge">История недели</span>
            </div>
            <p class="mt-1 text-sm text-ash">{{ Number(s.duration_h) }} ч · {{ s.price }} ₽ · <template v-if="s.seats_left">свободно мест: <b class="text-candle">{{ s.seats_left }}</b> из {{ s.max_players }}</template><b v-else class="text-[#b3a285]">мест нет, стол собран</b></p>
          </div>
          <!-- картинка мира этой истории -->
          <GameIcon :slug="s.game_slug" :width="96" class="h-16 w-24 flex-none object-contain" />
        </button>
      </div>
    </div>

    <!-- Форма -->
    <div class="card">
      <template v-if="state !== 'ok'">
        <p class="font-display text-2xl">
          {{ selected ? `${selected.game_title ?? 'Партия'} - ${fmtDate(selected.starts_at)}, ${fmtTime(selected.starts_at)}` : 'Заявка без даты - подберём сами' }}
        </p>
        <form class="mt-5 space-y-4 ym-hide-content" novalidate @submit.prevent="submit">
          <input v-model="form.website" class="hidden" tabindex="-1" autocomplete="off" />
          <div class="grid gap-4 sm:grid-cols-2">
            <div><label class="label">Имя</label><input v-model="form.name" data-field="bk-name" class="input" autocomplete="given-name" @input="clear('name')" /><FieldError :msg="errors.name" /></div>
            <div><label class="label">Telegram / VK / e-mail</label><input v-model="form.contact" data-field="bk-contact" class="input" @input="clear('contact')" /><FieldError :msg="errors.contact" /></div>
          </div>

          <div>
            <label class="label">Тариф</label>
            <div class="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Тариф">
              <label v-for="t in TARIFFS_BY_PRICE" :key="t.id" class="cursor-pointer">
                <input v-model="form.tariff" type="radio" :value="t.id" class="sr-only" />
                <TariffCard :t="t as any" :selected="form.tariff === t.id" compact />
              </label>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label">Сколько мест (вы + друзья)</label>
              <input v-model.number="form.players" data-field="bk-players" type="number" min="1" :max="maxSeats" class="input" @input="clear('players')" />
              <FieldError :msg="errors.players" />
            </div>
            <div>
              <label class="label">Кто вас пригласил (если есть)</label>
              <input v-model="form.invitedBy" class="input" placeholder="Имя / ник" />
            </div>
          </div>

          <div><label class="label">Комментарий</label> <textarea v-model="form.comment" rows="3" class="input min-h-[104px]" placeholder="Опыт в НРИ, пожелания…" /></div>

          <div class="price-plaque">
            <svg class="pp-coins" viewBox="0 0 64 64" aria-hidden="true">
              <defs><linearGradient id="ppg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e6c8" /><stop offset=".5" stop-color="#e0a24a" /><stop offset="1" stop-color="#7e4515" /></linearGradient></defs>
              <g stroke="#100904" stroke-width="1.5"><ellipse cx="24" cy="50" rx="17" ry="6" fill="url(#ppg)" /><path d="M7 44v6c0 3.3 7.6 6 17 6s17-2.7 17-6v-6" fill="#7e4515" /><ellipse cx="24" cy="44" rx="17" ry="6" fill="url(#ppg)" />
                <path d="M7 37v7c0 3.3 7.6 6 17 6s17-2.7 17-6v-7" fill="#7e4515" /><ellipse cx="24" cy="37" rx="17" ry="6" fill="url(#ppg)" />
                <circle cx="44" cy="24" r="14" fill="url(#ppg)" /><circle cx="44" cy="24" r="10" fill="none" stroke-dasharray="2 2" /></g>
              <text x="44" y="29" text-anchor="middle" font-size="13" font-weight="700" fill="#100904">₽</text>
            </svg>
            <div class="min-w-0">
              <p class="pp-cap">Казна партии · примерно</p>
              <p class="pp-sum">{{ price.total.toLocaleString('ru-RU') }} ₽</p>
              <p class="text-xs text-ash">за всю компанию · {{ form.players }} {{ form.players === 1 ? 'место' : form.players < 5 ? 'места' : 'мест' }}</p>
              <p v-if="price.discount" class="mt-1 text-xs font-semibold text-[#9fd08a]">скидка за друзей: -{{ price.discount }} ₽</p>
            </div>
            <p class="pp-note">Точную сумму подтвердит мастер</p>
          </div>

          <div>
            <ConsentCheck ref="consentRef" v-model="form.consent" field="bk-consent" @update:model-value="clear('consent')" />
            <FieldError :msg="errors.consent" />
          </div>

          <p v-if="selected && selected.seats_left === 0" class="text-sm text-red-400">На эту партию мест нет - выберите другую дату или оставьте заявку без даты.</p>
          <div class="flex justify-end">
            <button class="btn-primary" :class="!form.consent && 'opacity-60'" :disabled="state === 'sending' || (selected?.seats_left === 0)">{{ state === 'sending' ? 'Отправляем…' : 'Отправить заявку' }}</button>
          </div>
          <FieldError :msg="error" />
        </form>
      </template>
      <div v-else class="py-4">
        <p class="text-center font-display text-3xl sm:text-left">Место за столом ждёт</p>
        <LuckyTicket :roll="res?.roll ?? null" :bonus="!!res?.bonus" :bonus-text="res?.bonusText" :title="sentTitle" :when="sentWhen" :players="sentPlayers" :id="res?.id" />
      </div>
    </div>
  </div>
</template>

<style>
.day-full { color: #b3a285aa; background: repeating-linear-gradient(135deg, #b3a28522 0 4px, #0000 4px 8px); }
.day-full:hover { background-color: #b3a28522; }
/* «Казна партии»: блок с итоговой ценой */
.price-plaque { position: relative; display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 4px 16px; padding: 16px 18px 12px; border-radius: 14px;
  background: radial-gradient(90% 140% at 0% 50%, #e0a24a26, #0000 60%), linear-gradient(180deg, #23150a, #1a0f06);
  border: 1px solid #e0a24a66; box-shadow: inset 0 0 0 4px #100904, inset 0 0 0 5px #e0a24a33, 0 6px 18px #0008; }
.pp-coins { width: 64px; height: 64px; filter: drop-shadow(0 4px 8px #000a) drop-shadow(0 0 10px #e0a24a44); }
.pp-cap { font-size: 10px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: #e9dcc0; }
.pp-sum { font-family: var(--font-display); font-size: 38px; font-weight: 700; line-height: 1; background: var(--gold-text); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 2px 6px #e0a24a40); }
.pp-note { grid-column: 1 / -1; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e0a24a33; font-size: 11px; color: #b3a285; text-align: right; font-style: italic; }
</style>
