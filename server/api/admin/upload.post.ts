import {randomUUID} from 'node:crypto'
import {inspectImage} from '../../utils/image'
export default defineEventHandler(async(event)=>{
  await requireAdmin(event)
  const form=await readMultipartFormData(event)
  const file=form?.find(f=>f.name==='file')
  if(!file?.data)throw createError({statusCode:400,message:'Выберите изображение'})
  let image:ReturnType<typeof inspectImage>
  try {image=inspectImage(file.data)} catch(e) {throw createError({statusCode:400,message:(e as Error).message})}
  const key=`uploads/${new Date().toISOString().slice(0,7).replace('-','/')}/${randomUUID()}.${image.ext}`
  try {
    await s3Put(key,file.data,image.type)
    await useDb().query('INSERT INTO media_assets(key,mime,width,height) VALUES($1,$2,$3,$4)',[key,image.type,image.width,image.height])
  } catch {throw createError({statusCode:503,message:'Не удалось сохранить изображение. Попробуйте позже'})}
  return {key,url:`/media/${key}`,width:image.width,height:image.height}
})
