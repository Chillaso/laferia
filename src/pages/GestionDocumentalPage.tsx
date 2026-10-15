import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDown, Loader2, X } from 'lucide-react'
import { CasetaDetail } from '@/components/caseta/CasetaDetail'
import { CasetaSearch } from '@/components/caseta/CasetaSearch'
import { FeriaMap } from '@/components/map/FeriaMap'
import { StatusBar } from '@/components/map/StatusBar'
import { Button } from '@/components/ui/button'
import { STATUS_META, STATUS_ORDER } from '@/lib/status'
import { casetaRepository, searchCasetas } from '@/services/casetaService'
import type { Caseta, DocStatus } from '@/types/caseta'

export function GestionDocumentalPage() {
  const [casetas, setCasetas] = useState<Caseta[]>()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Set<DocStatus>>(new Set())
  const [params, setParams] = useSearchParams()
  const mapRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const deferredQuery = useDeferredValue(query)

  const selected = Number(params.get('caseta')) || undefined
  const debug = params.get('debug') === '1'

  useEffect(() => {
    casetaRepository.list().then(setCasetas)
  }, [])

  const byNumber = useMemo(() => new Map((casetas ?? []).map((c) => [c.number, c])), [casetas])
  const selectedCaseta = selected ? byNumber.get(selected) : undefined

  const counts = useMemo(() => {
    const initial = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<DocStatus, number>
    for (const c of casetas ?? []) initial[c.status]++
    return initial
  }, [casetas])

  const hasQuery = deferredQuery.trim().length > 0

  // Casetas passing the status chips; the search narrows this same pool, so the
  // dropdown and the highlighted map always agree.
  const statusPool = useMemo(
    () => (casetas ?? []).filter((c) => statusFilter.size === 0 || statusFilter.has(c.status)),
    [casetas, statusFilter],
  )

  const searchResults = useMemo(() => searchCasetas(statusPool, deferredQuery), [statusPool, deferredQuery])

  const highlighted = useMemo(() => {
    if (!hasQuery && statusFilter.size === 0) return undefined
    return new Set((hasQuery ? searchResults : statusPool).map((c) => c.number))
  }, [hasQuery, searchResults, statusPool, statusFilter])

  const updateSelection = (number: number | undefined) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (number === undefined) next.delete('caseta')
        else next.set('caseta', String(number))
        return next
      },
      { replace: true },
    )

  const selectFromMap = (number: number) => updateSelection(selected === number ? undefined : number)

  const selectFromSearch = (number: number) => {
    updateSelection(number)
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const showDetail = () => {
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    detailRef.current?.focus({ preventScroll: true })
  }

  const toggleStatus = (status: DocStatus) =>
    setStatusFilter((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })

  const clearFilters = () => {
    setQuery('')
    setStatusFilter(new Set())
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-cartel text-4xl leading-[1.05] font-extrabold text-tinta sm:text-5xl">
            Gestión documental
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-tinta-2">
            Revisa el expediente de cada caseta del Real. Pulsa una caseta en el plano o búscala por nombre,
            número o CIF.
          </p>
        </div>
        <div className="w-full lg:max-w-sm">
          <CasetaSearch
            query={query}
            onQueryChange={setQuery}
            results={searchResults}
            onSelect={selectFromSearch}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <StatusBar counts={counts} active={statusFilter} onToggle={toggleStatus} />

        <div ref={mapRef} className="scroll-mt-28">
          {casetas ? (
            <FeriaMap
              casetas={byNumber}
              selected={selected}
              highlighted={highlighted}
              onSelect={selectFromMap}
              debug={debug}
            />
          ) : (
            <div className="grid aspect-[1168/806] place-items-center rounded-sheet bg-albero-claro">
              <Loader2 className="size-6 animate-spin text-anil-700" aria-label="Cargando casetas" />
            </div>
          )}
        </div>

        {(selectedCaseta || highlighted) && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {selectedCaseta ? (
              <div
                key={selectedCaseta.number}
                className="rise-in flex min-w-0 items-center gap-3 rounded-panel bg-white py-2 pr-2 pl-3.5 shadow-panel"
              >
                <span className="font-cartel tabular text-2xl leading-none font-extrabold text-anil-700">
                  {selectedCaseta.number}
                </span>
                <span className="min-w-0">
                  <span className="block max-w-64 truncate text-sm font-semibold text-tinta">
                    {selectedCaseta.name ?? 'Caseta libre'}
                  </span>
                  <span className="flex items-center gap-1.5 text-[13px] text-tinta-3">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: STATUS_META[selectedCaseta.status].color }}
                      aria-hidden
                    />
                    {STATUS_META[selectedCaseta.status].label}
                  </span>
                </span>
                <Button size="sm" onClick={showDetail}>
                  Ver ficha
                  <ArrowDown className="size-3.5" aria-hidden />
                </Button>
                <button
                  type="button"
                  onClick={() => updateSelection(undefined)}
                  className="grid size-8 place-items-center rounded-control text-tinta-3 transition-colors hover:bg-cal-hondo hover:text-tinta"
                  aria-label="Quitar selección"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <span />
            )}

            {highlighted && (
              <div className="flex flex-wrap items-center gap-x-1 text-sm" aria-live="polite">
                <span className="text-tinta-2">
                  <span className="tabular font-semibold text-tinta">{highlighted.size}</span>{' '}
                  {highlighted.size === 1 ? 'caseta coincide' : 'casetas coinciden'}
                </span>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-anil-700">
                  Quitar filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <CasetaDetail ref={detailRef} caseta={selectedCaseta} />
    </div>
  )
}
