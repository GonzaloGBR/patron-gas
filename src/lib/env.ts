/**
 * Validación temprana de variables críticas (arranque del runtime Node).
 * No sustituye `.env` en build; evita que la app “arranque” sin credenciales en producción.
 */
export function assertRequiredEnv(): void {
  const missing: string[] = []

  if (!process.env.DATABASE_URL?.trim()) {
    missing.push("DATABASE_URL")
  }

  const hasAuthSecret =
    Boolean(process.env.NEXTAUTH_SECRET?.trim()) ||
    Boolean(process.env.AUTH_SECRET?.trim())
  if (!hasAuthSecret) {
    missing.push("NEXTAUTH_SECRET (o AUTH_SECRET)")
  }

  if (missing.length > 0) {
    throw new Error(
      `[env] Faltan variables obligatorias: ${missing.join(", ")}. Revisá el hosting y el archivo .env.`
    )
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.NEXTAUTH_URL?.trim()) {
      console.warn(
        "[env] NEXTAUTH_URL no está definida; en producción conviene la URL pública exacta (callbacks / cookies)."
      )
    }
  }
}
