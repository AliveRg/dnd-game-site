<script setup lang="ts">
import {TARIFFS_BY_PRICE,TIER_LABEL,estimatePrice} from '#shared/utils/pricing'
import {normalizePhone} from '#shared/utils/booking'
const props=withDefaults(defineProps<{quick?:boolean}>(),{quick:false})
const form=reactive({name:'',contact:'',comment:'',tariff:'promo4',players:1,invitedBy:'',consent:false,website:''})
const uid=useId()
const requestId=ref('')
const pending=ref(false),success=ref(false),error=ref('')
const consentRef=ref<{nudge:()=>void}>()
const {$ymGoal}=useNuxtApp()
const price=computed(()=>estimatePrice(form.tariff,form.players))
function pick(event:Event){const value=(event as CustomEvent).detail;if(TARIFFS_BY_PRICE.some(t=>t.id===value))form.tariff=value}
onMounted(()=>{requestId.value=crypto.randomUUID();if(!props.quick)window.addEventListener('tariff-pick',pick)})
onBeforeUnmount(()=>window.removeEventListener('tariff-pick',pick))
async function submit(){
    alert('Это предпросмотр сайта. Отправка заявок здесь отключена.'); return;
 error.value=''
 if(!form.consent){consentRef.value?.nudge();return}
 try{normalizePhone(form.contact)}catch{error.value='Укажите корректный номер телефона';return}
 if(form.name.trim().length<2){error.value='Укажите ФИО';return}
 pending.value=true
 try{
  let utm={};try{utm=JSON.parse(sessionStorage.getItem('utm')||'{}')}catch{}
  await $fetch('/api/booking',{method:'POST',body:{...form,players:props.quick?1:Number(form.players),tariff:props.quick?'promo4':form.tariff,source:props.quick?'quick':'extended',requestId:requestId.value,utm}})
  success.value=true;requestId.value=crypto.randomUUID();$ymGoal(props.quick?'hero_form_sent':'booking_sent')
 }catch(e:any){error.value=e?.data?.message||'Не удалось сохранить заявку. Попробуйте позже'}finally{pending.value=false}
}
</script>
<template>
 <div class="card" :class="quick&&'w-full max-w-md'">
  <template v-if="!success">
   <h2 v-if="quick" class="mb-2 text-3xl">Оставить заявку</h2>
   <p class="mb-4 text-sm text-ash">Свяжемся с вами и подберём игру. Дата согласуется лично.</p>
   <form class="space-y-4 ym-hide-content" @submit.prevent="submit">
    <input v-model="form.website" aria-hidden="true" aria-label="Оставьте поле пустым" class="hidden" tabindex="-1" autocomplete="off" />
    <div><label :for="`${uid}-name`" class="mb-1 block text-sm">ФИО</label><input :id="`${uid}-name`" v-model="form.name" class="input" autocomplete="name" minlength="2" maxlength="120" required /></div>
    <div><label :for="`${uid}-phone`" class="mb-1 block text-sm">Телефон</label><input :id="`${uid}-phone`" v-model="form.contact" class="input" type="tel" autocomplete="tel" maxlength="30" placeholder="+7 (___) ___-__-__" required /></div>
    <template v-if="!quick">
     <div><label :for="`${uid}-tariff`" class="mb-1 block text-sm">Тариф</label><select :id="`${uid}-tariff`" v-model="form.tariff" class="input"><option v-for="t in TARIFFS_BY_PRICE" :key="t.id" :value="t.id">{{TIER_LABEL[t.tier]}} — {{t.price.toLocaleString('ru-RU')}} ₽ · {{t.title}}{{t.badge?' · Акция':''}}</option></select></div>
     <div><label :for="`${uid}-players`" class="mb-1 block text-sm">Сколько мест (вы + друзья)</label><select :id="`${uid}-players`" v-model.number="form.players" class="input"><option v-for="n in 5" :key="n" :value="n">{{n}}</option></select></div>
     <div><label :for="`${uid}-invited`" class="mb-1 block text-sm">Кто вас пригласил (если есть)</label><input :id="`${uid}-invited`" v-model="form.invitedBy" class="input" maxlength="120" /></div>
     <div class="rounded-lg border border-white/10 p-3 text-sm"><p>Предварительно: <b>{{price.total.toLocaleString('ru-RU')}} ₽</b> за {{form.players}} мест.</p><p v-if="price.discount" class="mt-1 text-ash">Заявитель: {{price.perHost}} ₽ со скидкой {{price.discount}} ₽; друзья: {{price.friends}} × 1 500 ₽.</p><p v-else class="mt-1 text-ash">Цена тарифа × количество участников. Окончательные условия согласуем лично.</p></div>
    </template>
    <div><label :for="`${uid}-comment`" class="mb-1 block text-sm">Сообщение</label><textarea :id="`${uid}-comment`" v-model="form.comment" class="input min-h-24" maxlength="2000" rows="3" /></div>
    <ConsentCheck ref="consentRef" v-model="form.consent" />
    <p v-if="error" role="alert" class="text-sm text-red-300">{{error}}</p>
    <button class="btn-primary" :disabled="pending">{{pending?'Отправляем…':'Оставить заявку'}}</button>
   </form>
  </template>
  <div v-else role="status" class="py-6 text-center"><h3 class="text-3xl">Заявка сохранена</h3><p class="mt-3 text-ash">Свяжемся с вами по указанному телефону.</p><button class="btn-ghost mt-4" @click="success=false">Оставить ещё заявку</button></div>
 </div>
</template>
