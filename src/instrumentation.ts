import { assertRequiredEnv } from "@/lib/env"

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  /** `next build` puede arrancar sin `.env` en CI; la validación aplica en `next start`. */
  if (process.env.NEXT_PHASE === "phase-production-build") return
  assertRequiredEnv()
}
