// One-off generator for src/data/casetas.mock.json (deterministic, seeded).
// Run with: node scripts/generate-mock.mjs
import { writeFileSync } from 'node:fs'

const TOTAL = 175
let seed = 20260502
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const sample = (arr, n) => [...arr].sort(() => rand() - 0.5).slice(0, n)

const PREFIXES = ['Peña', 'Peña Flamenca', 'Hermandad de', 'Asociación', 'Club', 'Tertulia', 'Círculo', 'Cofradía de', 'Peña Caballista', 'Asociación Cultural']
const NAMES = [
  'El Albero', 'Los Cabales', 'La Bulería', 'Tío José de Paula', 'El Garbanzo', 'La Buena Gente', 'Los Arcos',
  'El Lebrillo', 'La Solera', 'El Mosto', 'Los Amigos del Caballo', 'San Dionisio', 'La Plazuela', 'Santiago',
  'El Pañuelo', 'La Guitarra', 'El Fino', 'Los Faroles', 'El Duende', 'La Cartuja', 'El Alcázar', 'San Miguel',
  'La Merced', 'El Rocío', 'Los Romeros', 'El Compás', 'La Yeguada', 'El Picadero', 'Los Jinetes', 'El Catavino',
  'La Venencia', 'El Tabanco', 'La Peineta', 'El Sombrero Cordobés', 'Los Volantes', 'El Palo Cortado', 'La Manzanilla',
  'El Amontillado', 'La Copla', 'El Cante Jondo', 'La Soleá', 'Los Tientos', 'El Arte', 'La Alegría', 'El Real',
  'La Campiña', 'El Polo', 'La Doma', 'El Enganche', 'Los Cascabeles', 'La Calesa', 'El Mantoncillo', 'La Jaca',
  'Los Novilleros', 'El Pescaíto', 'La Rebujina', 'El Clavel', 'La Gitanería', 'Los Bodegueros', 'El Barrio Alto',
  'La Asunción', 'San Pedro', 'Santo Domingo', 'La Platería', 'El Retiro', 'La Alameda', 'El Ejido', 'Los Naranjos',
  'La Albariza', 'El Viñedo', 'Los Toneles', 'La Bota', 'El Arenal', 'La Zambomba', 'El Templete', 'La Tribuna',
  'Los Universitarios', 'Las Angustias', 'El Calvario', 'San Telmo', 'La Granja', 'Los Hermanos Moneo', 'El Chato',
  'Los del Puerto', 'El Lagar', 'La Cancela', 'Los Duendes', 'La Farola', 'El Pozo', 'La Sacristía', 'El Mirador',
  'La Fragua', 'El Tablao', 'Las Marismas', 'Los Pinsapos', 'El Guadalete', 'La Atalaya', 'El Olivar', 'Los Majuelos',
  'La Serranía', 'El Patio', 'Los Moriscos', 'La Taberna', 'El Ruedo', 'La Montera', 'El Cortijo', 'La Hacienda',
  'El Vino Fino', 'La Feria Chica', 'Los Cartujanos', 'La Barquilla', 'El Gallo', 'La Pirula', 'Los Corrales',
  'El Sevillano', 'La Pandereta', 'Los Palmeros',
]
const TAGS = ['familiar', 'pública', 'privada', 'flamenco', 'sevillanas', 'tradicional', 'gastronomía', 'música en directo', 'cocina andaluza', 'infantil', 'accesible', 'peña', 'hermandad', 'baile', 'vinos de Jerez', 'mariscos']
const DESCRIPTIONS = [
  'Caseta familiar con cocina tradicional andaluza y ambiente flamenco hasta la madrugada.',
  'Punto de encuentro de socios y amigos con actuaciones de cante y baile en directo.',
  'Caseta pública abierta a todos los visitantes, con zona infantil y menú del día.',
  'Espacio dedicado al mundo del caballo con exhibiciones y tertulias ecuestres.',
  'Ambiente joven con sevillanas, rumba y una carta de vinos del Marco de Jerez.',
  'Caseta de hermandad con decoración clásica de farolillos y mantones.',
  'Cocina de la tierra: pescaíto frito, tortillitas de camarones y rebujito.',
]
const ERROR_NOTES = {
  estatutos: ['Falta la firma del secretario en la última página.', 'Los estatutos no están visados por el registro de asociaciones.', 'Documento ilegible en las páginas 3 y 4.'],
  memoria: ['La memoria no incluye el plano de distribución interior.', 'Falta el presupuesto de montaje y la póliza de responsabilidad civil.', 'No se indica el aforo máximo previsto.'],
}

