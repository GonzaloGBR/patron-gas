/**
 * Crea o actualiza el usuario principal del panel.
 * Email y contraseña: ver constantes abajo.
 */
require("dotenv").config()

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

const email = "patrongas@patrongas.com"
const password = "patrongas123"
const name = "Patrón del Gas"

async function main() {
  const password_hash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password_hash,
    },
    create: {
      email,
      name,
      password_hash,
    },
  })

  console.log("Usuario listo:", user.email, `(${user.name})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
