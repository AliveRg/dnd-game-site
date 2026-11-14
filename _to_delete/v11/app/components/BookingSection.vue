<template>
  <!-- Запись - внизу каждой страницы. Все кнопки «Записаться» ведут сюда (#booking), без перехода на главную -->
  <section id="booking" class="section relative" data-allow-mismatch="class">
    <div class="container-x relative">
      <img src="/decor/scroll.webp" alt="" class="decor -top-2 right-0 hidden w-36 -rotate-6 lg:block" loading="lazy" />
      <SectionTitle icon="key">Запись на игру</SectionTitle>
      <p class="-mt-3 mb-6 text-ash">До 5 человек на партию. Выберите день в календаре или оставьте заявку без даты.</p>
      <BookingCalendar />
    </div>
  </section>
</template>
