"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
export async function getClientLoans() {
  return await prisma.clientCylinderLoan.findMany({
    include: {
      client: true,
      product: true
    },
    // Only bring loans where they owe us something, or someone we owe
    where: {
      quantity_owed: { not: 0 }
    },
    orderBy: { updated_at: "desc" }
  })
}

export async function getAllClients() {
  return await prisma.client.findMany({
    orderBy: { last_name: "asc" }
  })
}

export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: [{ brand: "asc" }, { weight: "asc" }]
  })
}

export async function resolveLoan(id: number) {
  await prisma.$transaction(async (tx) => {
    const loan = await tx.clientCylinderLoan.findUnique({ where: { id } })
    if (!loan || loan.quantity_owed === 0) return

    // Update stock representing the returned goods.
    // If quantity_owed > 0, they owed us empty cylinders and they are returning them (stock_empty increases).
    // If quantity_owed < 0, we owed them and we returned them (stock_empty decreases).
    await tx.product.update({
      where: { id: loan.product_id },
      data: { stock_empty: { increment: loan.quantity_owed } }
    })

    // Register movement for traceability
    await tx.stockMovement.create({
      data: {
        product_id: loan.product_id,
        movement_type: loan.quantity_owed > 0 ? "DEVOLUCION_CLIENTE" : "PRESTAMO_CLIENTE",
        quantity_full_change: 0,
        quantity_empty_change: loan.quantity_owed,
        description: "Saldado automático desde Deudores"
      }
    })

    // Delete the debt entirely from the db
    await tx.clientCylinderLoan.delete({ where: { id } })
  })

  revalidatePath("/loans")
  revalidatePath("/stock")
}
