import { NavLink, Outlet } from 'react-router-dom'
import { FilePlus2, Map } from 'lucide-react'
import { Toldo } from '@/components/ui/toldo'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: 'Solicitar caseta', icon: FilePlus2, end: true },
  { to: '/gestion', label: 'Gestión documental', icon: Map, end: false },
]

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30">
        <div className="bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-x-6 gap-y-2 px-4 pt-3 sm:px-6">
            <NavLink to="/" className="flex items-baseline gap-2 pb-3 rounded-control">
              <span className="font-cartel text-[22px] leading-none font-extrabold text-anil-700">
                Feria del Caballo
              </span>
              <span className="text-[13px] font-medium text-tinta-3">Ayuntamiento de Jerez</span>
            </NavLink>
            <nav aria-label="Principal" className="-mb-px flex gap-1">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center gap-2 rounded-t-control px-3 pt-2 pb-3 text-sm font-semibold transition-colors duration-150',
                      'after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:transition-colors',
                      isActive
                        ? 'text-anil-700 after:bg-anil-700'
                        : 'text-tinta-3 after:bg-transparent hover:text-tinta',
                    )
                  }
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
        <Toldo />
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-16 sm:px-6 sm:pt-10">
        <Outlet />
      </main>
      <footer className="border-t border-linea py-6 text-center text-[13px] text-tinta-3">
        Prototipo con datos ficticios. Edición 2027.
      </footer>
    </div>
  )
}
