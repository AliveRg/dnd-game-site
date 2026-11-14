// Правила генератора героя D&D 5e (2024), 1-й уровень. Всё, что «выпадает» на костях, генерируется здесь
// и не редактируется на сайте; имя, внешность и предысторию игрок может переписать.
// Редкость определяет «силу» броска: d20 = 20 → Легендарный (5%), 16-19 → Редкий (20%), 1-15 → Обычный (75%).

export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
export type Rarity = 'common' | 'rare' | 'legendary'

export const ABILITIES: { id: Ability; name: string; short: string }[] = [
  { id: 'str', name: 'Сила', short: 'СИЛ' },
  { id: 'dex', name: 'Ловкость', short: 'ЛОВ' },
  { id: 'con', name: 'Телосложение', short: 'ТЕЛ' },
  { id: 'int', name: 'Интеллект', short: 'ИНТ' },
  { id: 'wis', name: 'Мудрость', short: 'МДР' },
  { id: 'cha', name: 'Харизма', short: 'ХАР' }
]
const AB = Object.fromEntries(ABILITIES.map((a) => [a.id, a])) as Record<Ability, (typeof ABILITIES)[number]>

export const SKILLS = (
  [
    ['acrobatics', 'Акробатика', 'dex'], ['animal', 'Уход за животными', 'wis'], ['arcana', 'Магия', 'int'], ['athletics', 'Атлетика', 'str'],
    ['deception', 'Обман', 'cha'], ['history', 'История', 'int'], ['insight', 'Проницательность', 'wis'], ['intimidation', 'Запугивание', 'cha'],
    ['investigation', 'Анализ', 'int'], ['medicine', 'Медицина', 'wis'], ['nature', 'Природа', 'int'], ['perception', 'Внимательность', 'wis'],
    ['performance', 'Выступление', 'cha'], ['persuasion', 'Убеждение', 'cha'], ['religion', 'Религия', 'int'], ['sleight', 'Ловкость рук', 'dex'],
    ['stealth', 'Скрытность', 'dex'], ['survival', 'Выживание', 'wis']
  ] as const
).map(([id, name, ab]) => ({ id, name, ab: ab as Ability }))
export type SkillId = (typeof SKILLS)[number]['id']

export const RARITY: Record<Rarity, { name: string; chance: string; color: string; d20: string }> = {
  common: { name: 'Обычный', chance: '75%', color: '#959595', d20: '1-15' },
  rare: { name: 'Редкий', chance: '20%', color: '#f0a040', d20: '16-19' },
  legendary: { name: 'Легендарный', chance: '5%', color: '#DF0000', d20: '20' }
}
export const rarityFromD20 = (n: number): Rarity => (n === 20 ? 'legendary' : n >= 16 ? 'rare' : 'common')

// ---------- Виды ----------
type Species = { name: string; speed: number; size: string; alt?: string; traits: string[]; skill?: SkillId | 'any'; hpPerLevel?: number; lang: string; names: [string[], string[], string[]] }
export const SPECIES: Species[] = [
  { name: 'Человек', speed: 30, size: 'Средний', skill: 'any', lang: '', traits: ['Находчивость: Героическое вдохновение после каждого долгого отдыха', 'Умелость: владение ещё одним навыком', 'Дополнительная черта происхождения'],
    names: [['Бран', 'Эдрик', 'Корвин', 'Тобиас', 'Мартин', 'Ричард'], ['Элиза', 'Мира', 'Ровена', 'Агата', 'Лира', 'Вера'], ['Блэквуд', 'Грейвс', 'Торн', 'Эшфорд', 'Хольт']] },
  { name: 'Эльф', speed: 30, size: 'Средний', skill: 'perception', lang: 'Эльфийский', traits: ['Тёмное зрение 60 фт', 'Наследие фей: преимущество против очарования', 'Обострённые чувства: владение Внимательностью', 'Транс: долгий отдых за 4 часа'],
    names: [['Аэлар', 'Тэлорин', 'Риваль', 'Эрдан', 'Галинндан'], ['Ариэль', 'Нейлия', 'Сариэль', 'Таэна', 'Квилена'], ['Лунный Лист', 'Сребролист', 'Звездочёт']] },
  { name: 'Дварф', speed: 30, size: 'Средний', hpPerLevel: 1, lang: 'Дварфийский', traits: ['Тёмное зрение 120 фт', 'Дварфийская стойкость: +1 к максимуму хитов за уровень', 'Сопротивление яду', 'Чувство камня'],
    names: [['Торбин', 'Балин', 'Даин', 'Гримнир', 'Рурик'], ['Хельга', 'Дагна', 'Тордис', 'Брунхильд', 'Ильда'], ['Железнобород', 'Каменный Молот', 'Глубокоруд']] },
  { name: 'Полурослик', speed: 30, size: 'Маленький', lang: 'Полуросликов', traits: ['Везение: переброс единицы на d20', 'Храбрость: преимущество против испуга', 'Проворство: проходит сквозь крупных существ', 'Природная скрытность'],
    names: [['Мило', 'Пипин', 'Кордо', 'Финн', 'Олли'], ['Лавиния', 'Роза', 'Мэриголд', 'Тэнси', 'Келли'], ['Холмистый', 'Тёплый Очаг', 'Быстроног']] },
  { name: 'Гном', speed: 30, size: 'Маленький', lang: 'Гномий', traits: ['Тёмное зрение 60 фт', 'Гномья хитрость: преимущество на спасброски ИНТ, МДР и ХАР', 'Родословная: малые иллюзии или механизмы'],
    names: [['Фибблстик', 'Зук', 'Бимбл', 'Орин', 'Гимбл'], ['Нисса', 'Тинк', 'Элла', 'Бри', 'Зэнна'], ['Шестерёнкин', 'Искроплёт', 'Винтокрут']] },
  { name: 'Драконорождённый', speed: 30, size: 'Средний', alt: 'полёт с 5 ур.', lang: 'Драконий', traits: ['Дыхательное оружие 1к10 (конус 15 фт)', 'Сопротивление урону своей стихии', 'Тёмное зрение 60 фт', 'Драконьи крылья с 5-го уровня'],
    names: [['Аркан', 'Дракс', 'Кривв', 'Медраш', 'Торинн'], ['Акра', 'Бири', 'Фарида', 'Сора', 'Харанн'], ['из клана Кердрав', 'из клана Йарджерит', 'из клана Делмирев']] },
  { name: 'Тифлинг', speed: 30, size: 'Средний', lang: 'Инфернальный', traits: ['Тёмное зрение 60 фт', 'Адское наследие: сопротивление огню', 'Заговор «Чудотворство»', 'Потусторонний облик'],
    names: [['Акмен', 'Дамакос', 'Мордай', 'Скаммос', 'Кайрон'], ['Нимерия', 'Орианна', 'Лерисса', 'Криелла', 'Ария'], ['«Пепел»', '«Песнь»', '«Надежда»', '«Скорбь»']] },
  { name: 'Орк', speed: 30, size: 'Средний', lang: 'Орочий', traits: ['Тёмное зрение 120 фт', 'Прилив адреналина: Рывок бонусным действием + временные хиты', 'Неукротимая выносливость: раз в день остаться с 1 хитом'],
    names: [['Дэнч', 'Гелл', 'Хенк', 'Краск', 'Шамп'], ['Багги', 'Энга', 'Ова', 'Шаута', 'Волен'], ['Кровавый Клык', 'Сломанный Бивень', 'Пепельный']] },
  { name: 'Голиаф', speed: 35, size: 'Средний', lang: 'Великаний', traits: ['Великанье наследие: Каменная выносливость', 'Мощное телосложение: преимущество против захвата', 'Большая форма с 5-го уровня'],
    names: [['Аукан', 'Илиак', 'Кеотх', 'Таман', 'Вимак'], ['Гаэ-Ал', 'Каутхра', 'Маглин', 'Наулаэ', 'Орилло'], ['Каменный Шаг', 'Поднимающий Скалы', 'Громовой Голос']] },
  { name: 'Аасимар', speed: 30, size: 'Средний', alt: 'полёт с 3 ур. (1 мин)', lang: 'Небесный', traits: ['Тёмное зрение 60 фт', 'Небесное сопротивление: некротический урон и излучение', 'Исцеляющие руки', 'Несущий свет: заговор «Свет»'],
    names: [['Алдрик', 'Эмрис', 'Лоран', 'Сериан', 'Теон'], ['Ариэлла', 'Селеста', 'Илиана', 'Мирабель', 'Сераф'], ['Светлый', 'Рассветный', 'Звёздный']] }
]