const cifControl = (digits) => {
  let sum = 0
  for (let i = 0; i < 7; i++) {
    const n = Number(digits[i])
    if (i % 2 === 0) { const d = n * 2; sum += Math.floor(d / 10) + (d % 10) } else sum += n
  }
  const digit = (10 - (sum % 10)) % 10
  return { digit: String(digit), letter: 'JABCDEFGHI'[digit] }
}
const makeCif = (type) => {
  const digits = Array.from({ length: 7 }, () => Math.floor(rand() * 10)).join('')
  const c = cifControl(digits)
  return type + digits + ('RQ'.includes(type) ? c.letter : c.digit)
}
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const isoDate = (day, hour) => new Date(Date.UTC(2026, 2, day, hour, Math.floor(rand() * 60))).toISOString()

const statusPool = () => {
  const r = rand()
  if (r < 0.28) return 'free'
  if (r < 0.43) return 'error'
  if (r < 0.66) return 'pending'
  return 'approved'
}

const usedNames = new Set()
const casetas = []
for (let number = 1; number <= TOTAL; number++) {
  const status = statusPool()
  if (status === 'free') { casetas.push({ number, tags: [], status, documents: [] }); continue }

  let name
  do { name = `${pick(PREFIXES)} ${pick(NAMES)}` } while (usedNames.has(name))
  usedNames.add(name)
  const isHermandad = name.startsWith('Hermandad') || name.startsWith('Cofradía')
  const cif = makeCif(isHermandad ? 'R' : 'G')
  const traditional = rand() < 0.55
  const tags = sample(TAGS.filter((t) => t !== 'tradicional'), 2 + Math.floor(rand() * 3))
  if (traditional && !tags.includes('tradicional')) tags.unshift('tradicional')

  const day = 1 + Math.floor(rand() * 28)
  const documents = ['estatutos', 'memoria'].map((type) => {
    let docStatus = status
    if (status === 'error' && type === 'memoria' && rand() < 0.5) docStatus = 'approved'
    if (status === 'pending' && rand() < 0.25) docStatus = 'approved'
    const fileName = `${type}-${slug(name)}.pdf`
    return {
      type,
      fileName,
      s3Key: `s3://laferia-docs/2027/${number}/${fileName}`,
      sizeBytes: 150_000 + Math.floor(rand() * 2_400_000),
      uploadedAt: isoDate(day, 9 + Math.floor(rand() * 9)),
      status: docStatus,
      ...(docStatus === 'error' ? { reviewNotes: pick(ERROR_NOTES[type]) } : {}),
    }
  })
  // An "error" caseta must have at least one failing document.
  if (status === 'error' && !documents.some((d) => d.status === 'error')) {
    documents[0].status = 'error'
    documents[0].reviewNotes = pick(ERROR_NOTES.estatutos)
  }

  casetas.push({
    number, name, cif, description: pick(DESCRIPTIONS), traditional, tags, status, documents,
    updatedAt: isoDate(Math.min(day + 3, 31), 12),
  })
}

writeFileSync(new URL('../src/data/casetas.mock.json', import.meta.url), JSON.stringify(casetas, null, 2) + '\n')
const counts = casetas.reduce((acc, c) => ({ ...acc, [c.status]: (acc[c.status] ?? 0) + 1 }), {})
console.log('Generated', casetas.length, 'casetas', counts)
