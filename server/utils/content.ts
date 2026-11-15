import { createError } from 'h3'
const POST_TYPES = ['game','news','article','novelty','reference']
export function validatePost(b: any) {
  if (!b || !POST_TYPES.includes(b.type)) throw createError({statusCode:400,message:'Некорректный тип материала'})
  for (const [key,max] of Object.entries({title:250,excerpt:2000,body:100000,seo_title:250,seo_description:1000})) {
    if (b[key] !== undefined && b[key] !== null && (typeof b[key] !== 'string' || b[key].length>max)) throw createError({statusCode:400,message:`Проверьте ${key}`})
  }
  if (!b.title?.trim()) throw createError({statusCode:400,message:'Нужен заголовок'})
  if (b.slug !== undefined && typeof b.slug !== 'string') throw createError({statusCode:400,message:'Некорректный адрес'})
  const slug = slugify(b.slug || b.title)
  if (!slug) throw createError({statusCode:400,message:'Нужен адрес материала'})
  if (b.published !== undefined && typeof b.published !== 'boolean') throw createError({statusCode:400,message:'Некорректный статус публикации'})
  if (b.cover && !isMediaUrl(b.cover)) throw createError({statusCode:400,message:'Выберите изображение из библиотеки'})
  const meta = validatePostMeta(b.meta ?? {})
  // Client renders bodies as escaped text, not arbitrary HTML.
  return {...b,slug,meta,published:b.published === true}
}
export function isMediaUrl(value: unknown): value is string {
  return typeof value === 'string' && /^\/(media|images)\/[a-zA-Z0-9_./%-]+$/.test(value) && !value.includes('..')
}
export function validateSiteContent(section: unknown, content: any) {
  if (!['home','club','information','contacts'].includes(String(section)) || !content || typeof content !== 'object' || Array.isArray(content)) throw createError({statusCode:400,message:'Неизвестный раздел'})
  const out: Record<string,unknown> = {}
  for (const [key,max] of Object.entries({title:250,text:20000,phone:30,address:500})) {
    if (content[key] !== undefined) {
      if (typeof content[key] !== 'string' || content[key].length>max) throw createError({statusCode:400,message:`Проверьте ${key}`})
      out[key]=content[key].trim()
    }
  }
  if (content.images !== undefined) out.images = validateImageList(content.images)

  return out
}
export function invalidateContent() { dropDbCache(); }

export function validateImageList(value: unknown): {url:string;alt:string}[] {
  if (!Array.isArray(value) || value.length > 30) throw createError({statusCode:400,message:'Не больше 30 фотографий'})
  return value.map((image:any)=>{
    if (!image || typeof image !== 'object' || !isMediaUrl(image.url) || typeof image.alt !== 'string' || image.alt.length > 300) throw createError({statusCode:400,message:'Проверьте фотографию и подпись'})
    return {url:image.url,alt:image.alt}
  })
}

export function validatePostMeta(value: unknown): Record<string,any> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || JSON.stringify(value).length > 30000) throw createError({statusCode:400,message:'Некорректные метаданные'})
  const meta = {...value} as Record<string,any>
  const invalid=(key:string)=>{throw createError({statusCode:400,message:`Проверьте параметр ${key}`})}
  for(const [key,max] of Object.entries({coverAlt:300,category:120,sources:6000,system:300,players:50,level:100,kind:100,series:300,duration:100,source:1000})) {
    if(meta[key] !== undefined && (typeof meta[key] !== 'string'||meta[key].length > max)) invalid(key)
  }
  if(meta.edition !== undefined && !['2014','2024','2014 и 2024 — сравнение','Общие советы'].includes(meta.edition)) invalid('edition')
  if(meta.genres !== undefined && (!Array.isArray(meta.genres)||meta.genres.length>20||meta.genres.some((genre:unknown)=>typeof genre!=='string'||genre.length>100))) invalid('genres')
  if(meta.gallery !== undefined) meta.gallery=validateImageList(meta.gallery)
  if(meta.adult !== undefined && typeof meta.adult !== 'boolean') invalid('adult')
  if(meta.price !== undefined && (typeof meta.price !== 'number'||!Number.isInteger(meta.price)||meta.price<0||meta.price>1000000)) invalid('price')
  if(meta.accent !== undefined && (typeof meta.accent!=='string'||!/^#[a-f0-9]{6}$/i.test(meta.accent))) invalid('accent')
  if(meta.map !== undefined && (!meta.map||typeof meta.map!=='object'||Array.isArray(meta.map)||!Number.isFinite(meta.map.x)||!Number.isFinite(meta.map.y)||meta.map.x<0||meta.map.x>2000||meta.map.y<0||meta.map.y>1400)) invalid('map')
  if(meta.fogMap !== undefined && !isMediaUrl(meta.fogMap)) invalid('fogMap')
  return meta
}
