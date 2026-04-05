"use client"

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
    <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-[#ff7a1a] to-[#ff4b1f] shadow-sm">
              <span className="text-[10px] font-black tracking-[0.22em] text-slate-950">
                GAS
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-200">
                Patrón del Gas
              </span>
              <span className="text-[11px] text-slate-400">
                Panel de administración diaria
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1 ml-4 rounded-full border border-slate-700/80 bg-slate-900/80 px-1.5 py-1">
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
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
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
              <span className="hidden sm:inline-flex max-w-xs items-center truncate rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-slate-700/80">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate">{session.user?.email}</span>
              </span>
            )}
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1 rounded-full border border-[#ff7a1a] bg-[#ff7a1a]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ffddb8] hover:bg-[#ff7a1a]/25 hover:text-white transition-colors"
            >
              <span className="hidden sm:inline">Cerrar sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>

        <div className="mt-2 flex md:hidden gap-1 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  active
                    ? "bg-slate-100 text-slate-900"
                    : "bg-slate-900/80 text-slate-300 hover:text-white"
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
