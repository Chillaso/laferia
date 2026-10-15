import { useId, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { STATUS_META } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { Caseta } from '@/types/caseta'

interface CasetaSearchProps {
  query: string
  onQueryChange: (query: string) => void
  results: Caseta[]
  onSelect: (number: number) => void
}

const MAX_RESULTS = 8

export function CasetaSearch({ query, onQueryChange, results, onSelect }: CasetaSearchProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const visible = results.slice(0, MAX_RESULTS)
  // Results update after the query (deferred), so keep the active row in range.
  const active = Math.min(activeIndex, Math.max(visible.length - 1, 0))

  const choose = (caseta: Caseta) => {
    onSelect(caseta.number)
    setOpen(false)
  }

  const clear = () => {
    onQueryChange('')
    setActiveIndex(0)
    inputRef.current?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      // First Escape closes the list, a second one clears the query.
      if (open && query) setOpen(false)
      else clear()
      return
    }
    if (!visible.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((active + 1) % visible.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((active - 1 + visible.length) % visible.length)
    } else if (event.key === 'Enter' && open) {
      event.preventDefault()
      choose(visible[active])
    }
  }

  const showList = open && query.trim().length > 0

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-tinta-3" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showList && visible.length > 0}
        aria-controls={showList && visible.length > 0 ? listId : undefined}
        aria-activedescendant={showList && visible[active] ? `${listId}-${visible[active].number}` : undefined}
        aria-label="Buscar caseta por nombre, número o CIF"
        placeholder="Buscar por nombre, número o CIF…"
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value)
          setActiveIndex(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={handleKeyDown}
        className="h-11 w-full rounded-control border border-linea bg-white pr-11 pl-10 text-[15px] shadow-panel transition-[border-color,box-shadow] duration-150 placeholder:text-tinta-4 hover:border-linea-fuerte focus:border-anil-600 focus:ring-3 focus:ring-anil-600/15 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={clear}
          className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-control text-tinta-3 transition-colors hover:bg-cal-hondo hover:text-tinta"
          aria-label="Limpiar búsqueda"
        >
          <X className="size-4" />
        </button>
      )}
      {showList && visible.length === 0 && (
        <p
          role="status"
          className="rise-in absolute z-20 mt-1.5 w-full rounded-panel bg-white px-3 py-6 text-center text-sm text-tinta-3 shadow-float"
        >
          Ninguna caseta coincide. Prueba con el número o el CIF.
        </p>
      )}
      {showList && visible.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Casetas encontradas"
          className="rise-in absolute z-20 mt-1.5 max-h-80 w-full origin-top overflow-auto rounded-panel bg-white p-1.5 shadow-float"
        >
          {visible.map((caseta, index) => (
            <li
              key={caseta.number}
              id={`${listId}-${caseta.number}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(caseta)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-control px-2.5 py-2 text-sm',
                index === active && 'bg-anil-50',
              )}
            >
              <span className="font-cartel tabular w-8 shrink-0 text-right text-lg leading-none font-extrabold text-anil-700">
                {caseta.number}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-tinta">{caseta.name ?? 'Caseta libre'}</span>
                {caseta.cif && <span className="tabular block text-[13px] text-tinta-3">{caseta.cif}</span>}
              </span>
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: STATUS_META[caseta.status].color }}
                title={STATUS_META[caseta.status].label}
              />
            </li>
          ))}
          {results.length > MAX_RESULTS && (
            <li role="presentation" className="px-3 pt-2 pb-1 text-[13px] text-tinta-3">
              +{results.length - MAX_RESULTS} más resaltadas en el mapa
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
