import Image from "next/image"

const sizes = {
  /** Barra superior */
  sm: "h-11 w-11 sm:h-[52px] sm:w-[52px]",
  /** Cabecera del panel (tarjeta) */
  md: "h-[52px] w-[52px] sm:h-14 sm:w-14",
  lg: "h-24 w-24 sm:h-28 sm:w-28",
  /** Pantalla de acceso (solo con native=true recomendado) */
  hero: "h-40 w-40 sm:h-44 sm:w-44",
} as const

type BrandLogoProps = {
  variant?: keyof typeof sizes
  className?: string
  priority?: boolean
  /**
   * `<img>` nativo: en `/acceso` a veces `next/image` no hidrata bien el `src`;
   * dentro del panel `Image` suele ir bien.
   */
  native?: boolean
}

/** Logo oficial (archivo estático `/brand/logo.png` → `public/brand/logo.png`). */
export default function BrandLogo({
  variant = "md",
  className = "",
  priority,
  native = false,
}: BrandLogoProps) {
  const cls = `object-contain ${sizes[variant]} ${className}`.trim()

  if (native) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- login: carga fiable sin optimizador
      <img
        src="/brand/logo.png"
        alt="Patrón del Gas — Zona Sudeste"
        width={256}
        height={256}
        className={cls}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    )
  }

  return (
    <Image
      src="/brand/logo.png"
      alt="Patrón del Gas — Zona Sudeste"
      width={256}
      height={256}
      priority={priority}
      unoptimized
      className={cls}
    />
  )
}
