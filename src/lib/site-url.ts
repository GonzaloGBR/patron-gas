/**
 * URL pública del sitio (sin barra final). En Hostinger conviene definir
 * NEXT_PUBLIC_SITE_URL=https://tudominio.com para favicon/logo absolutos y WebViews.
 */
export function getPublicSiteUrl(): string | undefined {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim()
  if (!raw) return undefined
  try {
    const u = new URL(raw)
    return u.origin
  } catch {
    return undefined
  }
}

/** Origen absoluto para metadata (solo servidor / build). */
export function getMetadataBase(): URL | undefined {
  const u = getPublicSiteUrl()
  if (!u) return undefined
  try {
    return new URL(u)
  } catch {
    return undefined
  }
}
