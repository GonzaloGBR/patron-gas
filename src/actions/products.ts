"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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

export async function updateProductPrices(productId: number, prices: { client_type: string, price: number }[]) {
  // Update each price
  for (const item of prices) {
    const existingPrice = await prisma.price.findFirst({
      where: {
        product_id: productId,
        client_type: item.client_type as any
      }
    })

    if (existingPrice) {
      await prisma.price.update({
        where: { id: existingPrice.id },
        data: { price: item.price }
      })
    } else {
      await prisma.price.create({
        data: {
          product_id: productId,
          client_type: item.client_type as any,
          price: item.price
        }
      })
    }
  }

  revalidatePath("/products")
}
