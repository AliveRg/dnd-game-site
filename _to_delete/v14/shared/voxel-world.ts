// Воксельный мир для карты: локации = группы гекс-платформ из кубиков, вокруг вода.
// Каждый кубик знает свою фазу постройки: 0 - платформа (белая → грунт), 1 - слои грунта, 2 - верхний слой (трава/снег/песок…),
// 3 - окружение (деревья, дома, животные). Анимацию по этим данным делает VoxelMap.vue.
// Добавить локацию: id из shared/map-zones.ts, клетки на доске LAYOUT и биом в BIOMES.

export type Vox = { x: number; y: number; z: number; c: number; s: number; ph: 0 | 1 | 2 | 3; d: number }
export type WorldZone = { id: string; center: [number, number]; top: number; tiles: [number, number][]; vox: Vox[] }

// Доска гексов (плоский верх, «odd-q»): буква = локация, точка = вода
const LAYOUT = [
  '.CCTT..B.',
  'ACGTK..BB',
  'AGGSKK...',
  '.DGSH.NN.',
  '.DOWH..NL',
  '..OW...LL'
]
const KEY: Record<string, string> = { C: 'citadel', T: 'trava', B: 'bastion', A: 'asmodeus', G: 'gorodok', K: 'kashtan', S: 'steklo', H: 'chimera', D: 'disco', O: 'domik', W: 'candles', N: 'nalyansk', L: 'goblins' }

export const HEX_R = 4.7 // радиус платформы в кубиках
const TILE = 5.25 // шаг сетки (зазор между платформами как на референсе)
const SQ3 = Math.sqrt(3)

const C = {
  white: 0xece6d8, deep: 0x5a3a22, dirt: 0x8a5a32,
  grass: 0x79b85a, grass2: 0x8fd16a, darkGrass: 0x4f8a45, autumn: 0xc9a24a, snow: 0xf4f7fb, rock: 0x8a8f99, rock2: 0x5b5f69,
  sand: 0xead7a0, sand2: 0xd9c084, basalt: 0x3a2228, lava: 0xff5a1a, lava2: 0xffb020, purple: 0x4a3a52, purple2: 0x3a2a30,
  water: 0x4fa3c0, darkWater: 0x1a1430, toxic: 0x9be81a, concrete: 0x8a8f86, olive: 0x8a9a4a,
  trunk: 0x6b4423, leaf: 0x3f8a3a, leaf2: 0x5aa84a, pine: 0x2f5d45, wall: 0xf7f2e6, roof: 0xc0392b, roof2: 0x8a3a2a,
  stone: 0xb8b2a6, stone2: 0x8f8a80, red: 0xdf0000, gold: 0xf0a040, glass: 0xbff3ff, silver: 0xd8d8e8, pink: 0xff6bd5, cyan: 0x4de8ff,
  black: 0x1a1414, flame: 0xffc94a, orange: 0xe07a2a, sheep: 0xf7f2e6, goblin: 0x5aa02a, mush: 0xb05ad8, bone: 0xf1e6cf, tent: 0x7a5a2a, tent2: 0xa07a3a
}

