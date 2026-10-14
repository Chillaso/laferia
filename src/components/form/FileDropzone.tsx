import { useId, useRef, useState, type DragEvent } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'

export const MAX_FILE_BYTES = 10 * 1024 * 1024

interface FileDropzoneProps {
  id: string
  label: string
  description: string
  value: File | undefined
  onChange: (file: File | undefined) => void
  error?: string
}

export function FileDropzone({ id, label, description, value, onChange, error }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const descriptionId = useId()

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) onChange(file)
  }

  const clear = () => {
    onChange(undefined)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-tinta">
        {label}
        <span className="ml-0.5 text-anil-600" aria-hidden>
          *
        </span>
      </span>
      {value ? (
        <div
          className={cn(
            'rise-in flex items-center gap-3 rounded-control border bg-white py-2.5 pr-2 pl-3',
            error ? 'border-status-error' : 'border-linea',
          )}
        >
          <span
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-control',
              error ? 'bg-status-error/10 text-status-error' : 'bg-anil-50 text-anil-700',
            )}
          >
            <FileText className="size-[18px]" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-tinta">{value.name}</p>
            <p className="tabular text-[13px] text-tinta-3">{formatBytes(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={clear}
            className="grid size-9 place-items-center rounded-control text-tinta-3 transition-colors hover:bg-cal-hondo hover:text-tinta"
            aria-label={`Quitar ${label}`}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'group flex min-h-[58px] cursor-pointer items-center gap-3 rounded-control border border-dashed px-3 py-2.5 transition-colors duration-150 has-[+input:focus-visible]:outline-2 has-[+input:focus-visible]:outline-offset-2 has-[+input:focus-visible]:outline-anil-600',
            dragging
              ? 'border-anil-600 bg-anil-50'
              : error
                ? 'border-status-error bg-status-error/5'
                : 'border-linea-fuerte bg-cal hover:border-anil-500 hover:bg-white',
          )}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-control bg-white text-anil-700 shadow-panel transition-colors group-hover:bg-anil-50">
            <Upload className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 text-sm">
            <span className="block font-semibold text-anil-700">
              {dragging ? 'Suelta el archivo aquí' : 'Elegir PDF o arrastrarlo'}
            </span>
            <span id={descriptionId} className="block text-[13px] text-tinta-3">
              {description}
            </span>
          </span>
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.files?.[0])}
      />
      {error && (
        <p role="alert" className="text-[13px] text-status-error">
          {error}
        </p>
      )}
    </div>
  )
}
