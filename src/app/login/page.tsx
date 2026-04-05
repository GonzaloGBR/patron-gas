"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setError("Credenciales inválidas")
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950/95 px-4">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 shadow-[0_22px_70px_rgba(15,23,42,0.9)]">
        <div className="absolute -left-16 top-4 h-40 w-40 rounded-full bg-[#ff7a1a]/20 blur-3xl" />
        <div className="absolute -right-10 -bottom-10 h-52 w-52 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="grid grid-cols-1 md:grid-cols-[1.4fr,1fr] relative z-10">
          <section className="hidden md:flex flex-col justify-between border-r border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 px-10 py-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Patrón del Gas
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
                Panel de control para la operación diaria de garrafas.
              </h1>
              <p className="mt-4 max-w-md text-sm text-slate-400">
                Diseñado para administración en ritmo de trabajo real: pedidos por teléfono,
                WhatsApp y movimientos de stock en simultáneo, sin perder precisión.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Hoy
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-50">
                  Operación en curso
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Ventas, préstamos y stock en un solo panel.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Enfoque
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-50">
                  Datos claros
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Tipografía utilitaria y números legibles al instante.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Seguridad
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-50">
                  Acceso controlado
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Solo personal autorizado puede operar el sistema.
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center bg-slate-950/80 px-6 py-8 md:px-8">
            <div className="w-full max-w-sm">
              <div className="mb-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Acceso restringido
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
                  Ingresar al panel administrativo
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Usa tu email y contraseña asignados. No compartas tus credenciales.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-50 shadow-[0_0_0_1px_rgba(15,23,42,0.6)] outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-500/50"
                    placeholder="admin@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-50 shadow-[0_0_0_1px_rgba(15,23,42,0.6)] outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-500/50"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[#ff7a1a] px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_10px_40px_rgba(248,115,22,0.65)] transition-transform transition-colors hover:bg-[#ff6500] hover:shadow-[0_16px_55px_rgba(248,115,22,0.75)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Iniciando sesión..." : "Ingresar al sistema"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
