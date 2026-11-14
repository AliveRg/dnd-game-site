// Отдаёт картинки из приватного S3-бакета через наш домен: /media/uploads/xxx.webp
export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key || key.includes('..')) throw createError({ statusCode: 400 })
  try {
    const obj = await s3Get(key)
    setHeader(event, 'Content-Type', obj.ContentType || 'application/octet-stream')
    setHeader(event, 'Cache-Control', 'public, max-age=2592000')
    if (obj.ContentLength) setHeader(event, 'Content-Length', obj.ContentLength)
    return sendStream(event, obj.Body as any)
  } catch {
    throw createError({ statusCode: 404, message: 'Файл не найден' })
  }
})
