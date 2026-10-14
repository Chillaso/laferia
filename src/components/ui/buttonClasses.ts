import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-anil-700 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(26_46_104/0.3)] hover:bg-anil-800 disabled:bg-anil-700/45 disabled:shadow-none',
  secondary: 'bg-white text-tinta shadow-panel hover:bg-cal disabled:text-tinta-4',
  ghost: 'text-tinta-2 hover:bg-cal-hondo hover:text-tinta disabled:text-tinta-4',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-[15px] gap-2',
}

/** Shared by <Button> and router links styled as buttons. */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-control font-semibold transition-[background-color,box-shadow,transform] duration-150 ease-(--ease-out-snap) active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
}
