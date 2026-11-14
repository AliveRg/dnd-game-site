// Загрузка картинки в S3. Возвращает URL вида /media/uploads/2026/11/xxx.webp
const ALLOWED: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif' }

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const form = await readMultipartFormData(event)
  const file = form?.find((f) => f.name === 'file')
  if (!file?.data || !file.type || !ALLOWED[file.type]) throw createError({ statusCode: 400, message: 'Нужна картинка jpg/png/webp/avif' })
  if (file.data.length > 8 * 1024 * 1024) throw createError({ statusCode: 413, message: 'Файл больше 8 МБ' })
  const d = new Date()
  const key = `uploads/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ALLOWED[file.type]}`
  await s3Put(key, file.data, file.type)
  return { key, url: `/media/${key}` }
})
