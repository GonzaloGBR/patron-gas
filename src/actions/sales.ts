"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { OrderStatus, PaymentMethod } from "@prisma/client"
import { logError } from "@/lib/log"

export type SaleActionResult = { ok: true } | { ok: false; error: string }

export type CreateSaleLinePayload = {
  product_id: number | string
  quantity: number | string
  unit_price: number | string
  subtotal: number | string
}

export type CreateSalePayload = {
  client_id: number | string
  status: string
  payment_method?: string | null
  total_amount: number | string
  items: CreateSaleLinePayload[]
  empty_returned?: Record<string, number>
}

/** Suma cantidades por producto (por si hay varias líneas del mismo envase). */
function aggregateFullNeeded(
  rows: { product_id: number | string; quantity: number | string }[]
): Map<number, number> {
  const need = new Map<number, number>()
  for (const row of rows) {
    const pid = Number(row.product_id)
    const qty = Number(row.quantity)
    if (!Number.isFinite(pid) || !Number.isFinite(qty)) continue
    need.set(pid, (need.get(pid) || 0) + qty)
  }
  return need
}

function parseInsufficientFullMessage(msg: string): string | null {
  if (!msg.startsWith("INSUFFICIENT_FULL:")) return null
  const parts = msg.split(":")
  const brand = parts[1] ?? "?"
  const weight = parts[2] ?? "?"
  const stock = parts[3] ?? "0"
  const asked = parts[4] ?? "0"
  return `No alcanza el stock de garrafas llenas: ${brand} ${weight}kg (disponibles: ${stock}, pedidas: ${asked}).`
}

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

export async function createSale(
  data: CreateSalePayload
): Promise<SaleActionResult> {
  const { client_id, status, payment_method, total_amount, items, empty_returned } =
    data

  try {
    await prisma.$transaction(async (tx) => {
      if (status === "COMPLETADO") {
        const need = aggregateFullNeeded(items)
        for (const [productId, qty] of need) {
          const prod = await tx.product.findUnique({ where: { id: productId } })
          if (!prod) {
            throw new Error("PRODUCT_NOT_FOUND")
          }
          if (prod.stock_full < qty) {
            throw new Error(
              `INSUFFICIENT_FULL:${prod.brand}:${prod.weight}:${prod.stock_full}:${qty}`
            )
          }
        }
      }

      const order = await tx.order.create({
        data: {
          client_id: Number(client_id),
          status: status as OrderStatus,
          payment_method: payment_method as PaymentMethod,
          total_amount,
          completed_at: status === "COMPLETADO" ? new Date() : null,
          items: {
            create: items.map((item) => ({
              product_id: Number(item.product_id),
              quantity: Number(item.quantity),
              unit_price_at_sale: item.unit_price,
              subtotal: item.subtotal,
            })),
          },
        },
      })

      if (status === "COMPLETADO") {
        for (const item of items) {
          await tx.product.update({
            where: { id: Number(item.product_id) },
            data: { stock_full: { decrement: Number(item.quantity) } },
          })

          const returnedQty = Number(empty_returned?.[item.product_id] || 0)

          if (returnedQty > 0) {
            await tx.product.update({
              where: { id: Number(item.product_id) },
              data: { stock_empty: { increment: returnedQty } },
            })
          }

          await tx.stockMovement.create({
            data: {
              product_id: Number(item.product_id),
              movement_type: "VENTA",
              quantity_full_change: -Number(item.quantity),
              quantity_empty_change: returnedQty,
              description: `Venta #${order.id}`,
            },
          })
        }
      }
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const ins = parseInsufficientFullMessage(msg)
    if (ins) return { ok: false, error: ins }
    if (msg === "PRODUCT_NOT_FOUND") {
      return { ok: false, error: "Uno de los productos de la venta no existe." }
    }
    logError("createSale", e)
    return {
      ok: false,
      error: "No se pudo registrar la venta. Revisá los datos o intentá de nuevo.",
    }
  }

  revalidatePath("/sales")
  revalidatePath("/stock")
  revalidatePath("/products")
  return { ok: true }
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

export async function completePendingOrder(
  orderId: number,
  paymentMethod: PaymentMethod,
  empty_returned: Record<string, number>
): Promise<SaleActionResult> {
  const order = await getOrder(orderId)
  if (!order) {
    return { ok: false, error: "No se encontró el pedido." }
  }
  if (order.status === "COMPLETADO") {
    return { ok: false, error: "Este pedido ya está completado." }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const need = aggregateFullNeeded(order.items)
      for (const [productId, qty] of need) {
        const prod = await tx.product.findUnique({ where: { id: productId } })
        if (!prod) {
          throw new Error("PRODUCT_NOT_FOUND")
        }
        if (prod.stock_full < qty) {
          throw new Error(
            `INSUFFICIENT_FULL:${prod.brand}:${prod.weight}:${prod.stock_full}:${qty}`
          )
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "COMPLETADO",
          payment_method: paymentMethod,
          completed_at: new Date(),
        },
      })

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: { stock_full: { decrement: item.quantity } },
        })

        const returnedQty = Number(empty_returned[item.product_id] || 0)

        if (returnedQty > 0) {
          await tx.product.update({
            where: { id: item.product_id },
            data: { stock_empty: { increment: returnedQty } },
          })
        }

        await tx.stockMovement.create({
          data: {
            product_id: item.product_id,
            movement_type: "VENTA",
            quantity_full_change: -item.quantity,
            quantity_empty_change: returnedQty,
            description: `Completado Pedido #${order.id}`,
          },
        })
      }
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const ins = parseInsufficientFullMessage(msg)
    if (ins) return { ok: false, error: ins }
    if (msg === "PRODUCT_NOT_FOUND") {
      return { ok: false, error: "Un producto del pedido ya no existe en el catálogo." }
    }
    logError("completePendingOrder", e)
    return {
      ok: false,
      error: "No se pudo completar el pedido. Intentá de nuevo.",
    }
  }

  revalidatePath("/sales")
  revalidatePath("/stock")
  revalidatePath("/products")
  return { ok: true }
}
