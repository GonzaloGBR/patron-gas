"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { OrderStatus, PaymentMethod } from "@prisma/client"

export async function getSales() {
  return await prisma.order.findMany({
    orderBy: { created_at: "desc" },
    include: {
      client: true,
      items: { include: { product: true } }
    }
  })
}

export async function getCreateSaleData() {
  const clients = await prisma.client.findMany({ orderBy: { last_name: "asc" } })
  const products = await prisma.product.findMany({
    include: { prices: true },
    orderBy: [{ brand: "asc" }, { weight: "asc" }]
  })
  return { clients, products }
}

export async function createSale(data: any) {
  const { client_id, status, payment_method, total_amount, items, empty_returned } = data

  await prisma.$transaction(async (tx) => {
    // 1. Create order
    const order = await tx.order.create({
      data: {
        client_id: Number(client_id),
        status: status as OrderStatus,
        payment_method: payment_method as PaymentMethod,
        total_amount,
        completed_at: status === "COMPLETADO" ? new Date() : null,
        items: {
          create: items.map((item: any) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
            unit_price_at_sale: item.unit_price,
            subtotal: item.subtotal
          }))
        }
      }
    })

    // 2. If completed, update stock and loans
    if (status === "COMPLETADO") {
      for (const item of items) {
        // Decrease full stock
        await tx.product.update({
          where: { id: Number(item.product_id) },
          data: { stock_full: { decrement: Number(item.quantity) } }
        })

        // Handle empty cylinders based on empty_returned object { [productId]: quantity_returned }
        const returnedQty = Number(empty_returned?.[item.product_id] || 0)
        const missingQty = Number(item.quantity) - returnedQty

        if (missingQty > 0) {
          // Client didn't return enough empties, so they owe us (loan)
          let loanAcc = await tx.clientCylinderLoan.findFirst({
            where: { client_id: Number(client_id), product_id: Number(item.product_id) }
          })
          
          if (!loanAcc) {
            await tx.clientCylinderLoan.create({
              data: { client_id: Number(client_id), product_id: Number(item.product_id), quantity_owed: missingQty }
            })
          } else {
            await tx.clientCylinderLoan.update({
              where: { id: loanAcc.id },
              data: { quantity_owed: { increment: missingQty } }
            })
          }
        }

        // Update empty stock: we received returnedQty
        if (returnedQty > 0) {
          await tx.product.update({
            where: { id: Number(item.product_id) },
            data: { stock_empty: { increment: returnedQty } }
          })
        }

        // Record stock movement (Sale)
        await tx.stockMovement.create({
          data: {
            product_id: Number(item.product_id),
            movement_type: "VENTA",
            quantity_full_change: -Number(item.quantity),
            quantity_empty_change: returnedQty,
            description: `Venta #${order.id}`
          }
        })
      }
    }
  })

  revalidatePath("/sales")
  revalidatePath("/stock")
  revalidatePath("/loans")
  revalidatePath("/products")
}

export async function getOrder(id: number) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      client: true,
      items: { include: { product: true } }
    }
  })
}

export async function completePendingOrder(orderId: number, paymentMethod: PaymentMethod, empty_returned: Record<string, number>) {
  const order = await getOrder(orderId)
  if (!order || order.status === "COMPLETADO") return

  await prisma.$transaction(async (tx) => {
    // 1. Mark order as completed
    await tx.order.update({
      where: { id: orderId },
      data: { status: "COMPLETADO", payment_method: paymentMethod, completed_at: new Date() }
    })

    // 2. Loop through items to update stock and loans
    for (const item of order.items) {
      // Decrease full stock
      await tx.product.update({
        where: { id: item.product_id },
        data: { stock_full: { decrement: item.quantity } }
      })

      const returnedQty = Number(empty_returned[item.product_id] || 0)
      const missingQty = item.quantity - returnedQty

      if (missingQty > 0) {
        let loanAcc = await tx.clientCylinderLoan.findFirst({
          where: { client_id: order.client_id, product_id: item.product_id }
        })
        if (!loanAcc) {
          await tx.clientCylinderLoan.create({
            data: { client_id: order.client_id, product_id: item.product_id, quantity_owed: missingQty }
          })
        } else {
          await tx.clientCylinderLoan.update({
            where: { id: loanAcc.id },
            data: { quantity_owed: { increment: missingQty } }
          })
        }
      }

      if (returnedQty > 0) {
        await tx.product.update({
          where: { id: item.product_id },
          data: { stock_empty: { increment: returnedQty } }
        })
      }

      await tx.stockMovement.create({
        data: {
          product_id: item.product_id,
          movement_type: "VENTA",
          quantity_full_change: -item.quantity,
          quantity_empty_change: returnedQty,
          description: `Completado Pedido #${order.id}`
        }
      })
    }
  })

  revalidatePath("/sales")
  revalidatePath("/stock")
  revalidatePath("/loans")
  revalidatePath("/products")
}
