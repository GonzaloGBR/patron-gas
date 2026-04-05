const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.findFirst();
  console.log("Found product:", p);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.stockMovement.create({
        data: {
          product_id: p.id,
          movement_type: "INGRESO_PROVEEDOR",
          quantity_full_change: 10,
          quantity_empty_change: 0,
          description: "Test"
        }
      });
      console.log("Movement created");
    });
  } catch (e) {
    console.error("TRANSACTION ERROR:", e.message);
  }
}

main().finally(() => prisma.$disconnect());
