"use server"

import { revalidatePath } from "next/cache"
import { executeManualLoan } from "@/lib/manual-loan"

/** Archivo solo con esta acción: evita problemas de serialización mezclando muchas exports. */
export async function registerManualLoanAction(input: {
  clientId: number
  productId: number
  quantity: number
  description?: string
}) {
  try {
    const result = await executeManualLoan(input)
    if (result.ok) {
      try {
        revalidatePath("/loans")
        revalidatePath("/stock")
      } catch (e) {
        console.error("registerManualLoanAction revalidatePath", e)
      }
    }
    return result
  } catch (e) {
    console.error("registerManualLoanAction", e)
    return {
      ok: false as const,
      error:
        "Error interno al guardar. Revisá los logs del servidor o la base de datos.",
    }
  }
}
