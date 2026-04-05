"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { MovementType } from "@prisma/client"

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

export async function processManualLoan(formData: FormData) {
  const client_id = Number(formData.get("client_id"))
  const product_id = Number(formData.get("product_id"))
  const action_type = formData.get("action_type") as "LEND" | "RECEIVE"
  const quantity = Number(formData.get("quantity"))
  const description = formData.get("description") as string

  if (quantity <= 0) return

  await prisma.$transaction(async (tx) => {
    // 1. Find or create loan account
    let loanAcc = await tx.clientCylinderLoan.findFirst({
      where: { client_id, product_id }
    })

    if (!loanAcc) {
      loanAcc = await tx.clientCylinderLoan.create({
        data: { client_id, product_id, quantity_owed: 0 }
      })
    }

    // 2. Adjust quantities
    // If we LEND to client, quantity_owed (+) increases.
    // If we RECEIVE from client, quantity_owed (-) decreases.
    const qtyChange = action_type === "LEND" ? quantity : -quantity

    await tx.clientCylinderLoan.update({
      where: { id: loanAcc.id },
      data: { quantity_owed: { increment: qtyChange } }
    })

    // 3. Update stock_empty & Movements
    // If we LEND them our empty/full, usually we loan an EMPTY when they buy a FULL without giving us one.
    // If we are just registering a loan manually, usually it's "They took a cylinder without returning one". This means they OWE us an empty cylinder. We subtract 1 empty stock (or if it's full, technically we shouldn't mix, but typically "Cuenta Corriente" tracks empty cylinders).
    await tx.product.update({
      where: { id: product_id },
      data: {
        stock_empty: { increment: -qtyChange }
      }
    })

    // Register movement for traceability
    await tx.stockMovement.create({
      data: {
        product_id,
        movement_type: action_type === "LEND" ? "PRESTAMO_CLIENTE" : "DEVOLUCION_CLIENTE",
        quantity_full_change: 0,
        quantity_empty_change: -qtyChange,
        description: `Manual Loan Adjustment: ${description}`
      }
    })
  })

  revalidatePath("/loans")
  revalidatePath("/stock")
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
