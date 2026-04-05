/**
 * Borra todos los datos operativos y deja intacta la tabla `users` (inicio de sesión).
 *
 * Uso:
 *   node clear-db.js --confirm
 *
 * Después, para productos/precios de prueba:
 *   node seed.js
 *
 * Los usuarios NO se borran. Para crear uno nuevo:
 *   node add-user.js email@x.com "Nombre" contraseña
 *   (o node create_admin.js para el admin por defecto)
 *
 * Sin --confirm no hace nada.
 */

require("dotenv").config()

if (process.argv[2] !== "--confirm") {
  console.error(
    "Este script borra clientes, ventas, stock, préstamos y productos.\n" +
      "Los usuarios de login NO se borran.\n" +
      "Ejecutá: node clear-db.js --confirm"
  )
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL en el entorno o en .env")
  process.exit(1)
}

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany()
    await tx.order.deleteMany()
    await tx.stockMovement.deleteMany()
    await tx.clientCylinderLoan.deleteMany()
    await tx.price.deleteMany()
    await tx.product.deleteMany()
    await tx.client.deleteMany()
  })

  const userCount = await prisma.user.count()
  console.log(
    "Listo: se vaciaron pedidos, movimientos, préstamos, precios, productos y clientes."
  )
  console.log(`Usuarios conservados: ${userCount}`)
  console.log("Cargá productos de prueba con: node seed.js")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
