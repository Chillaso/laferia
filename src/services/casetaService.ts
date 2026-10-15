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

/**
 * Relevance of a caseta for a query, or 0 when it doesn't match.
 * Numbers match by prefix ("1" → 1, 10…19, 100…), names by every word
 * ("pena real" → "Peña El Real"), CIFs by substring.
 */
function scoreMatch(caseta: Caseta, query: string) {
  const q = normalize(query)
  if (!q) return 0
  if (/^\d+$/.test(q)) {
    const number = String(Number(q)) // "007" → "7"
    const own = String(caseta.number)
    if (own === number) return 3
    return own.startsWith(number) ? 1 : 0
  }
  const cifQuery = normalizeCif(query)
  if (caseta.cif && cifQuery.length >= 2 && caseta.cif.includes(cifQuery)) return caseta.cif === cifQuery ? 3 : 2
  if (!caseta.name) return 0
  const name = normalize(caseta.name)
  const words = q.split(/\s+/)
  if (!words.every((w) => name.includes(w))) return 0
  return name.startsWith(q) || name.split(/\s+/).some((w) => w.startsWith(words[0])) ? 2 : 1
}

/** Matching casetas, best matches first, then by number. */
export function searchCasetas(casetas: Caseta[], query: string) {
  return casetas
    .map((caseta) => ({ caseta, score: scoreMatch(caseta, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.caseta.number - b.caseta.number)
    .map((r) => r.caseta)
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
    return searchCasetas(this.snapshot(), query)
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
