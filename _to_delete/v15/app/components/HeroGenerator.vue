<script setup lang="ts">
// Генератор героя: «кость судьбы» d20 решает редкость (20 → Легендарный 5%, 16-19 → Редкий 20%, иначе Обычный 75%),
// барабаны 4d6 (минус меньший) - характеристики, дальше лист персонажа по PHB 2024 (1-й уровень).
// Всё, что выпало на костях, менять нельзя - только перебросить. Имя, внешность и предысторию можно переписать.
import { ABILITIES, SKILLS, RARITY, generateHero, percentileOf, fmt, randomName, randomLook, randomStory, abilityShort, type Hero } from '#shared/hero-rules'

const { $ymGoal } = useNuxtApp()
const KEY = 'hv-hero-v1'
const hero = ref<Hero | null>(null)
const pending = ref<Hero | null>(null) // герой, который «выпадает» прямо сейчас
const rolling = ref(false)
const revealKey = ref(0)
const pct = ref<number | null>(null)
const history = ref<Hero[]>([])
const stats = ref({ rolls: 0, rare: 0, legendary: 0, best: 0 })
const die = ref<{ roll: (n?: number) => Promise<number> }>()
const drum = ref<number[][]>(ABILITIES.map(() => [6, 5, 4, 3]))
const settled = ref<boolean[]>(ABILITIES.map(() => true))

const cur = computed(() => pending.value ?? hero.value) // для блоков характеристик (видны во время броска)
const rar = computed(() => (hero.value ? RARITY[hero.value.rarity] : null))
const d6 = () => 1 + Math.floor(Math.random() * 6)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const minIdx = (d: number[]) => d.indexOf(Math.min(...d))
const dash = '-'

async function roll() {
  if (rolling.value) return
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const d20 = 1 + Math.floor(Math.random() * 20)
  const next = generateHero(d20)
  rolling.value = true
  pending.value = next
  settled.value = ABILITIES.map(() => false)
  const timer = setInterval(() => { drum.value = drum.value.map((d, i) => (settled.value[i] ? d : d.map(d6))) }, 70)
  const dieP = die.value?.roll(d20) ?? Promise.resolve(d20)
  for (let i = 0; i < ABILITIES.length; i++) {
    await sleep(reduce ? 0 : i === 0 ? 650 : 170)
    drum.value[i] = next.rolls[i]!.dice
    settled.value[i] = true
  }
  clearInterval(timer)
  await dieP
  hero.value = next
  pending.value = null
  rolling.value = false
  revealKey.value++
  pct.value = percentileOf(next.total, 12000)
  history.value = [next, ...history.value].slice(0, 8)
  stats.value = { rolls: stats.value.rolls + 1, rare: stats.value.rare + (next.rarity === 'rare' ? 1 : 0), legendary: stats.value.legendary + (next.rarity === 'legendary' ? 1 : 0), best: Math.max(stats.value.best, next.total) }
  $ymGoal?.('hero_generated')
}
function restore(h: Hero) { hero.value = h; pct.value = percentileOf(h.total, 12000); revealKey.value++ }

// сохранение в браузере (вместе с правками имени, внешности и предыстории)
onMounted(() => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) { const s = JSON.parse(raw); if (s.hero?.v === 1) restore(s.hero); history.value = s.history ?? []; stats.value = s.stats ?? stats.value }
  } catch {}
})
let saveT: ReturnType<typeof setTimeout> | undefined
watch([hero, history, stats], () => {
  clearTimeout(saveT)
  saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify({ hero: hero.value, history: history.value, stats: stats.value })) } catch {} }, 300)
}, { deep: true })

