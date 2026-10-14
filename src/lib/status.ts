import type { DocStatus } from '@/types/caseta'

interface StatusMeta {
  label: string
  description: string
  color: string
  badgeClass: string
}

export const STATUS_ORDER: DocStatus[] = ['free', 'error', 'pending', 'approved']

export const STATUS_META: Record<DocStatus, StatusMeta> = {
  free: {
    label: 'Libre',
    description: 'Sin solicitud ni documentación',
    color: 'var(--color-status-free)',
    badgeClass: 'bg-cal-hondo text-tinta-2',
  },
  error: {
    label: 'Con incidencias',
    description: 'Documentación con errores',
    color: 'var(--color-status-error)',
    badgeClass: 'bg-status-error/10 text-[#a8261f]',
  },
  pending: {
    label: 'Pendiente de revisión',
    description: 'Enviada, sin revisar',
    color: 'var(--color-status-pending)',
    badgeClass: 'bg-status-pending/12 text-[#9a5a06]',
  },
  approved: {
    label: 'Validada',
    description: 'Revisada y correcta',
    color: 'var(--color-status-approved)',
    badgeClass: 'bg-status-approved/10 text-[#22683a]',
  },
}

export const DOCUMENT_LABEL = {
  estatutos: 'Estatutos',
  memoria: 'Memoria',
} as const
