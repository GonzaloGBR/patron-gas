"use client"

import BrandLogo from "@/components/BrandLogo"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const navItems = [
    { name: "Dashboard", href: "/" },
    { name: "Clientes", href: "/clients" },
    { name: "Productos", href: "/products" },
    { name: "Stock", href: "/stock" },
    { name: "Préstamos", href: "/loans" },
    { name: "Ventas", href: "/sales" },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b border-brand-800/60 bg-gradient-to-b from-brand-950/98 to-brand-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 sm:gap-4">
            <Link
              href="/"
              className="shrink-0 rounded-full bg-black/35 p-0.5 ring-1 ring-brand-700/45 transition-opacity hover:opacity-90"
            >
              <BrandLogo variant="sm" />
            </Link>
            <div className="hidden min-[380px]:flex flex-col min-w-0">
              <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-100">
                Patrón del Gas
              </span>
              <span className="text-[11px] text-brand-400/85 truncate">
                Zona Sudeste
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1 ml-2 rounded-full border border-brand-700/55 bg-brand-950/50 px-1.5 py-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors ${
                      active
                        ? "bg-brand-100 text-brand-950"
                        : "text-slate-300 hover:text-white hover:bg-brand-800/80"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session && (
              <span className="hidden sm:inline-flex max-w-xs items-center truncate rounded-full bg-brand-950/70 px-3 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-brand-700/60">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate">{session.user?.email}</span>
              </span>
            )}
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1 rounded-full border border-brand-500/70 bg-brand-600/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-100 hover:bg-brand-500/30 hover:text-white transition-colors"
            >
              <span className="hidden sm:inline">Cerrar sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5 md:hidden pb-2">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[2.5rem] items-center justify-center rounded-full px-2 py-1.5 text-center text-[10px] font-semibold uppercase leading-tight tracking-[0.12em] sm:text-[11px] sm:tracking-[0.14em] ${
                  active
                    ? "bg-brand-100 text-brand-950"
                    : "bg-brand-950/70 text-slate-300 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
