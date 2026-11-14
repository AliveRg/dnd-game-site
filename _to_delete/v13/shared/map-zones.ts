// Зоны карты миров (координаты в пикселях картинки /images/world-map-v2.webp, 1420×944).
// Карта собрана из двух генераций (docs/COMFYUI-MAP-PLAN.md). Новый сюжет → добавить его slug в stories нужной зоны.
export const MAP_W = 1420
export const MAP_H = 944
export interface MapZone { id: string; name: string; desc: string; stories: string[]; points: string; center: { x: number; y: number } }
export const MAP_ZONES: MapZone[] = [
  { id: 'citadel', name: 'Цитадель Времени', desc: 'Заснеженный хребет Гроссглокнер и цитадель, где застыло время.', stories: ['vysshaya-instanciya-poteryannye-vo-vremeni'], points: '140,30 250,8 420,0 560,10 625,55 600,110 470,150 330,150 240,135 150,95', center: { x: 378, y: 74 } },
  { id: 'asmodeus', name: 'Трон Асмодея', desc: 'Владения Церкви Асмодея - бога магии и контрактов.', stories: ['vysshaya-instanciya-mest-poluroslikov'], points: '10,180 60,130 130,95 210,120 255,190 240,260 160,300 70,290 15,245', center: { x: 128, y: 201 } },
  { id: 'gorodok', name: 'Городок у реки', desc: 'Тихий городок у реки, где все держатся друг за друга.', stories: ['gorodok'], points: '195,250 290,215 380,225 470,275 490,370 450,460 360,490 260,470 200,400 180,320', center: { x: 328, y: 348 } },
  { id: 'trava', name: 'Острова Высокой Травы', desc: 'Холмы, чайные домики и духи по соседству с людьми.', stories: ['istorii-vysokoy-travy'], points: '500,90 640,55 780,60 900,120 935,220 905,330 800,400 680,390 600,330 520,260 470,170', center: { x: 703, y: 220 } },
  { id: 'kashtan', name: 'Полуденное Королевство', desc: 'Осенние леса, старый замок и Сухая Лощина.', stories: ['kashtanische'], points: '700,420 800,385 890,420 935,520 925,610 860,640 760,620 700,540', center: { x: 821, y: 519 } },
  { id: 'steklo', name: 'Стеклянный купол', desc: 'Стеклянные комнаты, за которыми кто-то наблюдает.', stories: ['pod-steklom'], points: '735,640 800,600 880,615 915,680 880,740 800,750 740,710', center: { x: 821, y: 676 } },
  { id: 'chimera', name: 'Мёртвый лес', desc: 'Зимний лес, где встречаются убийца и жертва.', stories: ['himera'], points: '5,370 60,355 130,360 160,420 140,480 70,500 10,470', center: { x: 82, y: 422 } },
  { id: 'disco', name: 'Остров Разума', desc: 'Детектив без памяти и четыре голоса в его голове.', stories: ['smert-v-stile-disko'], points: '45,520 140,470 250,480 285,550 250,620 130,635 50,600', center: { x: 164, y: 554 } },
  { id: 'domik', name: 'Затопленная гавань', desc: 'Портовая таверна, наёмники и заказ на Лидера Ледоколов.', stories: ['domik-u-morya'], points: '15,690 110,660 230,680 300,760 260,850 140,880 40,820', center: { x: 156, y: 763 } },
  { id: 'candles', name: 'Озеро Десяти Свечей', desc: 'Мир без солнца. Свет - единственное оружие.', stories: ['desyat-svechey'], points: '375,840 450,800 560,805 640,850 620,930 470,944 380,915', center: { x: 499, y: 869 } },
  { id: 'nalyansk', name: 'Налянск-на-Язьве', desc: 'Карантинный город, НИИ и люди-насекомые.', stories: ['nalyansk-delo-7212'], points: '1020,400 1110,345 1250,340 1350,380 1360,450 1260,490 1110,490 1030,460', center: { x: 1186, y: 419 } },
  { id: 'bastion', name: 'Белая пустыня Омашу', desc: 'Неприступная крепость посреди смертельной пустыни.', stories: ['bastion'], points: '1060,80 1140,40 1230,45 1270,110 1260,220 1180,265 1090,250 1050,170', center: { x: 1160, y: 148 } },
  { id: 'goblins', name: 'Лагерь гоблинов', desc: 'Лагерь юных гоблинов, жаждущих мести.', stories: ['mest-goblinov'], points: '1100,640 1190,600 1290,610 1350,680 1330,770 1230,800 1120,770 1090,700', center: { x: 1212, y: 696 } }
]
export const zoneOfGame = (slug?: string | null) => MAP_ZONES.find((z) => slug && z.stories.includes(slug)) ?? null
