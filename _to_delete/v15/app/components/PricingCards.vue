<script setup lang="ts">
import { TARIFFS_BY_PRICE, FRIEND_DISCOUNT, FRIEND_DISCOUNT_CAP } from '#shared/utils/pricing'
// «Выбрать» → подставляет тариф в форму записи внизу страницы и прокручивает к ней
function choose(id: string) {
  window.dispatchEvent(new CustomEvent('tariff-pick', { detail: id }))
  scrollToEl('#booking')
}
</script>

<template>
  <div>
    <div class="grid gap-5 md:grid-cols-3">
      <TariffCard v-for="t in TARIFFS_BY_PRICE" :key="t.id" :t="t as any">
        <button type="button" class="btn-ghost" @click="choose(t.id)">Выбрать</button>
      </TariffCard>
    </div>
    <p class="mt-5 text-ash">
      Приведи друга - <b class="text-candle">-{{ FRIEND_DISCOUNT }} ₽</b> тебе за каждого на 4-часовую партию (скидка до {{ FRIEND_DISCOUNT_CAP * 100 }}%), а друг играет за 1 500 ₽.
    </p>
  </div>
</template>
