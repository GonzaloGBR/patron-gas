const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@patrondelgas.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password_hash: hashedPassword,
    },
    create: {
      email,
      name: 'Administrador',
      password_hash: hashedPassword,
    },
  });

  console.log('Admin user ready:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
