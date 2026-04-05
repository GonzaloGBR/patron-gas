"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/"
  return raw
}

function AccesoForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const afterLogin = safeCallbackUrl(searchParams.get("callbackUrl"))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: afterLogin,
    })

    if (res?.error) {
      setError("Email o contraseña incorrectos.")
      setLoading(false)
    } else {
      router.push(afterLogin)
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
        <h1 className="text-center text-lg font-semibold text-slate-50">
          Patrón del Gas
        </h1>
        <p className="mt-1 text-center text-sm text-slate-400">Iniciar sesión</p>

        {error && (
          <div
            className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="acceso-email"
              className="mb-1 block text-xs font-medium text-slate-400"
            >
              Usuario (email)
            </label>
            <input
              id="acceso-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-sm text-slate-50 outline-none ring-slate-600 focus:border-slate-500 focus:ring-2 focus:ring-slate-600/40"
            />
          </div>

          <div>
            <label
              htmlFor="acceso-password"
              className="mb-1 block text-xs font-medium text-slate-400"
            >
              Contraseña
            </label>
            <input
              id="acceso-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-sm text-slate-50 outline-none ring-slate-600 focus:border-slate-500 focus:ring-2 focus:ring-slate-600/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#ff7a1a] py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#ff6500] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AccesoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-sm text-slate-400">
          Cargando…
        </div>
      }
    >
      <AccesoForm />
    </Suspense>
  )
}
