import { useState, type KeyboardEvent } from 'react'
import { CASETA_SHAPES, MAP_HEIGHT, MAP_WIDTH, type CasetaShape } from '@/data/mapLayout'
import { STATUS_META } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { Caseta } from '@/types/caseta'

interface FeriaMapProps {
  casetas: Map<number, Caseta>
  selected?: number
  /** When set, casetas outside it are dimmed. */
  highlighted?: Set<number>
  onSelect: (number: number) => void
  debug?: boolean
}

export function FeriaMap({ casetas, selected, highlighted, onSelect, debug }: FeriaMapProps) {
  const [hovered, setHovered] = useState<CasetaShape>()
  const hoveredCaseta = hovered && casetas.get(hovered.number)
  // Shapes near the top edge show their tooltip underneath so it isn't clipped.
  const tooltipBelow = hovered !== undefined && hovered.y < 130

  const handleKey = (event: KeyboardEvent, number: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(number)
    }
  }

  return (
    <div className="overflow-x-auto rounded-sheet bg-albero-claro p-1.5 shadow-[inset_0_0_0_1px_rgb(217_166_70/0.35)] sm:p-2.5">
      <div
        className="relative min-w-[720px] rounded-[10px] shadow-[0_0_0_1px_rgb(0_0_0/0.1)]"
        style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
      >
        <img
          src={`${import.meta.env.BASE_URL}feria-map.webp`}
          alt="Plano del Real de la Feria del Caballo de Jerez"
          className="absolute inset-0 size-full rounded-[10px] select-none"
          draggable={false}
        />
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="absolute inset-0 size-full"
          role="group"
          aria-label="Casetas por estado de documentación"
        >
          {CASETA_SHAPES.map((shape) => {
            const caseta = casetas.get(shape.number)
            const status = caseta?.status ?? 'free'
            const color = STATUS_META[status].color
            const isSelected = selected === shape.number
            const dimmed = highlighted !== undefined && !highlighted.has(shape.number) && !isSelected
            const cx = shape.x + shape.width / 2
            const cy = shape.y + shape.height / 2
            return (
              <g
                key={shape.number}
                role="button"
                tabIndex={0}
                aria-label={`Caseta ${shape.number}${caseta?.name ? `, ${caseta.name}` : ''}: ${STATUS_META[status].label}`}
                aria-pressed={isSelected}
                className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-anil-800 [&:focus-visible>rect]:stroke-[3px]"
                transform={shape.rotate ? `rotate(${shape.rotate} ${cx} ${cy})` : undefined}
                onClick={() => onSelect(shape.number)}
                onKeyDown={(e) => handleKey(e, shape.number)}
                onMouseEnter={() => setHovered(shape)}
                onMouseLeave={() => setHovered(undefined)}
                onFocus={() => setHovered(shape)}
                onBlur={() => setHovered(undefined)}
                style={{ opacity: dimmed ? 0.16 : 1, transition: 'opacity 200ms cubic-bezier(0.23, 1, 0.32, 1)' }}
              >
                <rect
                  x={shape.x + 1}
                  y={shape.y + 1}
                  width={shape.width - 2}
                  height={shape.height - 2}
                  rx={shape.radius ?? 2}
                  fill={color}
                  fillOpacity={debug ? 0.25 : hovered?.number === shape.number ? 1 : 0.9}
                  stroke={isSelected ? 'var(--color-tinta)' : color}
                  strokeWidth={isSelected ? 3 : 1.5}
                  className={cn(isSelected && 'caseta-pulse')}
                />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-cartel tabular pointer-events-none select-none"
                  fontSize={shape.width < 24 || shape.height < 18 ? 9 : 11}
                  fontWeight={700}
                  fill={debug ? '#000' : '#fff'}
                  transform={shape.rotate ? `rotate(${-shape.rotate} ${cx} ${cy})` : undefined}
                >
                  {shape.number}
                </text>
              </g>
            )
          })}
        </svg>

        {hovered && (
          <div
            role="tooltip"
            className={cn(
              'rise-in pointer-events-none absolute z-10 w-max max-w-60 -translate-x-1/2 rounded-control bg-tinta px-3 py-2 text-[13px] text-white shadow-float',
              !tooltipBelow && '-translate-y-full',
            )}
            style={{
              left: `${((hovered.x + hovered.width / 2) / MAP_WIDTH) * 100}%`,
              top: tooltipBelow
                ? `calc(${((hovered.y + hovered.height) / MAP_HEIGHT) * 100}% + 6px)`
                : `calc(${(hovered.y / MAP_HEIGHT) * 100}% - 6px)`,
            }}
          >
            <p className="font-semibold">
              <span className="font-cartel tabular mr-1.5 text-white/70">{hovered.number}</span>
              {hoveredCaseta?.name ?? 'Caseta libre'}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-white/70">
              <span
                className="size-2 rounded-full"
                style={{ background: STATUS_META[hoveredCaseta?.status ?? 'free'].color }}
              />
              {STATUS_META[hoveredCaseta?.status ?? 'free'].label}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
