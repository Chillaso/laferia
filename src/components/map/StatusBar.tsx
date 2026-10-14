import { Check } from 'lucide-react'
import { STATUS_META, STATUS_ORDER } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { DocStatus } from '@/types/caseta'

interface StatusBarProps {
  counts: Record<DocStatus, number>
  active: Set<DocStatus>
  onToggle: (status: DocStatus) => void
}

/**
 * The 175 plots of the Real as one proportional strip: how far along the fair is
 * at a glance. The legend below doubles as the status filter.
 */
export function StatusBar({ counts, active, onToggle }: StatusBarProps) {
  const total = STATUS_ORDER.reduce((sum, s) => sum + counts[s], 0)
  const withRequest = total - counts.free

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-bold text-tinta">Estado de la documentación</h2>
        <p className="tabular text-[13px] text-tinta-3">
          <span className="font-semibold text-tinta">{withRequest}</span> de {total} casetas con solicitud
        </p>
      </div>

      <div className="mt-2.5 flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden>
        {STATUS_ORDER.map((status) => (
          <div
            key={status}
            onClick={() => onToggle(status)}
            className={cn(
              'h-full cursor-pointer transition-opacity duration-200 first:rounded-l-full last:rounded-r-full',
              active.size > 0 && !active.has(status) && 'opacity-25',
            )}
            style={{ flexGrow: counts[status], flexBasis: 0, background: STATUS_META[status].color }}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status]
          const pressed = active.has(status)
          return (
            <button
              key={status}
              type="button"
              aria-pressed={pressed}
              onClick={() => onToggle(status)}
              className={cn(
                'flex h-9 items-center gap-2 rounded-full border pr-3 pl-2.5 text-sm transition-[background-color,border-color,opacity] duration-150 active:scale-[0.97]',
                pressed
                  ? 'border-tinta bg-tinta text-white'
                  : 'border-linea bg-white text-tinta-2 hover:border-linea-fuerte hover:text-tinta',
                active.size > 0 && !pressed && 'opacity-60 hover:opacity-100',
              )}
            >
              {pressed ? (
                <Check className="size-3.5" strokeWidth={3} aria-hidden />
              ) : (
                <span className="size-2.5 rounded-full" style={{ background: meta.color }} aria-hidden />
              )}
              {meta.label}
              <span className={cn('tabular font-bold', pressed ? 'text-white' : 'text-tinta')}>{counts[status]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
