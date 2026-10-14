import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { STATUS_META } from '@/lib/status'
import type { DocStatus } from '@/types/caseta'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', className)}
      {...props}
    />
  )
}

export function StatusBadge({ status, className }: { status: DocStatus; className?: string }) {
  const meta = STATUS_META[status]
  return (
    <Badge className={cn(meta.badgeClass, className)}>
      <span className="size-1.5 rounded-full" style={{ background: meta.color }} aria-hidden />
      {meta.label}
    </Badge>
  )
}
