"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ClientType } from "@prisma/client"

function parseClientType(raw: string): ClientType | null {
  if (
    raw === "DOMICILIO" ||
    raw === "ESTABLECIMIENTO" ||
    raw === "MAYORISTA"
  ) {
    return raw
  }
  return null
}

export async function getProductsWithPrices() {
  return await prisma.product.findMany({
    include: {
      prices: true
    },
    orderBy: [
      { brand: "asc" },
      { weight: "asc" }
    ]
  })
}

export async function updateProductPrices(
  productId: number,
  prices: { client_type: string; price: number }[]
) {
  for (const item of prices) {
    const client_type = parseClientType(item.client_type)
    if (!client_type) continue

    const existingPrice = await prisma.price.findFirst({
      where: {
        product_id: productId,
        client_type,
      },
    })

    if (existingPrice) {
      await prisma.price.update({
        where: { id: existingPrice.id },
        data: { price: item.price },
      })
    } else {
      await prisma.price.create({
        data: {
          product_id: productId,
          client_type,
          price: item.price,
        },
      })
    }
  }

  revalidatePath("/products")
}
