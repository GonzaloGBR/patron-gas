import BrandLogo from "@/components/BrandLogo"
import Navbar from "@/components/Navbar"

/** Solo envuelve las rutas del panel (grupo `(main)`). El login vive en `/acceso`. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="w-full flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="rounded-2xl border border-brand-800/15 bg-white/95 shadow-[0_18px_60px_rgba(12,29,46,0.18)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-white/10 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="shrink-0 rounded-full bg-black/40 p-0.5 ring-1 ring-brand-700/50">
                  <BrandLogo variant="md" className="rounded-full" />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                    Patrón del Gas
                  </p>
                  <p className="text-[11px] font-medium text-brand-400/90">
                    Zona Sudeste · Ventas, stock y préstamos
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full border border-brand-700/60 bg-brand-950/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Sesión activa
              </span>
            </div>
            <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
