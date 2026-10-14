import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** Inputs are inset: a shade darker than the panel, so they read as "write here". */
export const FIELD_CLASSES =
  'w-full rounded-control border border-linea bg-cal px-3 text-[15px] text-tinta placeholder:text-tinta-4 transition-[border-color,background-color,box-shadow] duration-150 hover:border-linea-fuerte focus:border-anil-600 focus:bg-white focus:ring-3 focus:ring-anil-600/15 focus:outline-none aria-invalid:border-status-error aria-invalid:ring-status-error/15'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD_CLASSES, 'h-11', className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD_CLASSES, 'min-h-32 py-2.5 leading-relaxed', className)} {...props} />
}
