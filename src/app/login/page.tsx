import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

/** Compatibilidad: /login y /login?callbackUrl=… → /acceso (misma query). */
export default async function LoginRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>
}) {
  const sp = await searchParams
  const raw = sp.callbackUrl
  const callbackUrl = Array.isArray(raw) ? raw[0] : raw
  const qs = new URLSearchParams()
  if (callbackUrl && typeof callbackUrl === "string") {
    qs.set("callbackUrl", callbackUrl)
  }
  const q = qs.toString()
  redirect(q ? `/acceso?${q}` : "/acceso")
}