// детерминированный «рандом», чтобы мир всегда был одинаковым
function rng(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

type Ctx = { cells: { x: number; z: number; h: number }[]; cx: number; cz: number; r: () => number; tileIdx: number; put: (v: Omit<Vox, 'd' | 'ph'> & { ph?: Vox['ph'] }) => void; hAt: (x: number, z: number) => number }
type Biome = {
  top: number | ((x: number, z: number, ctx: Ctx) => number)
  dirt?: number; deep?: number
  h: (dx: number, dz: number, ctx: Ctx) => number // высота столбика над платформой (0 = только платформа)
  props?: (ctx: Ctx) => void
}

// ---------- кирпичики окружения (s = 0.5 - полукубики для деталей) ----------
const H = 0.5
function blk(ctx: Ctx, x: number, y: number, z: number, c: number, s = H) { ctx.put({ x, y, z, c, s, ph: 3 }) }
function tree(ctx: Ctx, x: number, z: number, leaf = C.leaf, leaf2 = C.leaf2) {
  const y = ctx.hAt(x, z)
  blk(ctx, x, y + 0.25, z, C.trunk); blk(ctx, x, y + 0.75, z, C.trunk)
  for (let i = -1; i <= 1; i++) for (let k = -1; k <= 1; k++) { blk(ctx, x + i * H, y + 1.25, z + k * H, (i + k) % 2 ? leaf : leaf2); if (Math.abs(i) + Math.abs(k) < 2) blk(ctx, x + i * H, y + 1.75, z + k * H, leaf) }
  blk(ctx, x, y + 2.25, z, leaf2)
}
function pine(ctx: Ctx, x: number, z: number, col = C.pine, snowCap = false) {
  const y = ctx.hAt(x, z)
  blk(ctx, x, y + 0.25, z, C.trunk)
  for (let i = -1; i <= 1; i++) for (let k = -1; k <= 1; k++) blk(ctx, x + i * H, y + 0.75, z + k * H, col)
  for (const [i, k] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) blk(ctx, x + i! * H, y + 1.25, z + k! * H, col)
  blk(ctx, x, y + 1.75, z, snowCap ? C.snow : col); blk(ctx, x, y + 2.25, z, snowCap ? C.snow : col)
}
function house(ctx: Ctx, x: number, z: number, roof = C.roof, wall = C.wall) {
  const y = ctx.hAt(x, z)
  for (let i = -1; i <= 1; i++) for (let k = -1; k <= 1; k++) { blk(ctx, x + i * H, y + 0.25, z + k * H, wall); blk(ctx, x + i * H, y + 0.75, z + k * H, i === 0 && k === 1 ? C.trunk : wall) }
  for (let i = -1; i <= 1; i++) for (let k = -1; k <= 1; k++) blk(ctx, x + i * H, y + 1.25, z + k * H, roof)
  for (let i = -1; i <= 1; i++) blk(ctx, x + i * H, y + 1.75, z, roof)
}
function tower(ctx: Ctx, x: number, z: number, h = 4, col = C.stone, flag = C.red) {
  const y = ctx.hAt(x, z)
  for (let j = 0; j < h; j++) for (let i = 0; i < 2; i++) for (let k = 0; k < 2; k++) blk(ctx, x + i * H, y + 0.25 + j * H, z + k * H, j % 3 === 2 ? C.stone2 : col)
  for (const [i, k] of [[0, 0], [1, 1]]) blk(ctx, x + i! * H, y + 0.25 + h * H, z + k! * H, col)
  blk(ctx, x, y + 0.25 + (h + 1) * H, z, C.trunk); blk(ctx, x + H, y + 0.25 + (h + 1.6) * H, z, flag)
}
function sheep(ctx: Ctx, x: number, z: number) {
  const y = ctx.hAt(x, z); const s = 0.34
  ctx.put({ x, y: y + 0.2, z, c: C.sheep, s, ph: 3 }); ctx.put({ x: x + s, y: y + 0.2, z, c: C.sheep, s, ph: 3 }); ctx.put({ x: x + s * 1.9, y: y + 0.32, z, c: C.black, s: 0.26, ph: 3 })
}
function fire(ctx: Ctx, x: number, z: number) {
  const y = ctx.hAt(x, z)
  blk(ctx, x, y + 0.15, z, C.trunk, 0.4); ctx.put({ x, y: y + 0.45, z, c: C.orange, s: 0.36, ph: 3 }); ctx.put({ x, y: y + 0.75, z, c: C.flame, s: 0.24, ph: 3 })
}
function rock(ctx: Ctx, x: number, z: number, col = C.stone2) { const y = ctx.hAt(x, z); blk(ctx, x, y + 0.25, z, col); blk(ctx, x + H, y + 0.25, z, col); blk(ctx, x + 0.25, y + 0.75, z, col) }

// ---------- биомы ----------
const dist = (dx: number, dz: number) => Math.hypot(dx, dz) / HEX_R
const noise = (x: number, z: number) => Math.sin(x * 1.7 + z * 0.6) * 0.5 + Math.sin(z * 1.3 - x * 0.4) * 0.5

const BIOMES: Record<string, Biome> = {
  citadel: { top: (x, z, ctx) => (ctx.hAt(x, z) > 3 ? C.snow : C.darkGrass), dirt: C.rock, deep: C.rock2,
    h: (dx, dz, ctx) => Math.max(1, Math.round(6.5 - dist(dx, dz) * 6.5 + noise(dx + ctx.tileIdx, dz) * 1.2)),
    props: (ctx) => { if (ctx.tileIdx === 1) tower(ctx, ctx.cx, ctx.cz, 5); pine(ctx, ctx.cx - 3, ctx.cz + 2, C.pine, true); pine(ctx, ctx.cx + 3, ctx.cz + 2.2, C.pine, true) } },
  asmodeus: { top: (x, z) => (noise(x * 1.3, z * 1.3) > 0.55 ? C.lava : C.basalt), dirt: 0x5a2a22, deep: 0x2a1418,
    h: (dx, dz) => (noise(dx * 1.3, dz * 1.3) > 0.55 ? 0 : 1 + Math.round(Math.max(0, 1.2 - dist(dx, dz)) * 1.5)),
    props: (ctx) => {
      if (ctx.tileIdx === 0) { const y = ctx.hAt(ctx.cx, ctx.cz); for (let j = 0; j < 4; j++) blk(ctx, ctx.cx, y + 0.25 + j * H, ctx.cz - H, j === 3 ? C.gold : C.red); for (const i of [-1, 1]) for (let j = 0; j < 2; j++) blk(ctx, ctx.cx + i * H, y + 0.25 + j * H, ctx.cz, C.red); blk(ctx, ctx.cx, y + 0.25, ctx.cz, C.gold) }
      for (const [a, b] of [[-2.5, -1.5], [2.5, 1], [-1, 3]]) { const y = ctx.hAt(ctx.cx + a!, ctx.cz + b!); for (let j = 0; j < 3; j++) blk(ctx, ctx.cx + a!, y + 0.25 + j * H, ctx.cz + b!, j === 2 ? C.lava2 : 0x6b1020) }
    } },
  gorodok: { top: C.grass, h: (dx, dz) => 1 + (noise(dx, dz) > 0.6 ? 1 : 0),
    props: (ctx) => {
      if (ctx.tileIdx === 0) { house(ctx, ctx.cx - 1.5, ctx.cz - 1); house(ctx, ctx.cx + 1.5, ctx.cz - 0.5, C.roof2); house(ctx, ctx.cx, ctx.cz + 2) }
      if (ctx.tileIdx === 1) { house(ctx, ctx.cx, ctx.cz); tree(ctx, ctx.cx - 2.5, ctx.cz + 1); tree(ctx, ctx.cx + 2.5, ctx.cz - 1.5) }
      if (ctx.tileIdx >= 2) { tree(ctx, ctx.cx - 1.5, ctx.cz); tree(ctx, ctx.cx + 2, ctx.cz + 1); sheep(ctx, ctx.cx, ctx.cz - 2.5); sheep(ctx, ctx.cx + 1, ctx.cz + 3) }
    } },
  trava: { top: C.grass2, h: (dx, dz, ctx) => 1 + Math.round(Math.max(0, 2.4 - Math.hypot(dx - (ctx.tileIdx - 1), dz + 0.5) * 0.75)),
    props: (ctx) => {
      const y = ctx.hAt(ctx.cx, ctx.cz + 2.2); blk(ctx, ctx.cx, y + 0.25, ctx.cz + 2.2, C.gold); blk(ctx, ctx.cx + H, y + 0.25, ctx.cz + 2.2, 0x2a1a10)
      for (let i = 0; i < 6; i++) { const a = ctx.r() * 6.28, d = 1.5 + ctx.r() * 2.2; const x = ctx.cx + Math.cos(a) * d, z = ctx.cz + Math.sin(a) * d; ctx.put({ x, y: ctx.hAt(x, z) + 0.3, z, c: C.leaf2, s: 0.22, ph: 3 }); ctx.put({ x, y: ctx.hAt(x, z) + 0.55, z, c: C.grass2, s: 0.18, ph: 3 }) }
      sheep(ctx, ctx.cx - 2.5, ctx.cz - 1); if (ctx.tileIdx === 0) tree(ctx, ctx.cx + 2.5, ctx.cz - 1.5)
    } },
  kashtan: { top: C.autumn, h: (dx, dz) => 1 + (noise(dx + 3, dz) > 0.4 ? 1 : 0),
    props: (ctx) => {
      if (ctx.tileIdx === 1) { tower(ctx, ctx.cx - 0.5, ctx.cz - 0.5, 5, C.stone2, C.gold); tower(ctx, ctx.cx + 1.5, ctx.cz + 0.5, 3, C.stone2, C.gold) }
      for (const [a, b, c] of [[-2.5, 1.5, C.orange], [2.5, -1.5, C.roof], [0, 3, 0xf0b640], [-2, -2.5, C.orange]] as const) if (ctx.tileIdx === 0 || a < 0) tree(ctx, ctx.cx + a, ctx.cz + b, c, 0xf0b640)
    } },
  steklo: { top: C.grass, h: () => 1,
    props: (ctx) => {
      if (ctx.tileIdx !== 0) { tree(ctx, ctx.cx, ctx.cz); house(ctx, ctx.cx + 2, ctx.cz - 2); return }
      const y = ctx.hAt(ctx.cx, ctx.cz); const R = 3
      for (let i = -R; i <= R; i++) for (let j = 0; j <= R; j++) for (let k = -R; k <= R; k++) { const d = Math.hypot(i, j, k); if (d <= R + 0.3 && d >= R - 0.7) ctx.put({ x: ctx.cx + i * 0.6, y: y + 0.3 + j * 0.6, z: ctx.cz + k * 0.6, c: C.glass, s: 0.58, ph: 3 }) }
      house(ctx, ctx.cx, ctx.cz, C.roof2)
    } },
  chimera: { top: (x, z) => (noise(x * 2, z * 2) > 0.7 ? C.snow : C.purple), dirt: C.purple2, deep: 0x241a20, h: (dx, dz) => 1 + (noise(dx * 2, dz) > 0.5 ? 1 : 0),
    props: (ctx) => {
      for (const [a, b] of [[-2, -1.5], [1.5, -2.5], [2.5, 1.5], [-1, 2.5]]) { const x = ctx.cx + a!, z = ctx.cz + b!, y = ctx.hAt(x, z); for (let j = 0; j < 4; j++) blk(ctx, x, y + 0.25 + j * H, z, 0x2a2026); blk(ctx, x + H, y + 1.25, z, 0x2a2026); blk(ctx, x - H, y + 1.75, z, 0x2a2026) }
      for (let i = 0; i < 3; i++) { const x = ctx.cx + (ctx.r() - 0.5) * 4, z = ctx.cz + (ctx.r() - 0.5) * 4, y = ctx.hAt(x, z); ctx.put({ x, y: y + 0.15, z, c: C.bone, s: 0.2, ph: 3 }); ctx.put({ x, y: y + 0.4, z, c: C.mush, s: 0.4, ph: 3 }) }
    } },
  disco: { top: (x, z) => ((Math.floor(x) + Math.floor(z)) % 2 ? C.pink : (Math.floor(x * 0.5) % 2 ? C.cyan : C.wall)), dirt: 0x3a2a40, deep: 0x241a2a, h: () => 1,
    props: (ctx) => {
      if (ctx.tileIdx !== 0) { for (const a of [-2, 2]) { const y = ctx.hAt(ctx.cx + a, ctx.cz); for (let j = 0; j < 3; j++) blk(ctx, ctx.cx + a, y + 0.25 + j * H, ctx.cz, C.black) } return }
      const y = ctx.hAt(ctx.cx, ctx.cz)
      for (let j = 0; j < 4; j++) blk(ctx, ctx.cx, y + 0.25 + j * H, ctx.cz, C.silver, 0.2)
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) if (Math.abs(i) + Math.abs(j) + Math.abs(k) < 3) ctx.put({ x: ctx.cx + i * 0.4, y: y + 2.9 + j * 0.4, z: ctx.cz + k * 0.4, c: (i + j + k) % 2 ? C.silver : C.white, s: 0.4, ph: 3 })
    } },
  domik: { top: (x, z, ctx) => (ctx.hAt(x, z) <= 0 ? C.water : C.sand), dirt: C.sand2, h: (dx, dz) => (dz + dx * 0.3 > 0.8 ? 0 : 1),
    props: (ctx) => {
      for (let i = 0; i < 5; i++) blk(ctx, ctx.cx - 1 + i * H, 0.75, ctx.cz + 1.6, C.trunk)
      if (ctx.tileIdx === 0) { house(ctx, ctx.cx - 1, ctx.cz - 1.5, C.roof2, 0xd9c49a); tree(ctx, ctx.cx + 2.5, ctx.cz - 2) }
      else { house(ctx, ctx.cx, ctx.cz - 2); const y = 0.75; for (let i = 0; i < 4; i++) blk(ctx, ctx.cx + 1 + i * H, y, ctx.cz + 3, C.trunk); blk(ctx, ctx.cx + 1.75, y + 0.5, ctx.cz + 3, C.wall); blk(ctx, ctx.cx + 1.75, y + 1, ctx.cz + 3, C.wall) }
    } },
  candles: { top: (x, z, ctx) => (ctx.hAt(x, z) <= 0 ? C.darkWater : C.darkGrass), dirt: 0x3a2a22, deep: 0x1a1210, h: (dx, dz) => (dist(dx, dz) < 0.62 ? 0 : 1),
    props: (ctx) => {
      for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.28 + ctx.tileIdx, d = 1.2 + (i % 2) * 0.9; const x = ctx.cx + Math.cos(a) * d, z = ctx.cz + Math.sin(a) * d; ctx.put({ x, y: 0.62, z, c: C.bone, s: 0.3, ph: 3 }); ctx.put({ x, y: 0.9, z, c: C.wall, s: 0.24, ph: 3 }); ctx.put({ x, y: 1.16, z, c: C.flame, s: 0.18, ph: 3 }) }
      pine(ctx, ctx.cx - 3.2, ctx.cz - 1.5, 0x234a38)
    } },
  nalyansk: { top: (x, z, ctx) => (ctx.hAt(x, z) <= 0 ? C.toxic : C.concrete), dirt: 0x5a5a50, deep: 0x3a3a34, h: (dx, dz, ctx) => (ctx.tileIdx === 1 && dist(dx, dz) < 0.55 ? 0 : 1),
    props: (ctx) => {
      if (ctx.tileIdx === 1) return
      for (const [a, b] of [[-1.5, -1], [1.5, 0.5]]) { const x = ctx.cx + a!, z = ctx.cz + b!, y = ctx.hAt(x, z); for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) for (let k = 0; k < 2; k++) blk(ctx, x + i * H, y + 0.25 + j * H, z + k * H, j === 1 && i === 0 ? C.toxic : 0x9aa3a8); blk(ctx, x, y + 1.75, z, 0x6a6f74); blk(ctx, x, y + 2.25, z, 0x6a6f74) }
      for (let i = 0; i < 4; i++) blk(ctx, ctx.cx - 1 + i * H, ctx.hAt(ctx.cx, ctx.cz + 2.5) + 0.25, ctx.cz + 2.5, 0x6a6f74)
    } },
  bastion: { top: C.sand, dirt: C.sand2, deep: 0x9a7a4a, h: (dx, dz) => 1 + (noise(dx * 0.8, dz * 1.4) > 0.5 ? 1 : 0),
    props: (ctx) => {
      if (ctx.tileIdx === 0) { const y = ctx.hAt(ctx.cx, ctx.cz) - 0.5; for (let i = 0; i < 22; i++) { if (i % 6 === 3) continue; const a = (i / 22) * 6.28; for (let j = 0; j < 3; j++) blk(ctx, ctx.cx + Math.cos(a) * 2.6, y + 0.75 + j * H, ctx.cz + Math.sin(a) * 2.6, j === 2 ? C.stone : 0xd8c8a0) } }
      else { const x = ctx.cx + 1, z = ctx.cz, y = ctx.hAt(x, z); for (let j = 0; j < 3; j++) blk(ctx, x, y + 0.25 + j * H, z, 0x4f8a45); blk(ctx, x + H, y + 0.75, z, 0x4f8a45); rock(ctx, ctx.cx - 2, ctx.cz + 1, 0xb8a070) }
    } },
  goblins: { top: C.olive, h: (dx, dz) => 1 + (noise(dx + 7, dz) > 0.55 ? 1 : 0),
    props: (ctx) => {
      for (const [a, b, c] of [[-1.5, -1, C.tent], [1.5, -0.5, C.tent2]] as const) { const x = ctx.cx + a, z = ctx.cz + b, y = ctx.hAt(x, z); for (let i = -1; i <= 1; i++) for (let k = -1; k <= 1; k++) blk(ctx, x + i * H, y + 0.25, z + k * H, c); for (const [i, k] of [[0, 0], [1, 0], [0, 1], [1, 1]]) blk(ctx, x + (i! - 0.5) * H, y + 0.75, z + (k! - 0.5) * H, c); blk(ctx, x, y + 1.25, z, c) }
      fire(ctx, ctx.cx, ctx.cz + 1.5)
      for (const [a, b] of [[-0.8, 2.4], [0.9, 2.2]]) { const x = ctx.cx + a!, z = ctx.cz + b!, y = ctx.hAt(x, z); ctx.put({ x, y: y + 0.2, z, c: C.goblin, s: 0.32, ph: 3 }); ctx.put({ x, y: y + 0.5, z, c: C.goblin, s: 0.26, ph: 3 }) }
      if (ctx.tileIdx === 2) tree(ctx, ctx.cx + 2.5, ctx.cz + 1, C.pine, C.leaf)
    } }
}

