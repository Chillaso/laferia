import { cn } from '@/lib/utils'

/** Scalloped awning edge: the visual signature that marks a caseta's "front". */
export function Toldo({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('drop-shadow-[0_1px_0_rgb(29_31_36/0.12)]', className)}>
      <div className="toldo" />
    </div>
  )
}
