/**
 * Crea o actualiza un usuario para iniciar sesión (NextAuth / Credentials).
 *
 * Uso:
 *   node add-user.js <email> "<nombre visible>" <contraseña>
 *
 * Ejemplo:
 *   node add-user.js dueno@empresa.com "Dueño" MiClaveSegura123
 *
 * Si el email ya existe, se actualiza nombre y contraseña.
 */

require("dotenv").config()

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

async function main() {
  const [, , email, name, password] = process.argv

  if (!email || !name || !password) {
    console.error(
      "Uso: node add-user.js <email> \"<nombre>\" <contraseña>\n" +
        "Ejemplo: node add-user.js juan@mail.com \"Juan Pérez\" secreto123"
    )
    process.exit(1)
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("El email no parece válido.")
    process.exit(1)
  }

  if (password.length < 4) {
    console.error("La contraseña debe tener al menos 4 caracteres.")
    process.exit(1)
  }

  const password_hash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: {
      name: name.trim(),
      password_hash,
    },
    create: {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password_hash,
    },
  })

  console.log("Usuario listo para iniciar sesión:", user.email, `(${user.name})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
