<script setup lang="ts">
definePageMeta({layout:'admin'})
useHead({title:'Драконы — управление клубом',meta:[{name:'robots',content:'noindex, nofollow'},{name:'apple-mobile-web-app-capable',content:'yes'},{name:'apple-mobile-web-app-title',content:'Драконы'}],link:[{rel:'manifest',href:'/dragons/manifest.webmanifest'},{rel:'apple-touch-icon',href:'/dragons/icon-180.png'}]})
const ready=ref(false),authenticated=ref(false),pending=ref(false),online=ref(true)
const login=reactive({login:'',password:''})
const error=ref(''),tab=ref('bookings'),mediaUrl=ref('')
const sections=[{id:'bookings',label:'Заявки'},{id:'posts',label:'Материалы'},{id:'pages',label:'Страницы'},{id:'media',label:'Изображения'},{id:'install',label:'На телефон'}]
const api=async(url:string,options:any={})=>{
 try{return await $fetch<any>(url,{...options,cache:'no-store'})}
 catch(e:any){if(e?.status===401||e?.statusCode===401){authenticated.value=false;login.password=''}throw e}
}
provide('adminFetch',api)
async function enter(){pending.value=true;error.value='';try{await api('/api/admin/login',{method:'POST',body:login});login.password='';authenticated.value=true}catch(e:any){error.value=e?.data?.message||'Не удалось войти'}finally{pending.value=false}}
async function logout(){error.value='';try{await api('/api/admin/logout',{method:'POST'});authenticated.value=false;login.password=''}catch(e:any){error.value=e?.data?.message||'Выход не выполнен. Проверьте соединение'}}
function connection(){online.value=navigator.onLine}
onMounted(async()=>{
 connection();window.addEventListener('online',connection);window.addEventListener('offline',connection)
 if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('/dragons/sw.js',{scope:'/dragons'}).catch(()=>{})
 try{const me=await api('/api/admin/me');if(me.admin){await api('/api/admin/posts');authenticated.value=true}}catch{}finally{ready.value=true}
})
onBeforeUnmount(()=>{window.removeEventListener('online',connection);window.removeEventListener('offline',connection)})
</script>
<template>
 <div class="mx-auto max-w-6xl p-4 pb-12 md:p-8">
  <header class="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 class="text-3xl text-candle">Драконы</h1><div class="flex gap-3"><a href="/" class="btn-ghost">Сайт</a><button v-if="authenticated" class="btn-ghost" @click="logout">Выйти</button></div></header>
  <p v-if="!online" role="status" class="card mb-4 border-red-500 text-red-200">Нет связи. Заявки и изменения доступны только при подключении к интернету.</p>
  <p v-if="!ready" role="status" class="card">Проверяем вход…</p>
  <form v-else-if="!authenticated" class="card mx-auto mt-12 max-w-sm space-y-4" @submit.prevent="enter"><h2 class="text-2xl">Вход администратора</h2><label class="block">Логин<input v-model="login.login" class="input mt-1" autocomplete="username" required maxlength="200"/></label><label class="block">Пароль<input v-model="login.password" class="input mt-1" type="password" autocomplete="current-password" required maxlength="200"/></label><p v-if="error" role="alert" class="text-red-300">{{error}}</p><button class="btn-primary w-full" :disabled="pending||!online">{{pending?'Входим…':'Войти'}}</button></form>
  <template v-else><p v-if="error" role="alert" class="mb-4 text-red-300">{{error}}</p><nav aria-label="Разделы управления" class="mb-6 flex flex-wrap gap-2"><button v-for="s in sections" :key="s.id" class="btn-ghost min-h-11" :class="tab===s.id&&'border-candle text-candle'" :aria-current="tab===s.id?'page':undefined" @click="tab=s.id">{{s.label}}</button></nav><AdminBookings v-if="tab==='bookings'"/><AdminPosts v-else-if="tab==='posts'"/><AdminPages v-else-if="tab==='pages'"/><section v-else-if="tab==='media'" class="card max-w-3xl space-y-4"><h2 class="text-3xl">Изображения</h2><p class="text-ash">Загружайте фотографии здесь или в редакторе материала. Чтобы использовать снимок, выберите его из библиотеки в нужной записи и задайте описание.</p><AdminImagePicker v-model="mediaUrl" label="Загрузка и библиотека"/></section><section v-else class="card space-y-4"><h2 class="text-3xl">Добавить на главный экран</h2><p>iPhone: откройте эту страницу в Safari, нажмите «Поделиться», затем «На экран Домой».</p><p>Android: откройте меню браузера и выберите «Установить приложение» или «Добавить на главный экран».</p><p class="text-ash">Админка открывается отдельным окном. Для работы с заявками и сохранения контента нужен интернет. Уведомления о новых заявках смотрите в разделе «Заявки».</p></section></template>
 </div>
</template>
