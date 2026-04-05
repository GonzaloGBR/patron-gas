"use client"

import BrandLogo from "@/components/BrandLogo"
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-brand-700/50 bg-brand-950/70 p-8 shadow-[0_24px_80px_rgba(6,13,22,0.55)] backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-black/45 p-1 ring-1 ring-brand-600/40">
            <BrandLogo variant="hero" priority />
          </div>
          <h1 className="mt-5 text-center text-lg font-semibold tracking-tight text-slate-50">
            Patrón del Gas
          </h1>
          <p className="mt-0.5 text-center text-xs font-medium uppercase tracking-[0.2em] text-brand-300/90">
            Zona Sudeste
          </p>
          <p className="mt-3 text-center text-sm text-slate-400">Iniciar sesión</p>
        </div>

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
              className="mb-1 block text-xs font-medium text-brand-200/80"
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
              className="w-full rounded-lg border border-brand-700/60 bg-brand-950/40 px-3 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div>
            <label
              htmlFor="acceso-password"
              className="mb-1 block text-xs font-medium text-brand-200/80"
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
              className="w-full rounded-lg border border-brand-700/60 bg-brand-950/40 px-3 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(61,110,168,0.45)] transition-colors hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="flex min-h-screen items-center justify-center bg-brand-950 px-4 text-sm text-brand-200/70">
          Cargando…
        </div>
      }
    >
      <AccesoForm />
    </Suspense>
  )
}
