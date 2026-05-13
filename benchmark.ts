import { POST } from './src/app/api/orders/route';
import { NextRequest } from 'next/server';
import { prisma } from './src/lib/db';

async function run() {
  const items = Array.from({ length: 50 }).map((_, i) => ({
    id: `prod${i}`,
    name: `Product ${i}`,
    quantity: 1,
    price: 10
  }));

  // Create products in DB
  await prisma.product.createMany({
    data: items.map(i => ({ id: i.id, name: i.name, price: i.price, stock: 1000, description: "Test", categories: "Test", img: "[]", hoverImg: null, originalPrice: null, badge: null, createdAt: new Date(), updatedAt: new Date() })),
  });

  // Run benchmark multiple times to get a stable average
  const times: number[] = [];
  for (let iter = 0; iter < 10; iter++) {
    const req = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        phone: `123456789${iter}`,
        email: `test${iter}@example.com`,
        zila: 'Test',
        upozila: 'Test',
        shippingAddress: 'Test',
        items
      })
    });

    // warm up prisma for the first run, exclude from metrics
    if (iter === 0) {
      await POST(req);
      continue;
    }

    const start = performance.now();
    await POST(req);
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`Average Execution time (50 items): ${avg.toFixed(2)} ms`);
  console.log(`Min: ${Math.min(...times).toFixed(2)} ms, Max: ${Math.max(...times).toFixed(2)} ms`);

  // cleanup
  await prisma.product.deleteMany({ where: { categories: "Test" }});
  await prisma.customer.deleteMany({ where: { zila: "Test" }});
  await prisma.order.deleteMany({ where: { zila: "Test" }});
}
run();
