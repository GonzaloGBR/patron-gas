import Image from "next/image"

const sizes = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-24 w-24 sm:h-28 sm:w-28",
  hero: "h-28 w-28 sm:h-32 sm:w-32",
} as const

type BrandLogoProps = {
  variant?: keyof typeof sizes
  className?: string
  priority?: boolean
}

/** Logo oficial (PNG en /public/brand/logo.png). */
export default function BrandLogo({
  variant = "md",
  className = "",
  priority,
}: BrandLogoProps) {
  // Sin /_next/image: en algunos hostings el optimizador falla y el logo no carga.
  return (
    <Image
      src="/brand/logo.png"
      alt="Patrón del Gas — Zona Sudeste"
      width={256}
      height={256}
      priority={priority}
      unoptimized
      className={`object-contain ${sizes[variant]} ${className}`}
    />
  )
}
