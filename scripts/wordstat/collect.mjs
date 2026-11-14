// Сбор реальной частотности из Яндекс Вордстата (Yandex Cloud Search API v2) и заполнение SEO-ядра.
//
// Запуск на своём компьютере (в облаке Claude API Яндекса недоступен):
//   1) в .env: WORDSTAT_API_KEY, WORDSTAT_FOLDER_ID (ID каталога в console.yandex.cloud), WORDSTAT_REGIONS=2
//   2) npm run wordstat
// Результат: seo/semantic-core-filled.xlsx  (+ сырые ответы в seo/raw/)
//
// Что делает:
//   • для каждой маски из seeds.json берёт топ-2000 запросов (topRequests) — это реальные фразы с частотой;
//   • заполняет «Частотность WS» в листе «Ядро» для совпавших фраз;
//   • добавляет лист «Wordstat_реальные» со всеми найденными фразами, группой и кластером;
//   • отдельным проходом уточняет точную частоту "!слово !слово" для Ключевых/Целевых (лимит WORDSTAT_EXACT_LIMIT).
// Платно: каждый запрос тарифицируется по прайсу Search API в Yandex Cloud — проверь баланс.

import fs from 'node:fs/promises'
import path from 'node:path'
import ExcelJS from 'exceljs'

const API = 'https://searchapi.api.cloud.yandex.net/v2/wordstat/topRequests'
const KEY = process.env.WORDSTAT_API_KEY
const FOLDER = process.env.WORDSTAT_FOLDER_ID
const REGIONS = (process.env.WORDSTAT_REGIONS || '2').split(',').map((s) => s.trim()).filter(Boolean)
const EXACT_LIMIT = Number(process.env.WORDSTAT_EXACT_LIMIT || 300)
const PAUSE = Number(process.env.WORDSTAT_PAUSE_MS || 400)
const ROOT = path.resolve(import.meta.dirname, '../..')
const SRC = path.join(ROOT, 'seo/semantic-core.xlsx')
const OUT = path.join(ROOT, 'seo/semantic-core-filled.xlsx')
const RAW = path.join(ROOT, 'seo/raw')

