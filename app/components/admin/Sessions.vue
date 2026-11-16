<script setup lang="ts">
const api=inject<any>('adminFetch')
const sessions=ref<any[]>([]),posts=ref<any[]>([]),error=ref('')
const games=computed(()=>posts.value.filter(p=>p.type==='game'))
const fmt=(s:string)=>new Date(s).toLocaleString('ru-RU',{timeZone:'Europe/Moscow'})
async function loadAll(){try{[sessions.value,posts.value]=await Promise.all([api('/api/admin/sessions'),api('/api/admin/posts')])}catch(e:any){error.value=e?.data?.message||'Не удалось получить расписание'}}
const emptySession = () => ({ id: null as number | null, game_id: null as number | null, starts_at: '', duration_h: 4, max_players: 5, price: 2000, is_weekly: false, note: '', status: 'open' })
const sForm = reactive(emptySession())
const toLocalInput = (iso: string) => { const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) }
function editSession(s: any) { Object.assign(sForm, { ...s, starts_at: toLocalInput(s.starts_at) }) }
async function saveSession() {
  error.value=''
  try {
  const body = { ...sForm, starts_at: new Date(sForm.starts_at).toISOString() }
  if (sForm.id) await api(`/api/admin/sessions/${sForm.id}`, { method: 'PUT', body })
  else await api('/api/admin/sessions', { method: 'POST', body })
  Object.assign(sForm, emptySession()); await loadAll()
  } catch(e:any){error.value=e?.data?.message||'Не удалось сохранить партию'}
}
async function delSession(id:number){if(!confirm('Удалить партию?'))return;try{await api(`/api/admin/sessions/${id}`,{method:'DELETE'});await loadAll()}catch(e:any){error.value=e?.data?.message||'Не удалось удалить партию'}}


onMounted(loadAll)
</script>
<template><section><h2 class="mb-4 text-3xl">Расписание игр</h2><p v-if="error" role="alert" class="mb-4 text-red-300">{{error}}</p><div  class="grid gap-6 lg:grid-cols-[1fr_2fr]">
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
      </div></section></template>
