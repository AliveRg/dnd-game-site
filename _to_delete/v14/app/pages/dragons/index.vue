<script setup lang="ts">
// Простая админка: заявки, расписание партий, контент (сюжеты / новости / новинки / статьи)
definePageMeta({ layout: false })
useHead({ title: 'Драконы - админка', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const me = ref<{ admin: boolean; db: boolean } | null>(null)
const login = reactive({ login: '', password: '' })
const loginError = ref('')
const tab = ref<'bookings' | 'sessions' | 'posts'>('bookings')

async function loadMe() { me.value = await $fetch('/api/admin/me') }
async function doLogin() {
  loginError.value = ''
  try { await $fetch('/api/admin/login', { method: 'POST', body: login }); await loadMe(); loadAll() }
  catch (e: any) { loginError.value = e?.data?.message || 'Ошибка входа' }
}
async function logout() { await $fetch('/api/admin/logout', { method: 'POST' }); me.value = { admin: false, db: me.value?.db ?? false } }

// ---- данные ----
const bookings = ref<any[]>([])
const sessions = ref<any[]>([])
const posts = ref<any[]>([])
const games = computed(() => posts.value.filter((p) => p.type === 'game'))
async function loadAll() {
  if (!me.value?.admin || !me.value.db) return
  ;[bookings.value, sessions.value, posts.value] = await Promise.all([
    $fetch<any[]>('/api/admin/bookings'), $fetch<any[]>('/api/admin/sessions'), $fetch<any[]>('/api/admin/posts')
  ])
}
onMounted(async () => { await loadMe(); loadAll() })

async function setBookingStatus(b: any, status: string) {
  await $fetch(`/api/admin/bookings/${b.id}`, { method: 'PUT', body: { status } }); b.status = status
}

// ---- расписание ----
const emptySession = () => ({ id: null as number | null, game_id: null as number | null, starts_at: '', duration_h: 4, max_players: 5, price: 2000, is_weekly: false, note: '', status: 'open' })
const sForm = reactive(emptySession())
const toLocalInput = (iso: string) => { const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) }
function editSession(s: any) { Object.assign(sForm, { ...s, starts_at: toLocalInput(s.starts_at) }) }
async function saveSession() {
  const body = { ...sForm, starts_at: new Date(sForm.starts_at).toISOString() }
  if (sForm.id) await $fetch(`/api/admin/sessions/${sForm.id}`, { method: 'PUT', body })
  else await $fetch('/api/admin/sessions', { method: 'POST', body })
  Object.assign(sForm, emptySession()); loadAll()
}
async function delSession(id: number) { if (confirm('Удалить партию?')) { await $fetch(`/api/admin/sessions/${id}`, { method: 'DELETE' }); loadAll() } }

// ---- контент ----
const TYPES = [{ id: 'game', label: 'Сюжет' }, { id: 'news', label: 'Новость' }, { id: 'novelty', label: 'Новинка' }, { id: 'article', label: 'Статья' }]
const emptyPost = () => ({ id: null as number | null, type: 'news', slug: '', title: '', excerpt: '', body: '', cover: '', metaText: '{}', seo_title: '', seo_description: '', published: true })
const pForm = reactive(emptyPost())
const pError = ref('')
function editPost(p: any) { Object.assign(pForm, { ...p, cover: p.cover || '', seo_title: p.seo_title || '', seo_description: p.seo_description || '', metaText: JSON.stringify(p.meta ?? {}, null, 2) }); window.scrollTo({ top: 0 }) }
async function savePost() {
  pError.value = ''
  let meta = {}
  try { meta = JSON.parse(pForm.metaText || '{}') } catch { pError.value = 'meta - невалидный JSON'; return }
  const body = { ...pForm, meta }
  try {
    if (pForm.id) await $fetch(`/api/admin/posts/${pForm.id}`, { method: 'PUT', body })
    else await $fetch('/api/admin/posts', { method: 'POST', body })
    Object.assign(pForm, emptyPost()); loadAll()
  } catch (e: any) { pError.value = e?.data?.message || 'Ошибка сохранения' }
}
async function delPost(id: number) { if (confirm('Удалить запись?')) { await $fetch(`/api/admin/posts/${id}`, { method: 'DELETE' }); loadAll() } }
const uploading = ref(false)
async function upload(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return
  uploading.value = true
  try { const fd = new FormData(); fd.append('file', f); const r = await $fetch<{ url: string }>('/api/admin/upload', { method: 'POST', body: fd }); pForm.cover = r.url }
  catch (err: any) { pError.value = err?.data?.message || 'Ошибка загрузки' }
  finally { uploading.value = false }
}
const fmt = (s: string) => (s ? new Date(s).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : '-')
</script>

<template>
  <div class="min-h-dvh bg-ink p-4 text-sm text-parchment md:p-8">
    <!-- Вход -->
    <div v-if="me && !me.admin" class="mx-auto mt-24 max-w-sm card">
      <p class="mb-4 font-display text-3xl text-candle">🐉 Драконы</p>
      <form class="space-y-3" @submit.prevent="doLogin">
        <input v-model="login.login" class="input" placeholder="Логин" autocomplete="username" />
        <input v-model="login.password" type="password" class="input" placeholder="Пароль" autocomplete="current-password" />
        <button class="btn-primary w-full">Войти</button>
        <p v-if="loginError" class="text-red-400">{{ loginError }}</p>
      </form>
    </div>

    <div v-else-if="me?.admin" class="mx-auto max-w-6xl">
      <div class="mb-6 flex items-center justify-between">
        <p class="font-display text-3xl text-candle">🐉 Драконы</p>
        <button class="btn-ghost py-2" @click="logout">Выйти</button>
      </div>
      <p v-if="!me.db" class="card mb-6 border-red-500">БД не подключена - задайте NUXT_DATABASE_URL.</p>

      <div class="mb-6 flex gap-2">
        <button v-for="t in [{ id: 'bookings', l: `Заявки (${bookings.filter(b => b.status === 'new').length})` }, { id: 'sessions', l: 'Расписание' }, { id: 'posts', l: 'Контент' }]" :key="t.id" class="btn-ghost py-2" :class="tab === t.id && 'border-candle text-candle'" @click="tab = t.id as any">{{ t.l }}</button>
      </div>

      <!-- ЗАЯВКИ -->
      <div v-if="tab === 'bookings'" class="card overflow-x-auto p-0">
        <table class="w-full text-left">
          <thead class="text-ash"><tr><th class="p-3">#</th><th>Когда</th><th>Имя / контакт</th><th>Партия</th><th>Мест</th><th>Пригласил</th><th>🎲</th><th>Статус</th></tr></thead>
          <tbody>
            <tr v-for="b in bookings" :key="b.id" class="border-t border-wood-2 align-top">
              <td class="p-3">{{ b.id }}</td>
              <td>{{ fmt(b.created_at) }}</td>
              <td><b>{{ b.name }}</b><br />{{ b.contact }}<br /><span class="text-ash">{{ b.comment }}</span></td>
              <td>{{ b.game_title || 'без даты' }}<br /><span class="text-ash">{{ fmt(b.starts_at) }}</span></td>
              <td>{{ b.players }}</td>
              <td>{{ b.invited_by || '-' }}</td>
              <td :class="b.bonus && 'font-bold text-candle'">{{ b.roll ?? '-' }}{{ b.bonus ? ' ★' : '' }}</td>
              <td>
                <select :value="b.status" class="input py-1" @change="setBookingStatus(b, ($event.target as HTMLSelectElement).value)">
                  <option value="new">новая</option><option value="confirmed">подтверждена</option><option value="cancelled">отменена</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- РАСПИСАНИЕ -->
      <div v-if="tab === 'sessions'" class="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <form class="card space-y-3" @submit.prevent="saveSession">
          <p class="font-display text-xl">{{ sForm.id ? 'Редактировать партию' : 'Новая партия' }}</p>
          <label class="label">Сюжет</label>
          <select v-model="sForm.game_id" class="input"><option :value="null">- без сюжета -</option><option v-for="g in games" :key="g.id" :value="g.id">{{ g.title }}</option></select>
          <label class="label">Дата и время</label><input v-model="sForm.starts_at" type="datetime-local" class="input" required />
          <div class="grid grid-cols-3 gap-2">
            <div><label class="label">Часов</label><input v-model.number="sForm.duration_h" type="number" step="0.5" class="input" /></div>
            <div><label class="label">Мест</label><input v-model.number="sForm.max_players" type="number" min="1" max="10" class="input" /></div>
            <div><label class="label">Цена ₽</label><input v-model.number="sForm.price" type="number" class="input" /></div>
          </div>
          <label class="flex items-center gap-2"><input v-model="sForm.is_weekly" type="checkbox" /> История недели</label>
          <select v-model="sForm.status" class="input"><option value="open">открыта запись</option><option value="closed">запись закрыта</option><option value="cancelled">отменена</option></select>
          <input v-model="sForm.note" class="input" placeholder="Заметка" />
          <div class="flex gap-2"><button class="btn-primary flex-1">Сохранить</button><button v-if="sForm.id" type="button" class="btn-ghost" @click="Object.assign(sForm, emptySession())">Отмена</button></div>
        </form>
        <div class="card overflow-x-auto p-0">
          <table class="w-full text-left">
            <thead class="text-ash"><tr><th class="p-3">Дата</th><th>Сюжет</th><th>Мест</th><th>Статус</th><th /></tr></thead>
            <tbody>
              <tr v-for="s in sessions" :key="s.id" class="border-t border-wood-2">
                <td class="p-3">{{ fmt(s.starts_at) }} <span v-if="s.is_weekly" class="text-candle">★</span></td>
                <td>{{ s.game_title || '-' }}</td>
                <td>{{ s.taken }}/{{ s.max_players }}</td>
                <td>{{ s.status }}</td>
                <td class="whitespace-nowrap"><button class="text-candle" @click="editSession(s)">ред.</button> · <button class="text-red-400" @click="delSession(s.id)">удл.</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- КОНТЕНТ -->
      <div v-if="tab === 'posts'" class="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <form class="card space-y-3" @submit.prevent="savePost">
          <p class="font-display text-xl">{{ pForm.id ? 'Редактировать' : 'Новая запись' }}</p>
          <div class="grid grid-cols-2 gap-2">
            <select v-model="pForm.type" class="input"><option v-for="t in TYPES" :key="t.id" :value="t.id">{{ t.label }}</option></select>
            <input v-model="pForm.slug" class="input" placeholder="url (авто из заголовка)" />
          </div>
          <input v-model="pForm.title" class="input" placeholder="Заголовок" required />
          <textarea v-model="pForm.excerpt" rows="2" class="input" placeholder="Краткое описание (для карточки)" />
          <textarea v-model="pForm.body" rows="10" class="input" placeholder="Текст. Абзацы - через пустую строку" />
          <div class="flex items-center gap-3">
            <input type="file" accept="image/*" @change="upload" />
            <span v-if="uploading" class="text-ash">загрузка…</span>
          </div>
          <input v-model="pForm.cover" class="input" placeholder="/media/... или /images/..." />
          <img v-if="pForm.cover" :src="pForm.cover" class="max-h-40 rounded" />
          <details><summary class="cursor-pointer text-ash">SEO и параметры</summary>
            <input v-model="pForm.seo_title" class="input mt-2" placeholder="SEO title (до 70 символов)" />
            <textarea v-model="pForm.seo_description" rows="2" class="input mt-2" placeholder="SEO description (до 160 символов)" />
            <label class="label mt-2">meta (JSON): system, players, level, kind, genres, duration, price, adult, series, accent</label>
            <textarea v-model="pForm.metaText" rows="6" class="input font-mono text-xs" />
          </details>
          <label class="flex items-center gap-2"><input v-model="pForm.published" type="checkbox" /> Опубликовано</label>
          <div class="flex gap-2"><button class="btn-primary flex-1">Сохранить</button><button v-if="pForm.id" type="button" class="btn-ghost" @click="Object.assign(pForm, emptyPost())">Отмена</button></div>
          <p v-if="pError" class="text-red-400">{{ pError }}</p>
        </form>
        <div class="card space-y-2">
          <div v-for="p in posts" :key="p.id" class="flex items-center justify-between border-b border-wood-2 py-2">
            <div><span class="text-xs text-ash">{{ TYPES.find(t => t.id === p.type)?.label }}</span> <span :class="!p.published && 'opacity-50'">{{ p.title }}</span></div>
            <div class="whitespace-nowrap"><button class="text-candle" @click="editPost(p)">ред.</button> · <button class="text-red-400" @click="delPost(p.id)">удл.</button></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
