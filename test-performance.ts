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
    data: items.map(i => ({ id: i.id, name: i.name, price: i.price, stock: 100, description: "Test", categories: "Test", img: "[]", hoverImg: null, originalPrice: null, badge: null, createdAt: new Date(), updatedAt: new Date() })),
  });

  const req = new NextRequest('http://localhost:3000/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test User',
      phone: '1234567890',
      email: 'test@example.com',
      zila: 'Test',
      upozila: 'Test',
      shippingAddress: 'Test',
      items
    })
  });

  const start = performance.now();
  const response = await POST(req);
  const end = performance.now();
  console.log(`Status: ${response.status}`);
  const data = await response.json()
  console.log(data);
  console.log(`Execution time: ${end - start} ms`);

  // cleanup
  await prisma.product.deleteMany({ where: { categories: "Test" }});
  await prisma.customer.deleteMany({ where: { phone: "1234567890" }});
  if (data.orderId) {
    await prisma.order.deleteMany({ where: { id: data.orderId }});
  }
}
run();
