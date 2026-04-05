import prisma from "@/lib/prisma"

export type ManualLoanResult =
  | { ok: true }
  | { ok: false; error: string }

export type ManualLoanInput = {
  clientId: number
  productId: number
  quantity: number
  description?: string
}

/** Lógica de BD compartida por Server Action y ruta API. */
export async function executeManualLoan(
  input: ManualLoanInput
): Promise<ManualLoanResult> {
  const client_id = input.clientId
  const product_id = input.productId
  const quantity = input.quantity
  const description = (input.description ?? "").trim()

  if (!Number.isInteger(client_id) || client_id < 1) {
    return { ok: false, error: "Seleccioná un cliente." }
  }
  if (!Number.isInteger(product_id) || product_id < 1) {
    return { ok: false, error: "Seleccioná un tipo de envase." }
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return {
      ok: false,
      error: "La cantidad debe ser un número entero mayor a 0.",
    }
  }

  const descLine = description
    ? `Deuda manual: ${description} (+${quantity})`
    : `Deuda manual (+${quantity} vacíos)`
  const movementDescription =
    descLine.length > 500 ? `${descLine.slice(0, 497)}...` : descLine

  try {
    await prisma.$transaction(async (tx) => {
      const client = await tx.client.findUnique({ where: { id: client_id } })
      const product = await tx.product.findUnique({ where: { id: product_id } })
      if (!client) {
        throw new Error("CLIENT_NOT_FOUND")
      }
      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND")
      }

      if (product.stock_empty < quantity) {
        throw new Error(
          `INSUFFICIENT_EMPTY_STOCK:${product.stock_empty}`
        )
      }

      let loanAcc = await tx.clientCylinderLoan.findFirst({
        where: { client_id, product_id },
      })

      if (!loanAcc) {
        loanAcc = await tx.clientCylinderLoan.create({
          data: { client_id, product_id, quantity_owed: 0 },
        })
      }

      await tx.clientCylinderLoan.update({
        where: { id: loanAcc.id },
        data: { quantity_owed: { increment: quantity } },
      })

      await tx.product.update({
        where: { id: product_id },
        data: { stock_empty: { decrement: quantity } },
      })

      await tx.stockMovement.create({
        data: {
          product_id,
          movement_type: "PRESTAMO_CLIENTE",
          quantity_full_change: 0,
          quantity_empty_change: -quantity,
          description: movementDescription,
        },
      })
    })

    return { ok: true }
  } catch (e) {
    const code = e instanceof Error ? e.message : ""
    if (code === "CLIENT_NOT_FOUND") {
      return { ok: false, error: "El cliente no existe o fue eliminado." }
    }
    if (code === "PRODUCT_NOT_FOUND") {
      return { ok: false, error: "El producto no existe." }
    }
    if (code.startsWith("INSUFFICIENT_EMPTY_STOCK:")) {
      const have = code.split(":")[1] ?? "0"
      return {
        ok: false,
        error: `No hay suficientes vacíos en depósito para este envase. Stock vacío actual: ${have}.`,
      }
    }
    console.error("executeManualLoan", e)
    const prismaMsg =
      e && typeof e === "object" && "message" in e
        ? String((e as { message: unknown }).message)
        : String(e)
    return {
      ok: false,
      error:
        prismaMsg.length > 0 && prismaMsg.length < 220
          ? prismaMsg
          : "No se pudo guardar el préstamo. Revisá la base de datos o la consola del servidor.",
    }
  }
}
