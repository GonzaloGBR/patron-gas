"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"
import { logError } from "@/lib/log"

export async function getStockMovements(limit = 50) {
  return await prisma.stockMovement.findMany({
    take: limit,
    orderBy: { created_at: "desc" },
    include: { product: true },
  })
}

export async function getProductsForStock() {
  return await prisma.product.findMany({
    orderBy: [{ brand: "asc" }, { weight: "asc" }],
  })
}

export async function registerStockMovement(formData: FormData) {
  try {
    const product_id = Number(formData.get("product_id"))
    const quantity = Number(formData.get("quantity") || 0)
    const description = (formData.get("description") as string) || null

    if (!product_id || quantity === 0) {
      throw new Error("Producto o cantidad faltante/cero")
    }

    const movement_type = quantity > 0 ? "INGRESO_PROVEEDOR" : "ENVIO_PROVEEDOR"
    const quantity_full_change = quantity
    const quantity_empty_change = -quantity

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.stockMovement.create({
        data: {
          product_id,
          movement_type,
          quantity_full_change,
          quantity_empty_change,
          description,
        },
      })

      await tx.product.update({
        where: { id: product_id },
        data: {
          stock_full: { increment: quantity_full_change },
          stock_empty: { increment: quantity_empty_change },
        },
      })
    })

    revalidatePath("/stock")
    revalidatePath("/products")

    return { success: true }
  } catch (error: unknown) {
    logError("registerStockMovement", error)
    const message = error instanceof Error ? error.message : "Error interno"
    return { success: false, error: message }
  }
}

export type StockBatchUpdate = {
  product_id: number
  old_full: number
  old_empty: number
  new_full: number
  new_empty: number
}

export async function updateStockBatch(updates: StockBatchUpdate[]) {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const update of updates) {
        const deltaFull = update.new_full - update.old_full
        const deltaEmpty = update.new_empty - update.old_empty

        await tx.product.update({
          where: { id: update.product_id },
          data: {
            stock_full: update.new_full,
            stock_empty: update.new_empty,
          },
        })

        await tx.stockMovement.create({
          data: {
            product_id: update.product_id,
            movement_type: "INGRESO_PROVEEDOR",
            quantity_full_change: deltaFull,
            quantity_empty_change: deltaEmpty,
            description: "AJUSTE MANUAL DIRECTO",
          },
        })
      }
    })

    revalidatePath("/stock")
    revalidatePath("/")

    return { success: true }
  } catch (error: unknown) {
    logError("updateStockBatch", error)
    const message = error instanceof Error ? error.message : "Error"
    return { success: false, error: message }
  }
}