/** Собирает мир: список локаций с кубиками и клетки воды-мелководья вокруг */
export function buildWorld() {
  const zones = new Map<string, WorldZone>()
  const allTiles: [number, number][] = []
  LAYOUT.forEach((row, rIdx) => [...row].forEach((ch, col) => {
    const id = KEY[ch]
    if (!id) return
    const x = col * TILE * 1.5
    const z = SQ3 * TILE * (rIdx + (col & 1 ? 0.5 : 0))
    if (!zones.has(id)) zones.set(id, { id, center: [0, 0], top: 0, tiles: [], vox: [] })
    zones.get(id)!.tiles.push([x, z])
    allTiles.push([x, z])
  }))
  // центрируем мир в нуле
  const xs = allTiles.map((t) => t[0]), zs = allTiles.map((t) => t[1])
  const ox = (Math.min(...xs) + Math.max(...xs)) / 2, oz = (Math.min(...zs) + Math.max(...zs)) / 2
  for (const z of zones.values()) z.tiles = z.tiles.map(([x, y]) => [x - ox, y - oz])

  let seed = 7
  for (const zone of zones.values()) {
    const b = BIOMES[zone.id]!
    zone.tiles.forEach(([tx, tz], tileIdx) => {
      const r = rng(++seed * 977)
      const cells: Ctx['cells'] = []
      const R = HEX_R
      for (let i = -6; i <= 6; i++) for (let k = -6; k <= 6; k++) {
        const dx = i, dz = k
        if (Math.abs(dz) > (SQ3 / 2) * R || SQ3 * Math.abs(dx) + Math.abs(dz) > SQ3 * R) continue
        cells.push({ x: tx + dx, z: tz + dz, h: 0 })
      }
      const ctx: Ctx = {
        cells, cx: tx, cz: tz, r, tileIdx,
        put: (v) => zone.vox.push({ ...v, ph: v.ph ?? 3, d: Math.min(1, Math.hypot(v.x - tx, v.z - tz) / (HEX_R + 1)) }),
        hAt: (x, z) => { let best = cells[0]!, bd = 1e9; for (const c of cells) { const d = (c.x - x) ** 2 + (c.z - z) ** 2; if (d < bd) { bd = d; best = c } } return best.h }
      }
      for (const c of cells) c.h = Math.max(0, b.h(c.x - tx, c.z - tz, ctx))
      for (const c of cells) {
        const d = Math.min(1, Math.hypot(c.x - tx, c.z - tz) / HEX_R)
        // платформа: 2 слоя (видна толщина «пирога» сбоку)
        zone.vox.push({ x: c.x, y: -1, z: c.z, c: b.deep ?? C.deep, s: 1, ph: 0, d })
        zone.vox.push({ x: c.x, y: 0, z: c.z, c: c.h > 0 ? (b.dirt ?? C.dirt) : typeof b.top === 'function' ? b.top(c.x, c.z, ctx) : b.top, s: 1, ph: 0, d })
        for (let y = 1; y <= c.h; y++) {
          const isTop = y === c.h
          const col = isTop ? (typeof b.top === 'function' ? b.top(c.x, c.z, ctx) : b.top) : b.dirt ?? C.dirt
          zone.vox.push({ x: c.x, y, z: c.z, c: col, s: 1, ph: isTop ? 2 : 1, d: Math.min(1, d * 0.7 + (y / 8) * 0.3) })
        }
      }
      // окружение стоит на верхнем кубике: hAt возвращает высоту, кубик верха на y=h, его верхняя грань h + 0.5
      const hAt0 = ctx.hAt
      ctx.hAt = (x, z) => hAt0(x, z) + 0.5
      b.props?.(ctx)
      zone.top = Math.max(zone.top, ...cells.map((c) => c.h))
    })
    const n = zone.tiles.length
    zone.center = [zone.tiles.reduce((s, t) => s + t[0], 0) / n, zone.tiles.reduce((s, t) => s + t[1], 0) / n]
  }

  // мелководье: клетки рядом с платформами
  const shallow: [number, number][] = []
  const minX = Math.min(...[...zones.values()].flatMap((z) => z.tiles.map((t) => t[0]))) - TILE * 1.8
  const maxX = -minX
  const minZ = Math.min(...[...zones.values()].flatMap((z) => z.tiles.map((t) => t[1]))) - TILE * 1.6
  const maxZ = -minZ
  const tiles = [...zones.values()].flatMap((z) => z.tiles)
  for (let x = Math.floor(minX); x <= maxX; x++) for (let z = Math.floor(minZ); z <= maxZ; z++) {
    const d = Math.min(...tiles.map((t) => Math.hypot(t[0] - x, t[1] - z)))
    if (d < HEX_R + 2.6) shallow.push([x, z])
  }
  return { zones: [...zones.values()], shallow, bounds: { minX, maxX, minZ, maxZ } }
}
