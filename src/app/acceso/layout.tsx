/** Ruta dedicada (evita caché CDN en /login con HTML viejo del panel). */
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function AccesoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
