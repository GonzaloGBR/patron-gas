import { assertRequiredEnv } from "@/lib/env"

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  /** `next build` puede arrancar sin `.env` en CI. */
  if (process.env.NEXT_PHASE === "phase-production-build") return

  /**
   * Si lanzamos acá y falla, en varios hostings el proceso Node no queda escuchando → 503.
   * Por defecto solo logueamos; con STRICT_ENV_AT_STARTUP=1 volvé al fallo en arranque.
   */
  try {
    assertRequiredEnv()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(msg)
    if (process.env.STRICT_ENV_AT_STARTUP === "1") {
      throw e
    }
  }
}
