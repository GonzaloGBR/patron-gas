/**
 * Carga catálogo de garrafas (productos + precios por tipo de cliente).
 *
 * Tipos de cliente en la app:
 *   DOMICILIO          → precio "domicilio"
 *   ESTABLECIMIENTO    → sandwichería / comedor / ext.
 *   MAYORISTA          → por mayor
 *
 * Catálogo actual: solo 10 y 15 kg (sin 45 kg).
 *   HIPERGAS 10 y 15 | VARIGAS 10 | YPF 10
 *
 * Idempotente: upsert por marca + kg. Intenta borrar envases viejos (45 kg, etc.) si no tienen referencias.
 *
 *   node seed.js
 */
require("dotenv").config()

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/** dom = DOMICILIO, est = ESTABLECIMIENTO, may = MAYORISTA */
const products = [
  { brand: "HIPERGAS", weight: 10, dom: 19000, est: 17500, may: 15000 },
  { brand: "HIPERGAS", weight: 15, dom: 27500, est: 26000, may: 23000 },
  { brand: "VARIGAS", weight: 10, dom: 19000, est: 17500, may: 15000 },
  { brand: "YPF", weight: 10, dom: 24000, est: 22000, may: 18500 },
]

async function upsertProductWithPrices(p) {
  const existing = await prisma.product.findFirst({
    where: { brand: p.brand, weight: p.weight },
  })

  const priceRows = [
    { client_type: "DOMICILIO", price: p.dom },
    { client_type: "ESTABLECIMIENTO", price: p.est },
    { client_type: "MAYORISTA", price: p.may },
  ]

  if (existing) {
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        stock_full: 10,
        stock_empty: 10,
      },
    })
    await prisma.price.deleteMany({ where: { product_id: existing.id } })
    await prisma.price.createMany({
      data: priceRows.map((row) => ({
        product_id: existing.id,
        client_type: row.client_type,
        price: row.price,
      })),
    })
    return { id: existing.id, updated: true }
  }

  const created = await prisma.product.create({
    data: {
      brand: p.brand,
      weight: p.weight,
      stock_full: 10,
      stock_empty: 10,
      prices: {
        create: priceRows.map((row) => ({
          client_type: row.client_type,
          price: row.price,
        })),
      },
    },
  })
  return { id: created.id, updated: false }
}

/** Quita 45 kg y combinaciones que ya no ofrecés (p. ej. YPF 15), si no hay ventas/préstamos/movimientos. */
async function pruneObsoleteCatalog() {
  const obsolete = await prisma.product.findMany({
    where: {
      OR: [
        { weight: 45 },
        { AND: [{ brand: "YPF" }, { weight: 15 }] },
        { AND: [{ brand: "VARIGAS" }, { weight: 15 }] },
      ],
    },
  })

  for (const prod of obsolete) {
    const [orders, loans, movements] = await Promise.all([
      prisma.orderItem.count({ where: { product_id: prod.id } }),
      prisma.clientCylinderLoan.count({ where: { product_id: prod.id } }),
      prisma.stockMovement.count({ where: { product_id: prod.id } }),
    ])

    if (orders > 0 || loans > 0 || movements > 0) {
      console.warn(
        `No se eliminó ${prod.brand} ${prod.weight}kg: tiene historial (pedidos/préstamos/movimientos).`
      )
      continue
    }

    await prisma.price.deleteMany({ where: { product_id: prod.id } })
    await prisma.product.delete({ where: { id: prod.id } })
    console.log(`Eliminado del catálogo: ${prod.brand} ${prod.weight}kg`)
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("Falta DATABASE_URL en .env")
    process.exit(1)
  }

  console.log(
    "Cargando catálogo: HIPERGAS 10/15 kg, VARIGAS 10 kg, YPF 10 kg (sin 45 kg)..."
  )

  for (const p of products) {
    const { updated } = await upsertProductWithPrices(p)
    console.log(
      `${updated ? "Actualizado" : "Creado"}: ${p.brand} ${p.weight}kg → DOM $${p.dom} | EST $${p.est} | MAY $${p.may}`
    )
  }

  await pruneObsoleteCatalog()
  console.log("Listo.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