if (!KEY) { console.error('Нет WORDSTAT_API_KEY в .env'); process.exit(1) }
if (!FOLDER) console.warn('⚠ WORDSTAT_FOLDER_ID пуст — если API ответит ошибкой, укажи ID каталога из консоли Yandex Cloud')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const norm = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/[!+"\[\]]/g, '').replace(/\s+/g, ' ').trim()

async function top(phrase, numPhrases = 2000, attempt = 1) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `Api-Key ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ phrase, numPhrases: String(numPhrases), regions: REGIONS, devices: ['DEVICE_ALL'], ...(FOLDER ? { folderId: FOLDER } : {}) })
  })
  if ((res.status === 429 || res.status >= 500) && attempt < 5) {
    await sleep(1000 * attempt * attempt)
    return top(phrase, numPhrases, attempt + 1)
  }
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.json()
}

// Та же логика групп, что в ядре
const GEO = /(спб|питер|петербург|санкт|рядом|поблизости|недалеко)/
const COMMERCE = /(поиграть|играть|сыграть|запис|клуб|мастер|цена|стоим|стоит|недорого|игротек|антикафе|партию|групп|игроков|новичк|начина|вживую|оффлайн|офлайн|сегодня|выходн|расписан|друз|рожден|корпорат)/
const TARGET = /(ваншот|хоррор|детектив|двоих|витрувий|свеч|диско|гоблин|бастион|каштанищ|асмоде|полурослик|налянск|эндеми|химера|под стеклом|хижин|18\+|акци|скидк)/
const INFO = /(что такое|правил|как играть|классы|расы|лист персонажа|создание персонажа|википеди)/
function classify(q) {
  if (TARGET.test(q)) return 'Целевой'
  if (COMMERCE.test(q) && GEO.test(q)) return 'Ключевой'
  if (COMMERCE.test(q)) return 'Узкий (запись)'
  if (GEO.test(q) && !INFO.test(q)) return 'Ключевой'
  return 'Широкий'
}

async function main() {
  await fs.mkdir(RAW, { recursive: true })
  const seeds = JSON.parse(await fs.readFile(path.join(import.meta.dirname, 'seeds.json'), 'utf8'))

  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(SRC)
  const core = wb.getWorksheet('Ядро')
  const masks = wb.getWorksheet('Маски Wordstat')

  // 1) Маски → реальные фразы
  const found = new Map() // phrase -> { count, seed, kind }
  for (let i = 0; i < seeds.length; i++) {
    const s = seeds[i]
    process.stdout.write(`[${i + 1}/${seeds.length}] ${s.phrase} … `)
    try {
      const r = await top(s.phrase)
      await fs.writeFile(path.join(RAW, `${i}-${s.phrase.replace(/[^\p{L}\p{N}]+/gu, '_')}.json`), JSON.stringify(r, null, 2))
      for (const p of r.results ?? []) {
        const k = norm(p.phrase)
        const c = Number(p.count)
        if (!found.has(k) || found.get(k).count < c) found.set(k, { count: c, seed: s.phrase, kind: 'топ' })
      }
      for (const p of r.associations ?? []) {
        const k = norm(p.phrase)
        if (!found.has(k)) found.set(k, { count: Number(p.count), seed: s.phrase, kind: 'похожий' })
      }
      masks.getRow(i + 2).getCell(3).value = Number(r.totalCount ?? 0)
      console.log(`${r.results?.length ?? 0} фраз, всего ${r.totalCount}`)
    } catch (e) {
      console.log('ошибка:', e.message)
      if (i === 0) { console.error('Первый же запрос упал — проверь ключ, роль search-api.webSearch.user и folderId.'); process.exit(1) }
    }
    await sleep(PAUSE)
  }

  // 2) Заполняем частоты в ядре
  let matched = 0
  const exactQueue = []
  core.eachRow((row, n) => {
    if (n === 1) return
    const q = norm(String(row.getCell(2).value ?? ''))
    const f = found.get(q)
    if (f) { row.getCell(8).value = f.count; row.getCell(10).value = 'wordstat'; matched++ }
    else row.getCell(8).value = 0
    const g = row.getCell(3).value
    if ((g === 'Ключевой' || g === 'Целевой') && f && f.count > 0) exactQueue.push({ row, q, count: f.count })
  })
  console.log(`\nСовпало с ядром: ${matched}. Всего реальных фраз: ${found.size}`)

  // 3) Точная частота для самых частотных ключевых/целевых
  exactQueue.sort((a, b) => b.count - a.count)
  const exact = exactQueue.slice(0, EXACT_LIMIT)
  for (let i = 0; i < exact.length; i++) {
    const { row, q } = exact[i]
    const op = '"' + q.split(' ').map((w) => `!${w}`).join(' ') + '"'
    try {
      const r = await top(op, 1)
      row.getCell(9).value = Number(r.totalCount ?? 0)
    } catch (e) { row.getCell(9).value = null }
    if (i % 20 === 0) console.log(`точная частота: ${i}/${exact.length}`)
    await sleep(PAUSE)
  }

  // 4) Лист с реальными фразами
  const old = wb.getWorksheet('Wordstat_реальные')
  if (old) wb.removeWorksheet(old.id)
  const ws = wb.addWorksheet('Wordstat_реальные')
  ws.columns = [
    { header: 'Запрос', key: 'q', width: 60 },
    { header: 'Частотность WS', key: 'c', width: 16 },
    { header: 'Группа (авто)', key: 'g', width: 18 },
    { header: 'Тип', key: 'k', width: 12 },
    { header: 'Маска', key: 's', width: 30 },
    { header: `Регион(ы)`, key: 'r', width: 12 }
  ]
  ;[...found.entries()].sort((a, b) => b[1].count - a[1].count).forEach(([q, f]) =>
    ws.addRow({ q, c: f.count, g: classify(q), k: f.kind, s: f.seed, r: REGIONS.join(',') })
  )
  ws.getRow(1).font = { bold: true }
  ws.autoFilter = 'A1:F1'
  ws.views = [{ state: 'frozen', ySplit: 1 }]

  await wb.xlsx.writeFile(OUT)
  console.log(`\nГотово → ${path.relative(ROOT, OUT)}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
