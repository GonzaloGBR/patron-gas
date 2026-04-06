import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/Providers"
import { getMetadataBase } from "@/lib/site-url"

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Patrón del Gas",
  description: "Sistema de gestión de ventas y préstamos",
  icons: {
    icon: [{ url: "/brand/logo.png", type: "image/png" }],
    apple: "/brand/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
