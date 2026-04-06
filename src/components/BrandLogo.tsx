"use client"

import Image from "next/image"
import { useState } from "react"

const sizes = {
  /** Barra superior */
  sm: "h-11 w-11 sm:h-[52px] sm:w-[52px]",
  /** Cabecera del panel (tarjeta) */
  md: "h-[52px] w-[52px] sm:h-14 sm:w-14",
  lg: "h-24 w-24 sm:h-28 sm:w-28",
  /** Pantalla de acceso */
  hero: "h-40 w-40 sm:h-44 sm:w-44",
} as const

/** Si definís NEXT_PUBLIC_SITE_URL en el hosting, el logo se pide con URL absoluta (mejor en WhatsApp/Instagram y algunos móviles). */
function logoSrc(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!raw) return "/brand/logo.png"
  const base = raw.replace(/\/$/, "")
  return `${base}/brand/logo.png`
}

type BrandLogoProps = {
  variant?: keyof typeof sizes
  className?: string
  priority?: boolean
  /**
   * `<img>` nativo en login; si la URL devuelve HTML (proxy mal configurado),
   * ocultamos la imagen y mostramos texto para no ver el “preview” roto.
   */
  native?: boolean
}

export default function BrandLogo({
  variant = "md",
  className = "",
  priority,
  native = false,
}: BrandLogoProps) {
  const cls = `object-contain ${sizes[variant]} ${className}`.trim()
  const src = logoSrc()
  const [imgFailed, setImgFailed] = useState(false)

  if (native && imgFailed) {
    return (
      <div
        className={`flex items-center justify-center rounded-full border border-brand-600/40 bg-brand-950/80 text-center ${cls}`}
        role="img"
        aria-label="Patrón del Gas — Zona Sudeste"
      >
        <span className="px-2 text-[10px] font-bold uppercase leading-tight tracking-wide text-slate-200 sm:text-xs">
          Patrón
          <br />
          del Gas
        </span>
      </div>
    )
  }

  if (native) {
    return (
      <img
        src={src}
        alt="Patrón del Gas — Zona Sudeste"
        width={256}
        height={256}
        className={cls}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onError={() => setImgFailed(true)}
      />
    )
  }

  return (
    <Image
      src={src}
      alt="Patrón del Gas — Zona Sudeste"
      width={256}
      height={256}
      priority={priority}
      unoptimized
      className={cls}
    />
  )
}
