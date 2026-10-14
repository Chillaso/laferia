import type { DocumentType } from '@/types/caseta'

export interface UploadedFile {
  s3Key: string
  fileName: string
  sizeBytes: number
}

const BUCKET = 'laferia-docs'
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Mock of the S3 upload. A real implementation would request a presigned URL
 * from the backend and PUT the file there; the returned key is what gets stored.
 */
export async function uploadDocument(
  file: File,
  type: DocumentType,
  casetaNumber: number,
): Promise<UploadedFile> {
  await delay(400 + Math.random() * 400)
  const safeName = file.name.replace(/[^\w.-]+/g, '_')
  return {
    s3Key: `s3://${BUCKET}/2027/${casetaNumber}/${type}-${crypto.randomUUID().slice(0, 8)}-${safeName}`,
    fileName: file.name,
    sizeBytes: file.size,
  }
}
