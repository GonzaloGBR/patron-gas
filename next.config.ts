import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /** Quita la “N” flotante y el panel de dev en el navegador (solo afecta `next dev`). */
  devIndicators: false,
  /** No enviar cabecera que delata Next.js. */
  poweredByHeader: false,
  async rewrites() {
    return [
      /** Peticiones legacy a /favicon.ico → mismo logo que la pestaña. */
      { source: "/favicon.ico", destination: "/brand/logo.png" },
    ]
  },
}

export default nextConfig
