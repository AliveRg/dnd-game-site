import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

let client: S3Client | null = null

export function useS3() {
  const c = useRuntimeConfig()
  if (!c.s3Bucket || !c.s3AccessKey) {
    throw createError({ statusCode: 503, message: 'S3 не настроен' })
  }
  if (!client) {
    client = new S3Client({
      endpoint: c.s3Endpoint,
      region: c.s3Region,
      forcePathStyle: true,
      credentials: { accessKeyId: c.s3AccessKey, secretAccessKey: c.s3SecretKey }
    })
  }
  return { client, bucket: c.s3Bucket as string }
}

export async function s3Put(key: string, body: Buffer, contentType: string) {
  const { client, bucket } = useS3()
  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType, CacheControl: 'public, max-age=31536000' })
  )
  return key
}

export async function s3Get(key: string) {
  const { client, bucket } = useS3()
  return client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
}
