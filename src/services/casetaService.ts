import mockCasetas from '@/data/casetas.mock.json'
import { normalizeCif } from '@/lib/cif'
import { normalize } from '@/lib/utils'
import type { Caseta, CasetaSubmission, SubmissionResult } from '@/types/caseta'
import { uploadDocument } from './storageService'

/** Contract the UI depends on. Swap the mock for an HTTP implementation later. */
export interface CasetaRepository {
  list(): Promise<Caseta[]>
  getByNumber(number: number): Promise<Caseta | undefined>
  search(query: string): Promise<Caseta[]>
  submit(submission: CasetaSubmission): Promise<SubmissionResult>
}

const STORAGE_KEY = 'laferia:submissions'
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function readSubmissions(): Caseta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Caseta[]) : []
  } catch {
    return []
  }
}

function writeSubmissions(casetas: Caseta[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(casetas))
  } catch {
    // Storage unavailable (private mode, quota): the submission lives in memory only.
  }
}

export function matchesQuery(caseta: Caseta, query: string) {
  const q = normalize(query)
  if (!q) return false
  if (/^\d+$/.test(q)) return String(caseta.number).startsWith(q)
  const cifQuery = normalizeCif(query)
  return (
    (caseta.name !== undefined && normalize(caseta.name).includes(q)) ||
    (caseta.cif !== undefined && cifQuery.length >= 2 && caseta.cif.includes(cifQuery))
  )
}

class MockCasetaRepository implements CasetaRepository {
  private submissions = readSubmissions()

  private snapshot(): Caseta[] {
    const byNumber = new Map((mockCasetas as Caseta[]).map((c) => [c.number, c]))
    for (const submitted of this.submissions) byNumber.set(submitted.number, submitted)
    return [...byNumber.values()].sort((a, b) => a.number - b.number)
  }

  async list() {
    await delay(250)
    return this.snapshot()
  }

  async getByNumber(number: number) {
    await delay(100)
    return this.snapshot().find((c) => c.number === number)
  }

  async search(query: string) {
    return this.snapshot().filter((c) => matchesQuery(c, query))
  }

  async submit(submission: CasetaSubmission): Promise<SubmissionResult> {
    const all = this.snapshot()
    const cif = normalizeCif(submission.cif)
    if (all.some((c) => c.cif === cif)) {
      throw new Error('Ya existe una solicitud registrada con este CIF.')
    }
    const free = all.find((c) => c.status === 'free')
    if (!free) throw new Error('No quedan casetas libres para asignar.')

    const [estatutos, memoria] = await Promise.all([
      uploadDocument(submission.estatutos, 'estatutos', free.number),
      uploadDocument(submission.memoria, 'memoria', free.number),
    ])
    const now = new Date().toISOString()
    const caseta: Caseta = {
      number: free.number,
      name: submission.name.trim(),
      cif,
      description: submission.description.trim(),
      traditional: submission.traditional,
      tags: submission.traditional ? ['tradicional'] : [],
      status: 'pending',
      updatedAt: now,
      documents: [
        { type: 'estatutos', ...estatutos, uploadedAt: now, status: 'pending' },
        { type: 'memoria', ...memoria, uploadedAt: now, status: 'pending' },
      ],
    }
    this.submissions = [...this.submissions, caseta]
    writeSubmissions(this.submissions)
    return { reference: `FC27-${String(caseta.number).padStart(3, '0')}-${cif.slice(-4)}`, caseta }
  }
}

export const casetaRepository: CasetaRepository = new MockCasetaRepository()