// ---------- Классы ----------
type Attack = { name: string; ab: Ability | 'spell'; dmg: string; type: string; note?: string; spell?: boolean }
type Caster = { ab: Ability; cantrips: [number, string[]]; spells: [number, string[]]; slots: number; label: string }
type Klass = {
  name: string; hd: number; order: Ability[]; saves: [Ability, Ability]; skills: [number, SkillId[] | 'any']; armor: string; weapons: string
  ac: (m: Record<Ability, number>) => { ac: number; note: string }; attacks: Attack[]; features: string[]; bonus: string[]; reaction: string[]
  caster?: Caster; equip: string[]; gold: number; role: string; die: string
}
const ALL_SKILLS = 'any' as const
export const CLASSES: Klass[] = [
  { name: 'Варвар', hd: 12, order: ['str', 'con', 'dex', 'wis', 'cha', 'int'], saves: ['str', 'con'], skills: [2, ['animal', 'athletics', 'intimidation', 'nature', 'perception', 'survival']],
    armor: 'лёгкие и средние доспехи, щиты', weapons: 'простое и воинское оружие', role: 'Боец', die: 'к12',
    ac: (m) => ({ ac: 10 + m.dex + m.con, note: 'Защита без доспехов' }),
    attacks: [{ name: 'Секира', ab: 'str', dmg: '1к12', type: 'рубящий' }, { name: 'Ручной топор', ab: 'str', dmg: '1к6', type: 'рубящий', note: 'метательное 20/60' }],
    features: ['Ярость: 2 раза за долгий отдых, +2 к урону, сопротивление физическому урону', 'Защита без доспехов: 10 + ЛОВ + ТЕЛ', 'Оружейное мастерство: 2 вида оружия'],
    bonus: ['Ярость'], reaction: [], equip: ['Секира', 'Ручной топор ×4', 'Набор путешественника'], gold: 15 },
  { name: 'Бард', hd: 8, order: ['cha', 'dex', 'con', 'wis', 'int', 'str'], saves: ['dex', 'cha'], skills: [3, ALL_SKILLS],
    armor: 'лёгкие доспехи', weapons: 'простое оружие', role: 'Лидер', die: 'к8',
    ac: (m) => ({ ac: 11 + m.dex, note: 'Кожаный доспех' }),
    attacks: [{ name: 'Рапира', ab: 'dex', dmg: '1к8', type: 'колющий' }, { name: 'Злая насмешка', ab: 'spell', dmg: '1к6', type: 'психический', spell: true, note: 'спасбросок МДР' }],
    features: ['Вдохновение барда: к6, раз в ход союзнику, ХАР раз за долгий отдых', 'Использование заклинаний (ХАР), инструмент как фокусировка'],
    bonus: ['Вдохновение барда'], reaction: [], equip: ['Рапира', 'Кинжал', 'Кожаный доспех', 'Музыкальный инструмент', 'Набор артиста'], gold: 19,
    caster: { ab: 'cha', label: 'Бард', cantrips: [2, ['Злая насмешка', 'Малая иллюзия', 'Свет', 'Волшебная рука', 'Дружба', 'Сообщение']], spells: [4, ['Лечащее слово', 'Очарование личности', 'Огонь фей', 'Громовая волна', 'Усыпление', 'Понимание языков', 'Героизм', 'Невидимое письмо']], slots: 2 } },
  { name: 'Жрец', hd: 8, order: ['wis', 'con', 'str', 'cha', 'dex', 'int'], saves: ['wis', 'cha'], skills: [2, ['history', 'insight', 'medicine', 'persuasion', 'religion']],
    armor: 'лёгкие и средние доспехи, щиты', weapons: 'простое оружие', role: 'Мистик', die: 'к8',
    ac: (m) => ({ ac: 13 + Math.min(m.dex, 2) + 2, note: 'Кольчужная рубаха + щит' }),
    attacks: [{ name: 'Булава', ab: 'str', dmg: '1к6', type: 'дробящий' }, { name: 'Священное пламя', ab: 'spell', dmg: '1к8', type: 'излучение', spell: true, note: 'спасбросок ЛОВ' }],
    features: ['Использование заклинаний (МДР), священный символ', 'Божественный порядок: Защитник (тяжёлые доспехи) или Тауматург (+1 заговор)'],
    bonus: ['Лечащее слово (заклинание)'], reaction: [], equip: ['Булава', 'Кольчужная рубаха', 'Щит', 'Священный символ', 'Набор священника'], gold: 7,
    caster: { ab: 'wis', label: 'Жрец', cantrips: [3, ['Священное пламя', 'Указание', 'Чудотворство', 'Свет', 'Сопротивление', 'Починка']], spells: [4, ['Лечение ран', 'Лечащее слово', 'Благословение', 'Щит веры', 'Направляющий снаряд', 'Приказ', 'Обнаружение магии', 'Порча']], slots: 2 } },
  { name: 'Друид', hd: 8, order: ['wis', 'con', 'dex', 'int', 'cha', 'str'], saves: ['int', 'wis'], skills: [2, ['arcana', 'animal', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival']],
    armor: 'лёгкие доспехи, щиты', weapons: 'простое оружие', role: 'Мистик', die: 'к8',
    ac: (m) => ({ ac: 11 + m.dex + 2, note: 'Кожаный доспех + щит' }),
    attacks: [{ name: 'Боевой посох', ab: 'str', dmg: '1к6', type: 'дробящий' }, { name: 'Сотворение пламени', ab: 'spell', dmg: '1к8', type: 'огонь', spell: true, note: 'атака заклинанием' }],
    features: ['Использование заклинаний (МДР), друидическая фокусировка', 'Друидический язык', 'Изначальный порядок: Маг (+1 заговор) или Страж (воинское оружие, средние доспехи)'],
    bonus: [], reaction: [], equip: ['Серп', 'Боевой посох', 'Кожаный доспех', 'Щит', 'Набор травника', 'Набор исследователя'], gold: 9,
    caster: { ab: 'wis', label: 'Друид', cantrips: [2, ['Сотворение пламени', 'Друидизм', 'Шилейла', 'Ядовитые брызги', 'Указание']], spells: [4, ['Лечение ран', 'Опутывание', 'Огонь фей', 'Разговор с животными', 'Громовая волна', 'Чудо-ягоды', 'Туманное облако']], slots: 2 } },
  { name: 'Воин', hd: 10, order: ['str', 'con', 'dex', 'wis', 'cha', 'int'], saves: ['str', 'con'], skills: [2, ['acrobatics', 'animal', 'athletics', 'history', 'insight', 'intimidation', 'persuasion', 'perception', 'survival']],
    armor: 'все доспехи, щиты', weapons: 'простое и воинское оружие', role: 'Боец', die: 'к10',
    ac: (m) => (12 + m.dex > 16 ? { ac: 12 + m.dex, note: 'Проклёпанная кожа' } : { ac: 16, note: 'Кольчуга' }),
    attacks: [{ name: 'Длинный меч', ab: 'str', dmg: '1к8', type: 'рубящий', note: 'двумя руками 1к10' }, { name: 'Длинный лук', ab: 'dex', dmg: '1к8', type: 'колющий', note: '150/600' }],
    features: ['Боевой стиль (например, Защита: +1 к КД в доспехах)', 'Второе дыхание: бонусным действием 1к10 + уровень хитов, 2 раза', 'Оружейное мастерство: 3 вида оружия'],
    bonus: ['Второе дыхание'], reaction: [], equip: ['Кольчуга', 'Длинный меч', 'Длинный лук и 20 стрел', 'Набор исследователя подземелий'], gold: 4 },
  { name: 'Монах', hd: 8, order: ['dex', 'wis', 'con', 'str', 'int', 'cha'], saves: ['str', 'dex'], skills: [2, ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth']],
    armor: 'нет', weapons: 'простое оружие, воинское лёгкое', role: 'Ловкач', die: 'к8',
    ac: (m) => ({ ac: 10 + m.dex + m.wis, note: 'Защита без доспехов' }),
    attacks: [{ name: 'Безоружный удар', ab: 'dex', dmg: '1к6', type: 'дробящий', note: 'Боевые искусства' }, { name: 'Копьё', ab: 'dex', dmg: '1к6', type: 'колющий' }],
    features: ['Боевые искусства: к6, атаки ЛОВ, безоружный удар бонусным действием', 'Защита без доспехов: 10 + ЛОВ + МДР'],
    bonus: ['Безоружный удар (Боевые искусства)'], reaction: [], equip: ['Копьё', 'Кинжал ×5', 'Набор исследователя'], gold: 11 },
  { name: 'Паладин', hd: 10, order: ['str', 'cha', 'con', 'wis', 'dex', 'int'], saves: ['wis', 'cha'], skills: [2, ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion']],
    armor: 'все доспехи, щиты', weapons: 'простое и воинское оружие', role: 'Танк', die: 'к10',
    ac: () => ({ ac: 18, note: 'Кольчуга + щит' }),
    attacks: [{ name: 'Длинный меч', ab: 'str', dmg: '1к8', type: 'рубящий' }, { name: 'Метательное копьё', ab: 'str', dmg: '1к6', type: 'колющий', note: '30/120' }],
    features: ['Наложение рук: запас 5 хитов лечения, бонусным действием', 'Использование заклинаний (ХАР)', 'Оружейное мастерство: 2 вида оружия'],
    bonus: ['Наложение рук'], reaction: [], equip: ['Кольчуга', 'Щит', 'Длинный меч', 'Метательное копьё ×6', 'Священный символ'], gold: 9,
    caster: { ab: 'cha', label: 'Паладин', cantrips: [0, []], spells: [2, ['Благословение', 'Героизм', 'Щит веры', 'Приказ', 'Божественное благоволение', 'Лечение ран']], slots: 2 } },
  { name: 'Следопыт', hd: 10, order: ['dex', 'wis', 'con', 'str', 'int', 'cha'], saves: ['str', 'dex'], skills: [3, ['animal', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival']],
    armor: 'лёгкие и средние доспехи, щиты', weapons: 'простое и воинское оружие', role: 'Ловкач', die: 'к10',
    ac: (m) => ({ ac: 12 + m.dex, note: 'Проклёпанная кожа' }),
    attacks: [{ name: 'Длинный лук', ab: 'dex', dmg: '1к8', type: 'колющий', note: '150/600' }, { name: 'Короткий меч', ab: 'dex', dmg: '1к6', type: 'колющий' }],
    features: ['Избранный враг: Метка охотника 2 раза без ячейки', 'Использование заклинаний (МДР)', 'Оружейное мастерство: 2 вида оружия'],
    bonus: ['Метка охотника'], reaction: [], equip: ['Проклёпанная кожа', 'Длинный лук и 20 стрел', 'Короткий меч ×2', 'Набор исследователя'], gold: 7,
    caster: { ab: 'wis', label: 'Следопыт', cantrips: [0, []], spells: [2, ['Метка охотника', 'Лечение ран', 'Разговор с животными', 'Туманное облако', 'Обнаружение магии', 'Чудо-ягоды']], slots: 2 } },
  { name: 'Плут', hd: 8, order: ['dex', 'con', 'int', 'wis', 'cha', 'str'], saves: ['dex', 'int'], skills: [4, ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'persuasion', 'sleight', 'stealth']],
    armor: 'лёгкие доспехи', weapons: 'простое оружие, воинское лёгкое', role: 'Ловкач', die: 'к8',
    ac: (m) => ({ ac: 11 + m.dex, note: 'Кожаный доспех' }),
    attacks: [{ name: 'Рапира', ab: 'dex', dmg: '1к8', type: 'колющий', note: '+ Скрытая атака 1к6' }, { name: 'Короткий лук', ab: 'dex', dmg: '1к6', type: 'колющий', note: '80/320' }],
    features: ['Компетентность: двойное мастерство в 2 навыках', 'Скрытая атака: +1к6 урона раз в ход', 'Воровской жаргон', 'Оружейное мастерство: 2 вида оружия'],
    bonus: ['Хитрое действие (со 2-го уровня)'], reaction: [], equip: ['Рапира', 'Короткий лук и 20 стрел', 'Кожаный доспех', 'Воровские инструменты', 'Набор взломщика'], gold: 8 },
  { name: 'Чародей', hd: 6, order: ['cha', 'con', 'dex', 'wis', 'int', 'str'], saves: ['con', 'cha'], skills: [2, ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion']],
    armor: 'нет', weapons: 'простое оружие', role: 'Маг', die: 'к6',
    ac: (m) => ({ ac: 10 + m.dex, note: 'Без доспехов' }),
    attacks: [{ name: 'Огненный снаряд', ab: 'spell', dmg: '1к10', type: 'огонь', spell: true, note: '120 фт' }, { name: 'Кинжал', ab: 'dex', dmg: '1к4', type: 'колющий' }],
    features: ['Использование заклинаний (ХАР)', 'Врождённое колдовство: 2 раза, преимущество на атаки заклинаниями и +1 к Сл'],
    bonus: ['Врождённое колдовство'], reaction: ['Щит (если выучен)'], equip: ['Копьё', 'Кинжал ×2', 'Магическая фокусировка', 'Набор исследователя'], gold: 28,
    caster: { ab: 'cha', label: 'Чародей', cantrips: [4, ['Огненный снаряд', 'Луч холода', 'Брызги кислоты', 'Свет', 'Малая иллюзия', 'Сообщение', 'Электрошок']], spells: [2, ['Волшебная стрела', 'Щит', 'Огненные ладони', 'Усыпление', 'Цветной шарик', 'Маскировка', 'Туманное облако']], slots: 2 } },
  { name: 'Колдун', hd: 8, order: ['cha', 'con', 'dex', 'wis', 'int', 'str'], saves: ['wis', 'cha'], skills: [2, ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion']],
    armor: 'лёгкие доспехи', weapons: 'простое оружие', role: 'Маг', die: 'к8',
    ac: (m) => ({ ac: 11 + m.dex, note: 'Кожаный доспех' }),
    attacks: [{ name: 'Мистический заряд', ab: 'spell', dmg: '1к10', type: 'силовое поле', spell: true, note: '120 фт' }, { name: 'Кинжал', ab: 'dex', dmg: '1к4', type: 'колющий' }],
    features: ['Мистические воззвания: 1 (например, Мучительный взрыв)', 'Магия договора (ХАР): ячейки восстанавливаются после короткого отдыха'],
    bonus: ['Сглаз (заклинание)'], reaction: ['Адское возмездие (если выучено)'], equip: ['Кинжал ×2', 'Кожаный доспех', 'Тайная фокусировка', 'Набор учёного'], gold: 15,
    caster: { ab: 'cha', label: 'Колдун', cantrips: [2, ['Мистический заряд', 'Леденящее касание', 'Малая иллюзия', 'Волшебная рука', 'Дружба']], spells: [2, ['Сглаз', 'Адское возмездие', 'Доспех Агатиса', 'Очарование личности', 'Ведьмин снаряд', 'Защита от добра и зла']], slots: 1 } },
  { name: 'Волшебник', hd: 6, order: ['int', 'con', 'dex', 'wis', 'cha', 'str'], saves: ['int', 'wis'], skills: [2, ['arcana', 'history', 'insight', 'investigation', 'medicine', 'nature', 'religion']],
    armor: 'нет', weapons: 'простое оружие', role: 'Маг', die: 'к6',
    ac: (m) => ({ ac: 10 + m.dex, note: 'Без доспехов (Магический доспех: 13 + ЛОВ)' }),
    attacks: [{ name: 'Огненный снаряд', ab: 'spell', dmg: '1к10', type: 'огонь', spell: true, note: '120 фт' }, { name: 'Кинжал', ab: 'dex', dmg: '1к4', type: 'колющий' }],
    features: ['Использование заклинаний (ИНТ), книга заклинаний', 'Ритуальный адепт', 'Магическое восстановление: часть ячеек после короткого отдыха'],
    bonus: [], reaction: ['Щит (если подготовлен)'], equip: ['Кинжал ×2', 'Боевой посох', 'Книга заклинаний', 'Набор учёного'], gold: 5,
    caster: { ab: 'int', label: 'Волшебник', cantrips: [3, ['Огненный снаряд', 'Луч холода', 'Свет', 'Волшебная рука', 'Малая иллюзия', 'Фокусы', 'Брызги кислоты']], spells: [4, ['Волшебная стрела', 'Щит', 'Магический доспех', 'Усыпление', 'Огненные ладони', 'Обнаружение магии', 'Поиск фамильяра', 'Туманное облако', 'Понимание языков']], slots: 2 } }
]

// ---------- Предыстории ----------
type Background = { name: string; skills: [SkillId, SkillId]; tool: string; feat: string; abs: [Ability, Ability, Ability]; story: string }
export const BACKGROUNDS: Background[] = [
  { name: 'Аколит', skills: ['insight', 'religion'], tool: 'Принадлежности каллиграфа', feat: 'Посвящённый в магию (жрец)', abs: ['int', 'wis', 'cha'], story: 'вырос при храме и служил там, пока знамение не позвало в дорогу' },
  { name: 'Ремесленник', skills: ['investigation', 'persuasion'], tool: 'Инструменты ремесленника', feat: 'Мастер на все руки', abs: ['str', 'dex', 'int'], story: 'учился в мастерской и знает цену хорошей работе' },
  { name: 'Шарлатан', skills: ['deception', 'sleight'], tool: 'Набор для фальсификации', feat: 'Умелый', abs: ['dex', 'con', 'cha'], story: 'продавал «эликсиры молодости» на ярмарках и однажды обманул не того' },
  { name: 'Преступник', skills: ['sleight', 'stealth'], tool: 'Воровские инструменты', feat: 'Бдительность', abs: ['dex', 'con', 'int'], story: 'жил в тенях портового квартала и задолжал гильдии' },
  { name: 'Артист', skills: ['acrobatics', 'performance'], tool: 'Музыкальный инструмент', feat: 'Музыкант', abs: ['str', 'dex', 'cha'], story: 'выступал с бродячей труппой, пока она не исчезла за одну ночь' },
  { name: 'Фермер', skills: ['animal', 'nature'], tool: 'Плотницкие инструменты', feat: 'Крепкий', abs: ['str', 'con', 'wis'], story: 'пахал землю у границы леса, пока с поля не начали пропадать люди' },
  { name: 'Стражник', skills: ['athletics', 'perception'], tool: 'Игровой набор', feat: 'Бдительность', abs: ['str', 'int', 'wis'], story: 'стоял на городских воротах и видел то, о чём приказали молчать' },
  { name: 'Проводник', skills: ['stealth', 'survival'], tool: 'Инструменты картографа', feat: 'Посвящённый в магию (друид)', abs: ['dex', 'con', 'wis'], story: 'водил караваны через перевалы и знает тропы, которых нет на картах' },
  { name: 'Отшельник', skills: ['medicine', 'religion'], tool: 'Набор травника', feat: 'Целитель', abs: ['con', 'wis', 'cha'], story: 'годами жил в уединении и вернулся к людям с тайной' },
  { name: 'Торговец', skills: ['animal', 'persuasion'], tool: 'Инструменты навигатора', feat: 'Везунчик', abs: ['con', 'int', 'cha'], story: 'торговал от побережья до гор и потерял весь товар в одну ночь' },
  { name: 'Дворянин', skills: ['history', 'persuasion'], tool: 'Игровой набор', feat: 'Умелый', abs: ['str', 'int', 'cha'], story: 'родился в знатной семье, но ушёл из дома, чтобы самому выбрать судьбу' },
  { name: 'Мудрец', skills: ['arcana', 'history'], tool: 'Принадлежности каллиграфа', feat: 'Посвящённый в магию (волшебник)', abs: ['con', 'int', 'wis'], story: 'переписывал древние свитки и нашёл в одном из них своё имя' },
  { name: 'Моряк', skills: ['acrobatics', 'perception'], tool: 'Инструменты навигатора', feat: 'Драчун', abs: ['str', 'dex', 'wis'], story: 'ходил на торговом корабле и пережил шторм, в котором выжил один' },
  { name: 'Писарь', skills: ['investigation', 'perception'], tool: 'Принадлежности каллиграфа', feat: 'Умелый', abs: ['dex', 'int', 'wis'], story: 'вёл записи в канцелярии и заметил подлог в важном договоре' },
  { name: 'Солдат', skills: ['athletics', 'intimidation'], tool: 'Игровой набор', feat: 'Дикая атака', abs: ['str', 'dex', 'con'], story: 'прошёл войну и до сих пор слышит барабаны по ночам' },
  { name: 'Странник', skills: ['insight', 'stealth'], tool: 'Воровские инструменты', feat: 'Везунчик', abs: ['dex', 'wis', 'cha'], story: 'вырос на улицах и привык полагаться только на себя' }
]

export const ALIGNMENTS = ['Законно-добрый', 'Нейтрально-добрый', 'Хаотично-добрый', 'Законно-нейтральный', 'Истинно нейтральный', 'Хаотично-нейтральный', 'Законно-злой', 'Нейтрально-злой', 'Хаотично-злой']
const ALIGN_WEIGHTS = [10, 14, 14, 8, 12, 12, 3, 3, 2]
const LANGS = ['Эльфийский', 'Дварфийский', 'Гномий', 'Полуросликов', 'Орочий', 'Великаний', 'Драконий', 'Инфернальный', 'Небесный', 'Сильван', 'Глубинная речь']
const HOOKS = [
  'Теперь ищет того, кто знает правду о пропавшей сестре.', 'Носит с собой карту, на которой отмечено место, которого не существует.',
  'Должен вернуть долг человеку, которого больше никто не видел.', 'Слышит во сне голос, зовущий на север.',
  'Поклялся защищать первого, кто спасёт ему жизнь, и этот день уже настал.', 'Ищет древний артефакт, о котором пела мать.',
  'Сбежал от прошлого, но прошлое идёт по следу.', 'Хочет стать героем баллад, пусть даже смешных.'
]
const TRAITS = ['любопытен до неосторожности', 'шутит в самый неподходящий момент', 'никогда не бросает своих', 'не доверяет магии', 'собирает странные безделушки', 'говорит мало, но по делу', 'верит в знаки судьбы', 'спорит со всеми, даже с богами']
const LOOKS = {
  age: ['юный', 'молодой', 'в расцвете сил', 'зрелый', 'седеющий'],
  eyes: ['янтарные', 'серые', 'изумрудные', 'тёмные', 'ледяные', 'разного цвета'],
  mark: ['шрам через бровь', 'татуировка на запястье', 'серьга с клыком', 'выжженный знак на ладони', 'вечная улыбка', 'плащ с заплатами', 'перо в волосах']
}
const UNCOMMON = ['Зелье лечения ×2 (2к4+2)', 'Плащ эльфов (преимущество на Скрытность)', 'Сапоги эльфов (бесшумный шаг)', 'Мешок хранения', 'Очки ночного видения', 'Кольцо прыжков']
const LEGEND_ITEMS = [
  { name: 'Плащ защиты: +1 к КД и спасброскам', ac: 1, saves: 1 },
  { name: 'Кольцо защиты: +1 к КД и спасброскам', ac: 1, saves: 1 },
  { name: 'Оружие +1 с золотой гравировкой', atk: 1 }
]

// ---------- Генерация ----------
export type Hero = {
  v: 1; seed: number; rarity: Rarity; d20: number
  name: string; look: string; story: string
  species: string; klass: string; background: string; alignment: string; level: 1; xp: string
  rolls: { ab: Ability; dice: number[]; base: number; bonus: number; score: number }[]
  scores: Record<Ability, number>; mods: Record<Ability, number>
  prof: number; ac: number; acNote: string; init: number; speed: number; altSpeed: string; hp: number; hd: string
  passive: number; inspiration: boolean
  saves: { ab: Ability; prof: boolean; val: number }[]
  skills: { id: string; name: string; ab: Ability; prof: boolean; expert: boolean; val: number }[]
  attacks: { name: string; bonus: string; dmg: string; note?: string }[]
  actions: { action: string[]; bonus: string[]; reaction: string[] }
  features: string[]; boons: string[]; effects: string[]
  proficiencies: string; languages: string[]; equipment: string[]; coins: { mm: number; sm: number; zm: number; pm: number }
  spell?: { ab: Ability; dc: number; atk: number; slots: number; cantrips: string[]; spells: string[]; label: string }
  role: string; total: number; pointBuy: number
}

const rnd = (n: number) => Math.floor(Math.random() * n)
const pick = <T>(a: readonly T[]) => a[rnd(a.length)]!
const pickN = <T>(a: readonly T[], n: number) => [...a].sort(() => Math.random() - 0.5).slice(0, n)
const weighted = <T>(a: readonly T[], w: number[]) => { let r = Math.random() * w.reduce((x, y) => x + y, 0); for (let i = 0; i < a.length; i++) { r -= w[i]!; if (r < 0) return a[i]! } return a[0]! }
export const modOf = (s: number) => Math.floor((s - 10) / 2)
export const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`)
const PB_COST: Record<number, number> = { 3: -9, 4: -6, 5: -4, 6: -3, 7: -1, 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9, 16: 12, 17: 15, 18: 19 }
export const pointBuyOf = (scores: number[]) => scores.reduce((s, v) => s + (PB_COST[v] ?? 0), 0)

/** 6 бросков 4d6 (минус меньший), сумма в коридоре редкости. Баланс: у обычного героя нет провалов ниже 6 и есть хотя бы 14. */
function rollSet(rarity: Rarity) {
  const band = { common: [66, 76], rare: [77, 82], legendary: [83, 92] }[rarity]
  for (let tries = 0; tries < 20000; tries++) {
    const set = Array.from({ length: 6 }, () => { const dice = [1, 2, 3, 4].map(() => 1 + rnd(6)); return { dice, base: dice.reduce((a, b) => a + b, 0) - Math.min(...dice) } })
    const vals = set.map((s) => s.base)
    const sum = vals.reduce((a, b) => a + b, 0)
    if (sum < band[0]! || sum > band[1]! || Math.min(...vals) < 6 || Math.max(...vals) < 14) continue
    if (rarity === 'legendary' && Math.max(...vals) < 17) continue
    return set
  }
  const fixed = { common: [15, 14, 13, 12, 10, 8], rare: [16, 15, 14, 12, 11, 9], legendary: [18, 16, 15, 13, 12, 10] }[rarity]
  return fixed.map((base) => ({ dice: [Math.min(6, base - 8), 4, 4, 1].map((d) => Math.max(1, d)), base }))
}

export function generateHero(d20: number): Hero {
  const rarity = rarityFromD20(d20)
  const klass = pick(CLASSES)
  const species = pick(SPECIES)
  // предыстория, подходящая классу: её характеристики пересекаются с главными для класса
  const prim = BACKGROUNDS.filter((b) => b.abs.includes(klass.order[0]!))
  const fits = prim.length ? prim : BACKGROUNDS.filter((b) => b.abs.includes(klass.order[1]!))
  const bg = pick(fits.length ? fits : BACKGROUNDS)

  // распределение: лучший бросок - в главную характеристику класса, дальше по порядку
  const set = rollSet(rarity).sort((a, b) => b.base - a.base)
  const scores = {} as Record<Ability, number>
  const rolls: Hero['rolls'] = []
  klass.order.forEach((ab, i) => { scores[ab] = set[i]!.base })
  // +2/+1 от предыстории (PHB 2024): +2 в самую нужную классу, +1 в следующую
  const ranked = [...bg.abs].sort((a, b) => klass.order.indexOf(a) - klass.order.indexOf(b))
  const bonus: Partial<Record<Ability, number>> = { [ranked[0]!]: 2, [ranked[1]!]: 1 }
  for (const a of ABILITIES) {
    const i = klass.order.indexOf(a.id)
    const b = bonus[a.id] ?? 0
    const score = Math.min(20, scores[a.id] + b)
    rolls.push({ ab: a.id, dice: set[i]!.dice, base: set[i]!.base, bonus: score - scores[a.id], score })
    scores[a.id] = score
  }
  const mods = Object.fromEntries(ABILITIES.map((a) => [a.id, modOf(scores[a.id])])) as Record<Ability, number>
  const prof = 2

  // предметы редкости
  const legend = rarity === 'legendary' ? pick(LEGEND_ITEMS) : null
  const rareItem = rarity === 'rare' ? pick(UNCOMMON) : null

  // навыки: предыстория + вид + класс (класс выбирает те, где выше характеристика)
  const prof_ = new Set<string>(bg.skills)
  if (species.skill && species.skill !== 'any') prof_.add(species.skill)
  const [n, list] = klass.skills
  const pool = (list === 'any' ? SKILLS.map((s) => s.id) : list).filter((s) => !prof_.has(s))
  const byScore = [...pool].sort((a, b) => mods[SKILLS.find((x) => x.id === b)!.ab] - mods[SKILLS.find((x) => x.id === a)!.ab] + (Math.random() - 0.5) * 1.5)
  byScore.slice(0, n).forEach((s) => prof_.add(s))
  if (species.skill === 'any') { const rest = SKILLS.filter((s) => !prof_.has(s.id)); prof_.add(pick(rest).id) }
  const expert = new Set<string>()
  if (klass.name === 'Плут') [...prof_].sort((a, b) => mods[SKILLS.find((x) => x.id === b)!.ab] - mods[SKILLS.find((x) => x.id === a)!.ab]).slice(0, 2).forEach((s) => expert.add(s))
  const skills = SKILLS.map((s) => ({ ...s, prof: prof_.has(s.id), expert: expert.has(s.id), val: mods[s.ab] + (prof_.has(s.id) ? prof : 0) + (expert.has(s.id) ? prof : 0) }))
  const saveBonus = legend?.saves ?? 0
  const saves = ABILITIES.map((a) => ({ ab: a.id, prof: klass.saves.includes(a.id), val: mods[a.id] + (klass.saves.includes(a.id) ? prof : 0) + saveBonus }))

  const acRes = klass.ac(mods)
  const tough = bg.feat === 'Крепкий' ? 2 : 0
  const hp = Math.max(1, klass.hd + mods.con + (species.hpPerLevel ?? 0) + tough)
  const alert = bg.feat === 'Бдительность'

  const caster = klass.caster
  const spell = caster ? { ab: caster.ab, label: caster.label, dc: 8 + prof + mods[caster.ab], atk: prof + mods[caster.ab], slots: caster.slots,
    cantrips: pickN(caster.cantrips[1].filter((c) => !klass.attacks.some((a) => a.name === c)), Math.max(0, caster.cantrips[0] - (klass.attacks.some((a) => a.spell) ? 1 : 0))).concat(klass.attacks.filter((a) => a.spell).map((a) => a.name)),
    spells: (klass.name === 'Следопыт' ? ['Метка охотника'] : []).concat(pickN(caster.spells[1].filter((s) => klass.name !== 'Следопыт' || s !== 'Метка охотника'), caster.spells[0] - (klass.name === 'Следопыт' ? 1 : 0))) } : undefined

  const atkPlus = legend?.atk ?? 0
  const attacks = klass.attacks.map((a, i) => {
    const m = a.ab === 'spell' ? mods[caster?.ab ?? 'cha'] : mods[a.ab]
    const extra = i === 0 && !a.spell ? atkPlus : 0
    const isSave = a.note?.startsWith('спасбросок')
    return { name: a.name + (extra ? ' +1' : ''), bonus: isSave ? `Сл ${8 + prof + m}` : fmt(prof + m + extra), dmg: `${a.dmg}${a.spell ? '' : fmt(m + extra)} ${a.type}`, note: a.note }
  })

  const nm = species.names
  const first = pick(Math.random() < 0.5 ? nm[0] : nm[1])
  const name = `${first} ${pick(nm[2])}`
  const langs = ['Общий', ...(species.lang ? [species.lang] : [])]
  while (langs.length < 3) { const l = pick(LANGS); if (!langs.includes(l)) langs.push(l) }
  if (klass.name === 'Друид') langs.push('Друидический')
  if (klass.name === 'Плут') langs.push('Воровской жаргон')

  const boons: string[] = []
  const effects: string[] = []
  if (rarity === 'legendary') { boons.push('Благословение судьбы: раз в день перебросить любой d20', legend!.name); effects.push('Отмечен судьбой: мастер знает, что вы особенный') }
  if (rarity === 'rare') boons.push(rareItem!)
  if (species.name === 'Человек' || rarity !== 'common') effects.push('Героическое вдохновение')

  const total = rolls.reduce((s, r) => s + r.base, 0)
  const hero: Hero = {
    v: 1, seed: Date.now(), rarity, d20, name,
    look: `${pick(LOOKS.age)} ${species.name.toLowerCase()}, ${pick(LOOKS.eyes)} глаза, ${pick(LOOKS.mark)}.`,
    story: `${first} ${bg.story}. По натуре ${pick(TRAITS)}. ${pick(HOOKS)}`,
    species: species.name, klass: klass.name, background: bg.name, alignment: weighted(ALIGNMENTS, ALIGN_WEIGHTS), level: 1, xp: '0 / 300',
    rolls, scores, mods, prof,
    ac: acRes.ac + (legend?.ac ?? 0), acNote: acRes.note + (legend?.ac ? ' + предмет защиты' : ''),
    init: mods.dex + (alert ? prof : 0), speed: species.speed, altSpeed: species.alt ?? '-', hp, hd: `1${klass.die}`,
    passive: 10 + skills.find((s) => s.id === 'perception')!.val, inspiration: effects.includes('Героическое вдохновение'),
    saves, skills, attacks,
    actions: {
      action: ['Атака', ...(spell ? ['Заклинание'] : []), 'Рывок', 'Отход', 'Уклонение', 'Помощь', 'Засада', 'Поиск', 'Использование предмета'],
      bonus: [...klass.bonus, ...(species.name === 'Орк' ? ['Прилив адреналина'] : [])],
      reaction: ['Атака при возможности', ...klass.reaction]
    },
    features: [...klass.features, ...species.traits, `Черта предыстории: ${bg.feat}`],
    boons, effects,
    proficiencies: `Доспехи: ${klass.armor}. Оружие: ${klass.weapons}. Инструменты: ${bg.tool}.`,
    languages: langs,
    equipment: [...klass.equip, ...(rareItem ? [rareItem] : []), ...(legend ? [legend.name] : []), 'Одежда путешественника'],
    coins: { mm: rnd(40), sm: rnd(20), zm: klass.gold + 8 + (rarity === 'rare' ? 25 : rarity === 'legendary' ? 100 : 0), pm: rarity === 'legendary' ? 1 + rnd(3) : 0 },
    spell, role: klass.role, total, pointBuy: pointBuyOf(rolls.map((r) => r.base))
  }
  return hero
}

/** Для статистики: распределение суммы 6×(4d6 минус меньший) - доля героев слабее данной суммы */
export function percentileOf(total: number, samples = 20000) {
  let below = 0
  for (let i = 0; i < samples; i++) {
    let s = 0
    for (let k = 0; k < 6; k++) { const d = [1, 2, 3, 4].map(() => 1 + rnd(6)); s += d.reduce((a, b) => a + b, 0) - Math.min(...d) }
    if (s < total) below++
  }
  return Math.round((below / samples) * 100)
}
export const abilityName = (a: Ability) => AB[a].name
export const abilityShort = (a: Ability) => AB[a].short

// Перегенерация «мягких» полей, которые игрок может менять (имя, внешность, предыстория)
export function randomName(speciesName: string) {
  const sp = SPECIES.find((s) => s.name === speciesName) ?? SPECIES[0]!
  return `${pick(Math.random() < 0.5 ? sp.names[0] : sp.names[1])} ${pick(sp.names[2])}`
}
export function randomLook(speciesName: string) {
  return `${pick(LOOKS.age)} ${speciesName.toLowerCase()}, ${pick(LOOKS.eyes)} глаза, ${pick(LOOKS.mark)}.`
}
export function randomStory(h: Pick<Hero, 'name' | 'background'>) {
  const bg = BACKGROUNDS.find((b) => b.name === h.background) ?? BACKGROUNDS[0]!
  return `${h.name.split(' ')[0]} ${bg.story}. По натуре ${pick(TRAITS)}. ${pick(HOOKS)}`
}
