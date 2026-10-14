export type DocStatus = 'free' | 'error' | 'pending' | 'approved'

export type DocumentType = 'estatutos' | 'memoria'

export interface CasetaDocument {
  type: DocumentType
  fileName: string
  s3Key: string
  sizeBytes: number
  uploadedAt: string
  status: Exclude<DocStatus, 'free'>
  reviewNotes?: string
}

export interface Caseta {
  number: number
  name?: string
  cif?: string
  description?: string
  traditional?: boolean
  tags: string[]
  status: DocStatus
  documents: CasetaDocument[]
  updatedAt?: string
}

export interface CasetaSubmission {
  name: string
  cif: string
  description: string
  traditional: boolean
  estatutos: File
  memoria: File
}

export interface SubmissionResult {
  reference: string
  caseta: Caseta
}
