# Ассеты для ветки дизайна

В `public/test-assets` подготовлены 49 PNG и 2 GLB-модели из отдельной задачи по ассетам. Они доступны в `design/rogovik`. Файлы переданы в исходном виде. Подключение к компонентам выполняется отдельной дизайнерской задачей.

| Каталог или имя | Содержимое |
|---|---|
| `png/story-*.png` | 13 изображений сюжетов и миров |
| `png/tier-*.png` | 3 изображения тарифов |
| `png/decor-*.png` | 9 декоративных предметов |
| `png/ui-*.png` | 15 значков интерфейса, характеристик, монет и соцсетей |
| `png/corner*.png` | Уголок и 4 варианта прогрессии |
| `png/card-back.png` | Рубашка карточки |
| `png/dice-d20-walnut.png` | Изображение d20 |
| `png/favicon.png`, `png/logo-skull.png` | Значок и логотип |
| `models/coin-bronze.glb`, `models/dice-d20.glb` | Две модели для 3D-компонентов |

Nuxt отдаёт содержимое public от корня сайта. Примеры адресов — `/test-assets/png/story-gorodok.png` и `/test-assets/models/dice-d20.glb`.

Для Claude Code и модели-исполнителя. Сначала прочитайте `docs/COLLABORATION.md`, затем просмотрите нужные изображения и компоненты. Используйте подготовленные файлы при выполнении согласованной задачи дизайнера. При подключении учитывайте размер изображения, пропорции и доступность на мобильном экране. Сохраняйте исходные файлы для дальнейшей обработки. В коммит готового компонента включайте все использованные ассеты или перечисляйте зависимый коммит с ними. Владелец переносит выбранную доработку в main через отдельную ветку и PR.

## Полный перечень

- `models/coin-bronze.glb`
- `models/dice-d20.glb`
- `png/card-back.png`
- `png/corner-progression-1.png`
- `png/corner-progression-2.png`
- `png/corner-progression-3.png`
- `png/corner-progression-4.png`
- `png/corner.png`
- `png/decor-book.png`
- `png/decor-candle.png`
- `png/decor-dice.png`
- `png/decor-goblet.png`
- `png/decor-key.png`
- `png/decor-nails.png`
- `png/decor-potion.png`
- `png/decor-scroll.png`
- `png/decor-skull.png`
- `png/dice-d20-walnut.png`
- `png/favicon.png`
- `png/logo-skull.png`
- `png/story-asmodeus.png`
- `png/story-bastion.png`
- `png/story-candles.png`
- `png/story-chimera.png`
- `png/story-citadel.png`
- `png/story-disco.png`
- `png/story-domik.png`
- `png/story-goblins.png`
- `png/story-gorodok.png`
- `png/story-kashtan.png`
- `png/story-nalyansk.png`
- `png/story-steklo.png`
- `png/story-trava.png`
- `png/tier-common.png`
- `png/tier-legendary.png`
- `png/tier-rare.png`
- `png/ui-ac.png`
- `png/ui-calendar.png`
- `png/ui-coin-copper.png`
- `png/ui-coin-gold.png`
- `png/ui-coin-platinum.png`
- `png/ui-coin-silver.png`
- `png/ui-hp.png`
- `png/ui-initiative.png`
- `png/ui-inspiration.png`
- `png/ui-level.png`
- `png/ui-location.png`
- `png/ui-players.png`
- `png/ui-speed.png`
- `png/ui-telegram.png`
- `png/ui-vk.png`