const values = computed(() => (hero.value ? ABILITIES.map((a) => hero.value!.scores[a.id]) : [0, 0, 0, 0, 0, 0]))
const roles = computed(() => {
  const h = hero.value
  if (!h) return []
  const n = (s: number) => Math.max(0.04, Math.min(1, (s - 3) / 17))
  return [
    { name: 'Боец', v: n((h.scores.str + h.scores.con) / 2) },
    { name: 'Ловкач', v: n(h.scores.dex) },
    { name: 'Маг', v: n(h.scores.int) },
    { name: 'Мистик', v: n(h.scores.wis) },
    { name: 'Лидер', v: n(h.scores.cha) },
    { name: 'Танк', v: Math.max(0.04, Math.min(1, n(h.scores.con) * 0.5 + ((h.ac - 10) / 10) * 0.5)) }
  ]
})
const heroText = computed(() => {
  const h = hero.value
  if (!h) return ''
  return `Мой герой: ${h.name} (${h.species}, ${h.klass}, ${h.background}), ${RARITY[h.rarity].name.toLowerCase()}. ` +
    ABILITIES.map((a) => `${a.short} ${h.scores[a.id]}`).join(', ') + `; КД ${h.ac}, хиты ${h.hp}.`
})
function bookWithHero() {
  if (!hero.value) return
  try { sessionStorage.setItem('hero', heroText.value) } catch {}
  window.dispatchEvent(new CustomEvent('hero-ready', { detail: heroText.value }))
  scrollToEl('#booking')
}
const printSheet = () => window.print()
const initials = (n: string) => { const w = n.replace(/[«»"]/g, '').split(/\s+/).filter(Boolean); return ((w[0]?.[0] ?? '') + (w.length > 1 ? w[w.length - 1]![0] : '')).toUpperCase() }
const skillsOf = computed(() => hero.value?.skills ?? SKILLS.map((s) => ({ ...s, prof: false, expert: false, val: 0 })))
</script>

<template>
  <div class="hg" :class="hero && `r-${hero.rarity}`">
    <!-- ПУЛЬТ: кость судьбы, бросок, шансы редкости, статистика сессии -->
    <div class="hg-deck">
      <div class="hg-die">
        <Dice3D ref="die" size="150px" :initial="20" label="Бросить кость судьбы" @click="roll" />
        <p class="hg-cap">Кость судьбы<br /><span>решает редкость</span></p>
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <button type="button" class="hg-roll" :disabled="rolling" @click="roll">
            <span class="hg-roll-ico" :class="rolling && 'spin'" aria-hidden="true">🎲</span>{{ rolling ? 'Кости катятся…' : hero ? 'Перебросить героя' : 'Бросить кости' }}
          </button>
          <p class="text-sm text-ash">4d6, меньший кубик отбрасывается, ×6. Выпавшее нельзя править - только перебросить.</p>
        </div>
        <!-- шансы редкости: 75 / 20 / 5 и отметка выпавшего d20 -->
        <div>
          <div class="hg-odds" aria-label="Шансы редкости: обычный 75%, редкий 20%, легендарный 5%">
            <span style="flex: 75; background: #959595">Обычный · 75%</span>
            <span style="flex: 20; background: #ff7a3c">Редкий · 20%</span>
            <span style="flex: 5; background: #DF0000" title="Легендарный · 5% · d20 = 20">5%</span>
            <i v-if="hero" class="hg-mark" :style="{ left: `${((hero.d20 - 0.5) / 20) * 100}%` }"><b>{{ hero.d20 }}</b></i>
          </div>
        </div>
        <div class="hg-stats">
          <div><b>{{ stats.rolls }}</b><span>бросков</span></div>
          <div><b style="color: #ff7a3c">{{ stats.rare }}</b><span>редких</span></div>
          <div><b style="color: #ff4a3a">{{ stats.legendary }}</b><span>легендарных</span></div>
          <div><b>{{ stats.best || dash }}</b><span>лучшая сумма</span></div>
        </div>
      </div>
      <div class="hg-hist">
        <p class="hg-h">Последние герои</p>
        <p v-if="!history.length" class="text-xs text-ash">Здесь появятся ваши броски</p>
        <button v-for="h in history" :key="h.seed" type="button" class="hg-hist-i" :class="hero?.seed === h.seed && 'on'" :title="`Вернуть: ${h.name}`" @click="restore(h)">
          <i :style="{ background: RARITY[h.rarity].color }" /><span class="truncate">{{ h.name }}</span><em>{{ h.klass }} · {{ h.total }}</em>
        </button>
      </div>
    </div>

    <!-- ПЕЧАТЬ РЕДКОСТИ -->
    <div class="hg-stamp-row">
      <Transition name="hg-stamp" mode="out-in">
        <div v-if="hero && !rolling" :key="hero.seed" class="hg-stamp" :style="{ '--rc': rar!.color }">
          <span class="hg-stamp-gem" />
          <b>{{ rar!.name }} герой</b>
          <small>d20 = {{ hero.d20 }} · сумма {{ hero.total }} · point-buy {{ hero.pointBuy }}</small>
          <span v-if="hero.rarity !== 'common'" class="hg-flare" />
        </div>
        <div v-else-if="!hero" class="hg-stamp ghost">Бросьте кости, чтобы создать героя</div>
      </Transition>
    </div>

    <!-- ГРАФИКИ -->
    <div class="hg-charts" :class="!hero && 'opacity-50'">
      <div class="hg-chart">
        <p class="hg-h">Профиль характеристик</p>
        <HeroRadar :values="values" :color="rar?.color === '#959595' ? '#EEE5CE' : rar?.color" />
      </div>
      <div class="hg-chart">
        <p class="hg-h">Сила броска</p>
        <div class="hg-gauge" :style="{ '--p': (pct ?? 0) / 100 }">
          <svg viewBox="0 0 120 70"><path d="M10 64a50 50 0 0 1 100 0" class="g-bg" /><path d="M10 64a50 50 0 0 1 100 0" class="g-fg" pathLength="100" /></svg>
          <b>{{ pct ?? dash }}<small v-if="pct !== null">%</small></b>
        </div>
        <p class="text-center text-xs text-ash">{{ pct !== null ? `Сильнее, чем ${pct}% случайных героев` : 'Процент героев слабее вашего' }}</p>
        <div class="mt-3 grid grid-cols-2 gap-2 text-center">
          <div class="hg-mini"><b>{{ hero?.total ?? dash }}</b><span>сумма 6 бросков</span></div>
          <div class="hg-mini"><b>{{ hero?.pointBuy ?? dash }}</b><span>point-buy (норма 27)</span></div>
        </div>
      </div>
      <div class="hg-chart">
        <p class="hg-h">Кем играть удобнее</p>
        <div class="space-y-2">
          <div v-for="r in roles" :key="r.name" class="hg-bar" :class="hero?.role === r.name && 'main'">
            <span>{{ r.name }}</span><i><em :style="{ width: `${Math.round(r.v * 100)}%` }" /></i>
          </div>
          <p v-if="!roles.length" class="text-xs text-ash">Появится после броска</p>
        </div>
        <p v-if="hero" class="mt-3 text-xs text-ash">Роль класса: <b class="text-parchment">{{ hero.role }}</b></p>
      </div>
    </div>

    <!-- ЛИСТ ПЕРСОНАЖА: страница 1 -->
    <article :key="revealKey" class="hs hs-print" :class="[rolling && 'hs-dim', hero && `hs-${hero.rarity}`]">
      <header class="hs-head hs-in">
        <div class="hs-portrait" :style="{ '--rc': rar?.color ?? '#959595' }">
          <span>{{ hero ? initials(hero.name) : '?' }}</span>
          <em>{{ hero?.klass ?? 'класс' }}</em>
        </div>
        <div class="min-w-0 flex-1">
          <label class="hs-lbl" for="hs-name">Имя персонажа</label>
          <div class="flex items-center gap-2">
            <input v-if="hero" id="hs-name" v-model="hero.name" class="hs-name" maxlength="40" />
            <span v-else class="hs-name opacity-40">Безымянный</span>
            <button v-if="hero" type="button" class="hs-reroll" title="Другое имя" @click="hero.name = randomName(hero.species)">🎲</button>
          </div>
          <div class="hs-fields">
            <div><b>{{ hero?.klass ?? dash }}</b><span>Класс</span></div>
            <div><b>{{ hero?.background ?? dash }}</b><span>Предыстория</span></div>
            <div><b>{{ hero?.species ?? dash }}</b><span>Вид</span></div>
            <div><b>{{ hero?.alignment ?? dash }}</b><span>Мировоззрение</span></div>
          </div>
        </div>
        <div class="hs-lvl">
          <div class="hs-house"><small>уровень</small>{{ hero ? 1 : dash }}</div>
          <div class="hs-xp"><b>{{ hero?.xp ?? '0 / 300' }}</b><span>Опыт</span></div>
          <div class="hs-insp" :class="hero?.inspiration && 'on'" :title="hero?.inspiration ? 'Есть Героическое вдохновение' : 'Нет вдохновения'">★<span>Вдохновение</span></div>
        </div>
      </header>

      <!-- Жизненно важное -->
      <div class="hs-vitals hs-in">
        <div class="hs-v"><b>{{ hero ? fmt(hero.prof) : dash }}</b><span>Бонус мастерства</span></div>
        <div class="hs-v"><b>{{ hero?.passive ?? dash }}</b><span>Пассивная внимательность</span></div>
        <div class="hs-v hs-speed">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h5v9l7 3c1.6.7 2 2 2 3.5V20H4V12c0-1 .5-2 1.5-2.5L7 9Z" fill="currentColor" /><path d="M4 18h17" stroke="#F7F2E6" stroke-width="1.5" /></svg>
          <b>{{ hero ? `${hero.speed} фт` : dash }}</b><span>Скорость</span><em v-if="hero">{{ hero.altSpeed !== '-' ? hero.altSpeed : 'лазание/плавание ½' }}</em>
        </div>
        <div class="hs-v hs-shield"><b>{{ hero?.ac ?? dash }}</b><span>КД</span><em v-if="hero">{{ hero.acNote }}</em></div>
        <div class="hs-v"><svg viewBox="0 0 24 24" class="hs-ico" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7Z" fill="currentColor" /></svg><b>{{ hero ? fmt(hero.init) : dash }}</b><span>Инициатива</span></div>
        <div class="hs-v hs-hp">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" fill="currentColor" /></svg>
          <b>{{ hero ? `${hero.hp} / ${hero.hp}` : dash }}</b><span>Хиты: текущие / макс.</span>
        </div>
        <div class="hs-v"><b>0</b><span>Временные хиты</span></div>
        <div class="hs-v"><b>{{ hero?.hd ?? dash }}</b><span>Кости хитов</span></div>
        <div class="hs-v hs-death"><div class="flex gap-1"><i v-for="n in 3" :key="'s' + n" class="ok" /><i class="sep" /><i v-for="n in 3" :key="'f' + n" class="bad" /></div><span>Спасброски от смерти</span></div>
      </div>

      <div class="hs-body">
        <!-- Характеристики (с барабанами 4d6) -->
        <div class="hs-abs hs-in">
          <div v-for="(a, i) in ABILITIES" :key="a.id" class="hs-ab" :class="!settled[i] && 'rolling'">
            <span class="hs-ab-n">{{ a.name }}</span>
            <b class="hs-ab-mod">{{ settled[i] && cur ? fmt(cur.mods[a.id]) : '?' }}</b>
            <span class="hs-ab-score">{{ settled[i] && cur ? cur.scores[a.id] : dash }}</span>
            <span class="hs-dice">
              <i v-for="(d, k) in drum[i]" :key="k" :class="settled[i] && cur && k === minIdx(cur.rolls[i]!.dice) && 'drop'">{{ d }}</i>
            </span>
            <em v-if="settled[i] && cur?.rolls[i]?.bonus">+{{ cur.rolls[i]!.bonus }} предыстория</em>
          </div>
        </div>

        <!-- Спасброски и навыки -->
        <div class="hs-col hs-in">
          <section class="hs-box">
            <h4>Спасброски</h4>
            <ul class="hs-list">
              <li v-for="s in hero?.saves ?? ABILITIES.map((a) => ({ ab: a.id, prof: false, val: 0 }))" :key="s.ab">
                <i :class="s.prof && 'on'" /><b>{{ hero ? fmt(s.val) : dash }}</b><span>{{ ABILITIES.find((a) => a.id === s.ab)!.name }}</span>
              </li>
            </ul>
          </section>
          <section class="hs-box">
            <h4>Навыки</h4>
            <ul class="hs-list">
              <li v-for="s in skillsOf" :key="s.id"><i :class="[s.prof && 'on', s.expert && 'ex']" /><b>{{ hero ? fmt(s.val) : dash }}</b><span>{{ s.name }} <small>{{ abilityShort(s.ab) }}</small></span></li>
            </ul>
            <p class="hs-legend"><i class="on" /> владение <i class="on ex" /> компетентность</p>
          </section>
        </div>

        <!-- Атаки, действия, умения -->
        <div class="hs-col hs-in">
          <section class="hs-box">
            <h4>Атаки и заклинания</h4>
            <table class="hs-table">
              <thead><tr><th>Название</th><th>Бонус</th><th>Урон / тип</th></tr></thead>
              <tbody>
                <tr v-for="a in hero?.attacks ?? []" :key="a.name"><td>{{ a.name }}<small v-if="a.note">{{ a.note }}</small></td><td><b>{{ a.bonus }}</b></td><td>{{ a.dmg }}</td></tr>
                <tr v-if="!hero"><td colspan="3" class="opacity-40">-</td></tr>
              </tbody>
            </table>
          </section>
          <section class="hs-box">
            <h4>Действия в бою</h4>
            <div class="hs-acts">
              <div><p>Действие</p><span v-for="x in hero?.actions.action ?? []" :key="x">{{ x }}</span></div>
              <div><p>Бонусное действие</p><span v-for="x in hero?.actions.bonus ?? []" :key="x">{{ x }}</span><span v-if="hero && !hero.actions.bonus.length" class="opacity-50">пока нет</span></div>
              <div><p>Реакция</p><span v-for="x in hero?.actions.reaction ?? []" :key="x">{{ x }}</span></div>
            </div>
          </section>
          <section class="hs-box">
            <h4>Умения и черты</h4>
            <ul class="hs-feat"><li v-for="f in hero?.features ?? []" :key="f">{{ f }}</li></ul>
          </section>
          <div class="grid gap-3 sm:grid-cols-2">
            <section class="hs-box">
              <h4>Состояния и эффекты</h4>
              <ul class="hs-feat"><li v-for="f in hero?.effects ?? []" :key="f">{{ f }}</li><li v-if="hero && !hero.effects.length" class="opacity-50">Нет</li></ul>
            </section>
            <section class="hs-box hs-boons">
              <h4>Благословения</h4>
              <ul class="hs-feat"><li v-for="f in hero?.boons ?? []" :key="f">{{ f }}</li><li v-if="hero && !hero.boons.length" class="opacity-50">Нет: благословения бывают у редких и легендарных героев</li></ul>
            </section>
          </div>
        </div>
      </div>

      <div class="hs-foot hs-in">
        <section class="hs-box">
          <h4>Владения и языки</h4>
          <p class="hs-p">{{ hero?.proficiencies ?? dash }}</p>
          <p class="hs-p mt-1"><b>Языки:</b> {{ hero?.languages.join(', ') ?? dash }}</p>
        </section>
        <section class="hs-box">
          <h4>Снаряжение</h4>
          <ul class="hs-feat"><li v-for="e in hero?.equipment ?? []" :key="e">{{ e }}</li></ul>
          <div class="hs-coins">
            <span v-for="c in (['mm', 'sm', 'zm', 'pm'] as const)" :key="c" :class="`c-${c}`"><b>{{ hero?.coins[c] ?? 0 }}</b>{{ { mm: 'ММ', sm: 'СМ', zm: 'ЗМ', pm: 'ПМ' }[c] }}</span>
          </div>
        </section>
        <section class="hs-box">
          <h4>Внешность <button v-if="hero" type="button" class="hs-reroll sm" title="Другая внешность" @click="hero.look = randomLook(hero.species)">🎲</button></h4>
          <textarea v-if="hero" v-model="hero.look" class="hs-text" rows="3" maxlength="400" />
          <p v-else class="hs-p opacity-40">-</p>
        </section>
        <section class="hs-box md:col-span-3">
          <h4>Предыстория <button v-if="hero" type="button" class="hs-reroll sm" title="Другая предыстория" @click="hero.story = randomStory(hero)">🎲</button></h4>
          <textarea v-if="hero" v-model="hero.story" class="hs-text" rows="3" maxlength="1200" />
          <p v-else class="hs-p opacity-40">-</p>
        </section>
      </div>
      <p class="hs-note">🔒 Цифры с костей заблокированы. Имя, внешность и предысторию можно переписать.</p>
    </article>

    <!-- СТРАНИЦА 2: заклинания -->
    <article :key="'s' + revealKey" class="hs hs-print hs-page2" :class="rolling && 'hs-dim'">
      <h3 class="hs-title">Заклинания и приёмы</h3>
      <template v-if="hero?.spell">
        <div class="hs-vitals">
          <div class="hs-v"><b>{{ hero.spell.label }}</b><span>Класс заклинателя</span></div>
          <div class="hs-v"><b>{{ abilityShort(hero.spell.ab) }}</b><span>Базовая характеристика</span></div>
          <div class="hs-v"><b>{{ hero.spell.dc }}</b><span>Сл спасброска</span></div>
          <div class="hs-v"><b>{{ fmt(hero.spell.atk) }}</b><span>Бонус атаки</span></div>
          <div class="hs-v"><div class="flex gap-1.5"><i v-for="n in hero.spell.slots" :key="n" class="hs-slot" /></div><span>Ячейки 1 круга</span></div>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <section class="hs-box"><h4>Заговоры</h4><ul class="hs-feat"><li v-for="s in hero.spell.cantrips" :key="s">{{ s }}</li><li v-if="!hero.spell.cantrips.length" class="opacity-50">Нет заговоров на 1-м уровне</li></ul></section>
          <section class="hs-box"><h4>Заклинания 1 круга</h4><ul class="hs-feat"><li v-for="s in hero.spell.spells" :key="s">{{ s }}</li></ul></section>
        </div>
      </template>
      <p v-else-if="hero" class="hs-p">{{ hero.klass }} не колдует на 1-м уровне: его сила в приёмах из раздела «Действия в бою» и «Умения и черты».</p>
      <p v-else class="hs-p opacity-40">Здесь появятся заклинания, если герою выпадет класс-заклинатель.</p>
    </article>

    <div class="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#DF000044] pt-5">
      <button type="button" class="btn-ghost" :disabled="!hero" @click="printSheet">Распечатать лист</button>
      <button type="button" class="btn-primary" :disabled="!hero" @click="bookWithHero">Записаться этим героем</button>
    </div>
  </div>
</template>

<style>
.hg { --rc: #959595; position: relative; padding: 22px; border-radius: 22px; background: radial-gradient(120% 60% at 50% 0%, #2a050588, #0000 60%), linear-gradient(180deg, #120303, #0a0202);
  border: 1px solid #DF000066; box-shadow: 0 0 0 1px #000, 0 0 40px #DF000026, inset 0 0 60px #DF00000f; }
.hg.r-rare { --rc: #ff7a3c; } .hg.r-legendary { --rc: #DF0000; }
@media (max-width: 640px) { .hg { padding: 14px; } }
/* Пульт */
.hg-deck { display: grid; gap: 20px; align-items: center; padding: 4px 0 18px; border-bottom: 1px solid #DF000044; }
@media (min-width: 1024px) { .hg-deck { grid-template-columns: auto 1fr 260px; } }
.hg-die { display: flex; align-items: center; gap: 14px; }
.hg-cap { font-family: var(--font-display); font-size: 20px; line-height: 1; color: #F7F2E6; } .hg-cap span { font-family: var(--font-sans); font-size: 12px; color: #959595; }
.hg-roll { display: inline-flex; align-items: center; gap: 10px; padding: 14px 26px; border-radius: 14px; font-size: 18px; font-weight: 800; color: #fff;
  background: linear-gradient(180deg, #ff3a2a, #DF0000 55%, #a30000); box-shadow: inset 0 1px 0 #fff6, 0 4px 0 #6a0000, 0 0 24px #DF000066; transition: transform .15s, box-shadow .2s, filter .2s; }
.hg-roll:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.08); box-shadow: inset 0 1px 0 #fff6, 0 6px 0 #6a0000, 0 0 34px #DF000099; }
.hg-roll:active:not(:disabled) { transform: translateY(2px); box-shadow: inset 0 1px 0 #fff6, 0 1px 0 #6a0000; }
.hg-roll:disabled { filter: saturate(.6); cursor: progress; }
.hg-roll-ico { display: inline-block; font-size: 22px; } .hg-roll-ico.spin { animation: hg-spin .5s linear infinite; }
@keyframes hg-spin { to { transform: rotate(360deg); } }
.hg-odds { position: relative; display: flex; height: 28px; margin-bottom: 12px; border-radius: 10px; overflow: visible; font-size: 11px; font-weight: 800; color: #040404; }
.hg-odds > span { display: grid; place-items: center; white-space: nowrap; overflow: hidden; box-shadow: inset 0 -3px 0 #0003; }
.hg-odds > span:first-child { border-radius: 10px 0 0 10px; } .hg-odds > span:nth-child(3) { border-radius: 0 10px 10px 0; color: #fff; }
.hg-mark { position: absolute; top: -9px; bottom: -9px; width: 3px; translate: -50% 0; background: #F7F2E6; border-radius: 2px; transition: left .6s cubic-bezier(.3, 1.4, .5, 1); box-shadow: 0 0 8px #fff; }
.hg-mark b { position: absolute; top: auto; bottom: -22px; left: 50%; translate: -50% 0; font: 800 12px var(--font-sans); color: #F7F2E6; }
.hg-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.hg-stats div, .hg-mini { display: flex; flex-direction: column; align-items: center; padding: 8px 4px; border-radius: 12px; background: #ffffff04; border: 1px solid #DF000044; }
.hg-stats b, .hg-mini b { font: 700 24px/1 var(--font-display); color: #F7F2E6; } .hg-stats span, .hg-mini span { font-size: 10px; color: #959595; text-transform: uppercase; letter-spacing: .08em; text-align: center; }
.hg-h { margin-bottom: 8px; font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: #ff5a4a; text-shadow: 0 0 10px #DF000088; }
.hg-hist { display: flex; flex-direction: column; gap: 4px; max-height: 210px; overflow: auto; scrollbar-width: thin; }
.hg-hist-i { display: grid; grid-template-columns: 10px 1fr auto; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 8px; text-align: left; font-size: 13px; color: #F7F2E6; transition: background .2s; }
.hg-hist-i:hover, .hg-hist-i.on { background: #ffffff10; } .hg-hist-i i { width: 10px; height: 10px; border-radius: 3px; rotate: 45deg; } .hg-hist-i em { font-style: normal; font-size: 11px; color: #959595; }
/* Печать редкости */
.hg-stamp-row { display: grid; place-items: center; min-height: 92px; margin: 18px 0 6px; }
.hg-stamp { position: relative; display: flex; flex-direction: column; align-items: center; padding: 10px 34px 12px; border-radius: 14px; color: #fff;
  background: var(--rc); box-shadow: inset 0 -5px 0 #0003, 0 0 0 3px #040404, 0 0 0 5px var(--rc), 0 0 40px color-mix(in srgb, var(--rc) 60%, transparent); }
.hg-stamp b { font: 700 30px/1 var(--font-display); letter-spacing: .04em; text-shadow: 0 2px 0 #0004; }
.hg-stamp small { margin-top: 3px; font-size: 11px; font-weight: 700; opacity: .9; }
.hg-stamp.ghost { background: #0005; color: #959595; box-shadow: 0 0 0 1px #3a0b0b; font-size: 15px; padding: 16px 26px; }
.hg-stamp-gem { position: absolute; top: -12px; width: 30px; height: 18px; background: #F7F2E6; clip-path: polygon(22% 0, 78% 0, 100% 50%, 78% 100%, 22% 100%, 0 50%); }
.hg-flare { position: absolute; inset: -30px -60px; z-index: -1; pointer-events: none; border-radius: 50%;
  background: repeating-conic-gradient(from 0deg, color-mix(in srgb, var(--rc) 45%, transparent) 0 6deg, #0000 6deg 18deg); animation: tarot-rays 18s linear infinite;
  -webkit-mask: radial-gradient(closest-side, #000 30%, #0000); mask: radial-gradient(closest-side, #000 30%, #0000); }
.hg-stamp-enter-active { animation: hg-stamp-in .55s cubic-bezier(.2, 1.6, .4, 1); } .hg-stamp-leave-active { transition: opacity .15s; } .hg-stamp-leave-to { opacity: 0; }
@keyframes hg-stamp-in { from { transform: scale(2.2) rotate(-6deg); opacity: 0; } }
/* Графики */
.hg-charts { display: grid; gap: 16px; margin-bottom: 20px; transition: opacity .3s; }
@media (min-width: 900px) { .hg-charts { grid-template-columns: 1.1fr 1fr 1fr; } }
.hg-chart { padding: 16px 18px; border-radius: 16px; background: #ffffff04; border: 1px solid #DF000044; box-shadow: inset 0 0 22px #DF000010; }
.hg-chart .hero-radar { max-width: 250px; margin: 0 auto; display: block; }
.hg-gauge { position: relative; width: 190px; margin: 6px auto 4px; }
.hg-gauge svg { width: 100%; display: block; } .hg-gauge path { fill: none; stroke-width: 12; stroke-linecap: round; }
.g-bg { stroke: #ffffff14; } .g-fg { stroke: var(--rc); stroke-dasharray: 100; stroke-dashoffset: calc(100 - var(--p) * 100); transition: stroke-dashoffset .9s cubic-bezier(.2, .8, .2, 1); filter: drop-shadow(0 0 6px var(--rc)); }
.hg-gauge b { position: absolute; left: 0; right: 0; bottom: 4px; text-align: center; font: 700 38px/1 var(--font-display); color: #F7F2E6; } .hg-gauge small { font-size: 18px; }
.hg-bar { display: grid; grid-template-columns: 70px 1fr; align-items: center; gap: 10px; font-size: 13px; color: #c9c2b4; }
.hg-bar i { height: 10px; border-radius: 99px; background: #ffffff10; overflow: hidden; } .hg-bar em { display: block; height: 100%; border-radius: inherit; background: #959595; transition: width .8s cubic-bezier(.2, .8, .2, 1); }
.hg-bar.main { color: #fff; font-weight: 700; } .hg-bar.main em { background: var(--rc); box-shadow: 0 0 10px var(--rc); }

/* --- Лист персонажа: тёмный неон, без белого фона. Всё внутри одного большого блока .hg --- */
.hs { position: relative; margin-top: 8px; padding: 22px 0 0; color: #F7F2E6; border-top: 1px solid #DF000044; transition: opacity var(--t) var(--ease), filter var(--t) var(--ease); }
.hs + .hs { margin-top: 26px; }
.hs-dim { opacity: .45; filter: saturate(.5); }
.hs-in { animation: hs-in var(--t-slow) var(--ease) both; }
.hs-in:nth-child(2) { animation-delay: .06s; } .hs-in:nth-child(3) { animation-delay: .12s; } .hs-in:nth-child(4) { animation-delay: .18s; }
.hs-body > .hs-in:nth-child(2) { animation-delay: .15s; } .hs-body > .hs-in:nth-child(3) { animation-delay: .22s; }
@keyframes hs-in { from { opacity: 0; transform: translateY(12px); } }
.hs-head { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; padding-bottom: 16px; border-bottom: 1px solid #DF000033; }
.hs-portrait { position: relative; flex: none; width: 96px; height: 96px; border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle, #2a0606, #0b0202); color: #F7F2E6;
  box-shadow: 0 0 0 2px var(--rc), 0 0 22px color-mix(in srgb, var(--rc) 70%, transparent), inset 0 0 18px color-mix(in srgb, var(--rc) 40%, transparent); }
.hs-portrait span { font: 700 36px/1 var(--font-display); text-shadow: 0 0 12px var(--rc); }
.hs-portrait em { position: absolute; bottom: -10px; padding: 2px 10px; border-radius: 99px; font: 800 10px var(--font-sans); font-style: normal; text-transform: uppercase; letter-spacing: .08em; background: #DF0000; color: #fff; box-shadow: 0 0 12px #DF0000aa; }
.hs-lbl { font-size: 10px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: #ff5a4a; }
.hs-name { width: 100%; min-width: 0; font: 700 clamp(24px, 6vw, 34px)/1.1 var(--font-display); color: #F7F2E6; background: transparent; border-bottom: 1px dashed #DF000066; outline: none; padding: 2px 0; text-shadow: 0 0 14px #DF000055; }
.hs-name:focus { border-bottom-color: #DF0000; }
.hs-reroll { flex: none; width: 34px; height: 34px; border-radius: 10px; background: #1a0505; border: 1px solid #DF000088; font-size: 16px; transition: transform var(--t) var(--ease), box-shadow var(--t) var(--ease); }
.hs-reroll:hover { transform: rotate(-12deg); box-shadow: 0 0 14px #DF0000aa; } .hs-reroll.sm { width: 24px; height: 24px; font-size: 12px; border-radius: 7px; margin-left: 6px; vertical-align: middle; }
.hs-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 18px; margin-top: 10px; }
@media (min-width: 768px) { .hs-fields { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.hs-fields div { display: flex; flex-direction: column; border-bottom: 1px solid #DF000044; padding-bottom: 3px; }
.hs-fields b { font-size: 15px; font-weight: 700; }
.hs-fields span, .hs-v > span, .hs-xp span { font-size: 9px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #959595; }
.hs-lvl { display: flex; align-items: center; gap: 12px; }
.hs-house { width: 60px; height: 64px; padding-top: 16px; display: flex; flex-direction: column; align-items: center; font: 700 30px/1 var(--font-display); color: #fff; background: #DF0000;
  clip-path: polygon(50% 0, 100% 28%, 100% 100%, 0 100%, 0 28%); filter: drop-shadow(0 0 10px #DF0000); }
.hs-house small { font: 800 8px var(--font-sans); letter-spacing: .1em; text-transform: uppercase; opacity: .85; margin-bottom: 2px; }
.hs-xp { display: flex; flex-direction: column; min-width: 110px; padding: 8px 12px; border: 1px solid #DF000066; border-radius: 12px; box-shadow: inset 0 0 14px #DF000018; }
.hs-xp b { font: 700 22px/1 var(--font-display); }
.hs-insp { display: flex; flex-direction: column; align-items: center; font-size: 30px; line-height: 1; color: #ffffff22; }
.hs-insp.on { color: #ff4a3a; text-shadow: 0 0 14px #DF0000; } .hs-insp span { font-size: 8px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #959595; }
.hs-vitals { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 16px 0; }
@media (min-width: 640px) { .hs-vitals { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1100px) { .hs-vitals { grid-template-columns: repeat(9, 1fr); } }
.hs-v { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; min-height: 84px; padding: 10px 6px; text-align: center;
  border: 1px solid #DF000044; border-radius: 12px; background: #ffffff05; box-shadow: inset 0 0 18px #DF000012; transition: border-color var(--t) var(--ease), box-shadow var(--t) var(--ease); }
.hs-v:hover { border-color: #DF0000aa; box-shadow: inset 0 0 18px #DF000022, 0 0 14px #DF000044; }
.hs-v b { font: 700 26px/1 var(--font-display); } .hs-v em { font-size: 9px; font-style: normal; color: #959595; line-height: 1.2; }
.hs-v svg, .hs-ico { width: 22px; height: 22px; color: #ff4a3a; filter: drop-shadow(0 0 6px #DF0000); }
.hs-shield { border: 0; background: linear-gradient(180deg, #3a0606, #1a0303); clip-path: polygon(0 0, 100% 0, 100% 62%, 50% 100%, 0 62%); padding-bottom: 22px; box-shadow: inset 0 0 0 1px #DF0000; }
.hs-hp { border-color: #DF0000aa; box-shadow: inset 0 0 22px #DF000030, 0 0 12px #DF000033; } .hs-hp b { font-size: 24px; }
.hs-death i { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid #959595; } .hs-death i.bad { border-color: #DF0000; } .hs-death i.sep { width: 1px; border-radius: 0; border: 0; background: #ffffff33; }
.hs-body { display: grid; gap: 14px; }
@media (min-width: 1024px) { .hs-body { grid-template-columns: 150px 270px 1fr; } }
.hs-abs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; align-content: start; }
@media (min-width: 1024px) { .hs-abs { grid-template-columns: 1fr; } }
.hs-ab { position: relative; display: flex; flex-direction: column; align-items: center; padding: 8px 6px 10px; border: 1px solid #DF000055; border-radius: 14px 14px 30px 30px; background: #ffffff05; box-shadow: inset 0 0 16px #DF000014; }
.hs-ab-n { font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #c9c2b4; }
.hs-ab-mod { font: 700 34px/1 var(--font-display); margin-top: 2px; text-shadow: 0 0 12px #DF000077; }
.hs-ab-score { margin-top: 2px; min-width: 44px; padding: 1px 8px; border-radius: 99px; border: 1px solid #DF000088; background: #1a0303; text-align: center; font-weight: 800; font-size: 15px; }
.hs-dice { display: flex; gap: 3px; margin-top: 6px; }
.hs-dice i { width: 20px; height: 20px; display: grid; place-items: center; border-radius: 5px; font: 800 12px/1 var(--font-sans); font-style: normal; color: #fff; background: #2a0505; border: 1px solid #DF000088; }
.hs-dice i.drop { background: transparent; border-color: #ffffff22; color: #ffffff55; text-decoration: line-through; }
.hs-ab.rolling .hs-dice i { background: #DF0000; box-shadow: 0 0 10px #DF0000; animation: hs-tumble .22s linear infinite; }
.hs-ab.rolling .hs-dice i:nth-child(2) { animation-delay: -.05s; } .hs-ab.rolling .hs-dice i:nth-child(3) { animation-delay: -.1s; } .hs-ab.rolling .hs-dice i:nth-child(4) { animation-delay: -.15s; }
.hs-ab.rolling .hs-ab-mod { color: #ff4a3a; animation: hs-shake .12s infinite; }
@keyframes hs-tumble { 0% { transform: rotate(0) translateY(0); } 50% { transform: rotate(180deg) translateY(-3px); } 100% { transform: rotate(360deg) translateY(0); } }
@keyframes hs-shake { 50% { transform: translateX(2px); } }
.hs-ab em { font-size: 9px; font-style: normal; color: #ff5a4a; font-weight: 700; margin-top: 3px; }
.hs-col { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.hs-box { position: relative; padding: 12px 14px; border: 1px solid #DF000044; border-radius: 12px; background: #ffffff04; }
.hs-box h4 { margin: -12px -14px 10px; padding: 8px 14px; font: 800 11px var(--font-sans); letter-spacing: .14em; text-transform: uppercase; color: #ff5a4a;
  border-bottom: 1px solid #DF000033; background: linear-gradient(90deg, #DF00001f, #0000); border-radius: 11px 11px 0 0; text-shadow: 0 0 10px #DF000088; }
.hs-boons { border-color: var(--rc); box-shadow: 0 0 16px color-mix(in srgb, var(--rc) 30%, transparent); }
.hs-list li { display: grid; grid-template-columns: 12px 30px 1fr; align-items: center; gap: 6px; padding: 3px 0; font-size: 13px; border-bottom: 1px dotted #ffffff14; }
.hs-list li i, .hs-legend i { width: 10px; height: 10px; border-radius: 50%; border: 1px solid #959595; display: inline-block; }
.hs-list li i.on, .hs-legend i.on { background: #DF0000; border-color: #DF0000; box-shadow: 0 0 8px #DF0000; } .hs-list li i.ex, .hs-legend i.ex { background: #F7F2E6; border-color: #F7F2E6; box-shadow: 0 0 8px #fff; }
.hs-list li b { font-weight: 800; text-align: right; } .hs-list small { color: #959595; font-size: 9px; font-weight: 700; margin-left: 2px; }
.hs-legend { margin-top: 6px; font-size: 10px; color: #959595; display: flex; align-items: center; gap: 6px; }
.hs-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.hs-table th { text-align: left; font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #959595; padding-bottom: 4px; }
.hs-table td { padding: 6px 4px; border-top: 1px solid #ffffff12; vertical-align: top; } .hs-table td small { display: block; font-size: 10px; color: #959595; }
.hs-table td b { color: #ff5a4a; }
.hs-acts { display: grid; gap: 10px; } @media (min-width: 640px) { .hs-acts { grid-template-columns: 1.4fr 1fr 1fr; } }
.hs-acts p { font-size: 9px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #959595; margin-bottom: 4px; }
.hs-acts span { display: inline-block; margin: 0 4px 4px 0; padding: 3px 9px; border-radius: 99px; font-size: 12px; font-weight: 600; border: 1px solid #F7F2E644; color: #F7F2E6; }
.hs-acts div:nth-child(2) span { border-color: #DF0000; color: #fff; background: #DF000026; box-shadow: 0 0 10px #DF000044; } .hs-acts div:nth-child(3) span { border-color: #959595; color: #c9c2b4; }
.hs-feat li { position: relative; padding: 3px 0 3px 14px; font-size: 13px; line-height: 1.35; color: #e8e2d6; } .hs-feat li::before { content: '◆'; position: absolute; left: 0; top: 4px; font-size: 8px; color: #DF0000; text-shadow: 0 0 6px #DF0000; }
.hs-foot { display: grid; gap: 14px; margin-top: 14px; } @media (min-width: 768px) { .hs-foot { grid-template-columns: repeat(3, 1fr); } }
.hs-p { font-size: 13px; line-height: 1.45; color: #e8e2d6; }
.hs-coins { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.hs-coins span { display: flex; align-items: center; gap: 5px; padding: 3px 9px 3px 4px; border-radius: 99px; font-size: 11px; font-weight: 800; border: 1px solid #ffffff22; }
.hs-coins b { display: grid; place-items: center; min-width: 26px; height: 26px; border-radius: 50%; font-size: 12px; color: #040404; }
.c-mm b { background: #c87533; box-shadow: 0 0 8px #c87533; } .c-sm b { background: #d8d8d8; box-shadow: 0 0 8px #d8d8d8; } .c-zm b { background: #f0b640; box-shadow: 0 0 8px #f0b640; } .c-pm b { background: #e8eef5; box-shadow: 0 0 8px #fff; }
.hs-text { width: 100%; min-height: 84px; resize: vertical; padding: 8px 10px; font-size: 13px; line-height: 1.45; color: #F7F2E6; background: #0b0202; border: 1px dashed #DF000066; border-radius: 8px; outline: none; transition: border-color var(--t) var(--ease), box-shadow var(--t) var(--ease); }
.hs-text:focus { border-color: #DF0000; border-style: solid; box-shadow: 0 0 14px #DF000044; }
.hs-note { margin-top: 12px; font-size: 11px; color: #959595; text-align: right; }
.hs-title { font: 700 30px/1 var(--font-display); padding-bottom: 10px; border-bottom: 1px solid #DF000044; text-shadow: 0 0 16px #DF000077; }
.hs-slot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #DF0000; box-shadow: 0 0 8px #DF0000; }

@media print {
  body * { visibility: hidden !important; }
  .hs-print, .hs-print * { visibility: visible !important; }
  .hs-print { position: relative; box-shadow: none !important; break-inside: avoid; page-break-after: always; }
  .hs-reroll { display: none !important; }
}
@media (prefers-reduced-motion: reduce) { .hs-in, .hs-ab.rolling *, .hg-flare { animation: none !important; } }
</style>
