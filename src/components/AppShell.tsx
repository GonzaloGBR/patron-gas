"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/Navbar"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === "/login"

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="w-full flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="rounded-2xl border border-slate-200/70 bg-white/95 shadow-[0_18px_60px_rgba(15,23,42,0.24)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-slate-100/80 bg-slate-950/90 px-6 py-3 sm:py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#ff7a1a] to-[#ff4b1f] shadow-sm">
                  <span className="text-xs font-black tracking-[0.18em] text-slate-950">
                    GAS
                  </span>
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                    Patrón del Gas
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">
                    Panel operativo de ventas, stock y préstamos
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-300">
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
