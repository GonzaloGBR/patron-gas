const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = [
    { brand: 'HIPERGAS', weight: 10, dom: 6500, est: 6000, may: 5500 },
    { brand: 'YPF', weight: 10, dom: 11000, est: 10000, may: 8500 },
    { brand: 'VARIGAS', weight: 10, dom: 7000, est: 6500, may: 6000 },
    { brand: 'HIPERGAS', weight: 15, dom: 10000, est: 9500, may: 9000 },
    { brand: 'HIPERGAS', weight: 45, dom: 35000, est: 33000, may: 30000 }
  ];

  console.log('Inserting products...');

  for (const p of products) {
    const createdProduct = await prisma.product.create({
      data: {
        brand: p.brand,
        weight: p.weight,
        stock_full: 10,
        stock_empty: 10,
        prices: {
          create: [
            { client_type: 'DOMICILIO', price: p.dom },
            { client_type: 'ESTABLECIMIENTO', price: p.est },
            { client_type: 'MAYORISTA', price: p.may }
          ]
        }
      }
    });
    console.log(`Created: ${createdProduct.brand} ${createdProduct.weight}kg`);
  }
}

main()
  .catch((e) => console.log(e.message))
  .finally(() => prisma.$disconnect());
