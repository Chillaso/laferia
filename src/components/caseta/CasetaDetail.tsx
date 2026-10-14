import type { ReactNode, Ref } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Clock, FileText, MousePointerClick } from 'lucide-react'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Card } from '@/components/ui/card'
import { Toldo } from '@/components/ui/toldo'
import { DOCUMENT_LABEL } from '@/lib/status'
import { cn, formatBytes, formatDate } from '@/lib/utils'
import type { Caseta, CasetaDocument } from '@/types/caseta'

const DOC_ICON = {
  approved: <CheckCircle2 className="size-[18px] text-status-approved" aria-hidden />,
  pending: <Clock className="size-[18px] text-status-pending" aria-hidden />,
  error: <AlertTriangle className="size-[18px] text-status-error" aria-hidden />,
}

const SECTION_TITLE = 'mb-2 text-[13px] font-semibold text-tinta-3'

export function CasetaDetail({ caseta, ref }: { caseta?: Caseta; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} tabIndex={-1} className="scroll-mt-28 outline-none" aria-live="polite">
      {caseta ? (
        caseta.status === 'free' ? (
          <FreeCaseta number={caseta.number} />
        ) : (
          <OccupiedCaseta caseta={caseta} />
        )
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-panel border border-dashed border-linea-fuerte px-6 py-12 text-center">
          <MousePointerClick className="size-6 text-tinta-4" aria-hidden />
          <p className="font-semibold text-tinta">Ninguna caseta seleccionada</p>
          <p className="max-w-sm text-sm text-tinta-3">
            Pulsa una caseta en el plano o búscala para ver su ficha y el estado de su documentación.
          </p>
        </div>
      )}
    </div>
  )
}

function FreeCaseta({ number }: { number: number }) {
  return (
    <div className="rise-in flex flex-wrap items-center gap-5 rounded-panel border border-dashed border-linea-fuerte bg-white px-6 py-6">
      <CasetaNumber number={number} muted />
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold text-tinta">Caseta libre</h2>
        <p className="text-sm text-tinta-3">No hay ninguna solicitud ni documentación registrada.</p>
      </div>
      <Link to="/" className={buttonClasses('secondary', 'md')}>
        Solicitar caseta
      </Link>
    </div>
  )
}

function OccupiedCaseta({ caseta }: { caseta: Caseta }) {
  return (
    <Card className="rise-in overflow-hidden">
      <Toldo />
      <div className="grid gap-x-6 gap-y-4 px-6 pt-5 pb-6 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
        <CasetaNumber number={caseta.number} />
        <div className="min-w-0">
          <h2 className="font-cartel text-[28px] leading-tight font-extrabold text-tinta">{caseta.name}</h2>
          <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <Meta label="CIF" value={<span className="tabular">{caseta.cif}</span>} />
            <Meta label="Tipo" value={caseta.traditional ? 'Tradicional' : 'No tradicional'} />
            {caseta.updatedAt && <Meta label="Actualizada" value={formatDate(caseta.updatedAt)} />}
          </dl>
        </div>
        <StatusBadge status={caseta.status} className="justify-self-start px-3 py-1 text-[13px]" />
      </div>

      <div className="grid gap-8 border-t border-linea px-6 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="min-w-0">
          <h3 className={SECTION_TITLE}>Descripción</h3>
          <p className="max-w-prose leading-relaxed text-tinta-2">{caseta.description}</p>
          {caseta.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Etiquetas">
              {caseta.tags.map((tag) => (
                <li key={tag}>
                  <Badge className="bg-cal-hondo font-medium text-tinta-2">{tag}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="min-w-0">
          <h3 className={SECTION_TITLE}>Expediente</h3>
          <ul className="divide-y divide-linea rounded-panel border border-linea">
            {caseta.documents.map((doc) => (
              <DocumentRow key={doc.type} doc={doc} />
            ))}
          </ul>
        </section>
      </div>
    </Card>
  )
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex gap-1.5">
      <dt className="text-tinta-3">{label}</dt>
      <dd className="font-medium text-tinta">{value}</dd>
    </div>
  )
}

/** Painted plot number, like the ones on the front of each caseta. */
function CasetaNumber({ number, muted }: { number: number; muted?: boolean }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-[11px] font-semibold text-tinta-3">Caseta</span>
      <span
        className={cn(
          'font-cartel tabular text-5xl leading-[0.9] font-extrabold',
          muted ? 'text-tinta-4' : 'text-anil-700',
        )}
      >
        {number}
      </span>
    </div>
  )
}

function DocumentRow({ doc }: { doc: CasetaDocument }) {
  return (
    <li className="p-3.5">
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 size-[18px] shrink-0 text-tinta-4" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-tinta">{DOCUMENT_LABEL[doc.type]}</p>
          <p className="truncate text-[13px] text-tinta-3" title={doc.s3Key}>
            {doc.fileName}
          </p>
          <p className="tabular text-[13px] text-tinta-3">
            {formatBytes(doc.sizeBytes)}, subido el {formatDate(doc.uploadedAt)}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="sm:hidden">{DOC_ICON[doc.status]}</span>
          <StatusBadge status={doc.status} className="hidden sm:inline-flex" />
        </span>
      </div>
      {doc.reviewNotes && (
        <p className="mt-2.5 ml-[30px] rounded-control bg-status-error/8 px-3 py-2 text-[13px] leading-snug text-[#a8261f]">
          {doc.reviewNotes}
        </p>
      )}
    </li>
  )
}
