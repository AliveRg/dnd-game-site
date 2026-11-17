<script setup lang="ts">
// Короткая форма на первом экране: имя + контакт → заявка «подобрать партию»
import { normalizePhone } from '#shared/utils/booking'

const requestId = ref('')
const { $ymGoal } = useNuxtApp()
const form = reactive({ name: '', contact: '', consent: false, website: '' })
const state = ref<'idle' | 'sending' | 'ok' | 'error'>('idle')
const error = ref('')
const { errors, check, clear } = useFormCheck<'name' | 'contact' | 'consent'>()
const uid = useId()

const consentRef = ref<{ show: () => void; nudge: () => void }>()
async function submit() {
    alert('Это предпросмотр сайта. Отправка заявок здесь отключена.'); return;
  if (!form.consent) { consentRef.value?.nudge(); return }
  const ok = check({
    name: () => (form.name.trim().length < 2 ? 'Как к вам обращаться?' : null),
    contact: () => (form.contact.trim().length < 3 ? 'Оставьте Телефон, Telegram, VK или e-mail - напишем туда' : null),
    consent: () => (!form.consent ? 'Нужно согласие, иначе мы не сможем ответить' : null)
  }, `${uid}-`)
  if (!ok) return
  state.value = 'sending'
  error.value = ''
  try {
    requestId.value ||= crypto.randomUUID()
    const body = { ...form, requestId:requestId.value, source:'quick', players: 1, tariff: 'promo4', comment: 'Заявка с первого экрана', utm: getUtm() }
    if (/^[+\d\s().-]+$/.test(form.contact.trim())) {
      const contact = normalizePhone(form.contact.trim())
      requestId.value ||= crypto.randomUUID()
      await $fetch('/api/booking', { method: 'POST', body: { ...body, contact, source: 'quick', requestId: requestId.value } })
    } else {
      await $fetch('/api/calendar-booking', { method: 'POST', body })
    }
    state.value = 'ok'
    $ymGoal('hero_form_sent')
  } catch (e: any) {
    state.value = 'error'
    error.value = e?.data?.message || e?.message || 'Не получилось отправить'
  }
}
</script>

<template>
  <div class="card w-full max-w-md">
    <template v-if="state !== 'ok'">
      <h2 class="mb-1 text-3xl">Записаться на партию</h2>
      <p class="mb-4 text-sm text-ash">Напишем и подберём ближайшую игру</p>
      <form class="space-y-3 ym-hide-content" novalidate @submit.prevent="submit">
        <input v-model="form.website" class="hidden" tabindex="-1" autocomplete="off" />
        <div>
          <input v-model="form.name" :data-field="`${uid}-name`" class="input" placeholder="Имя" autocomplete="given-name" @input="clear('name')" />
          <FieldError :msg="errors.name" />
        </div>
        <div>
          <input v-model="form.contact" :data-field="`${uid}-contact`" class="input" placeholder="Телефон, Telegram, VK или e-mail" @input="clear('contact')" />
          <FieldError :msg="errors.contact" />
        </div>
        <div>
          <ConsentCheck ref="consentRef" v-model="form.consent" :field="`${uid}-consent`" @update:model-value="clear('consent')" />
          <FieldError :msg="errors.consent" />
        </div>
        <div class="flex justify-end">
          <button class="btn-primary" :class="!form.consent && 'opacity-60'" :disabled="state === 'sending'">{{ state === 'sending' ? 'Отправляем…' : 'Хочу играть' }}</button>
        </div>
        <FieldError :msg="error" />
      </form>
    </template>
    <p v-else class="py-6 text-center text-lg">Заявка у нас! Скоро напишем 🎲</p>
  </div>
</template>
