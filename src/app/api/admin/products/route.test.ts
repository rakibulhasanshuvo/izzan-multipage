import test from "node:test";
import assert from "node:assert";
import { mock } from "node:test";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/**
 * 🧪 Products API PATCH handler tests
 *
 * To run these tests:
 * node --experimental-strip-types --test src/app/api/admin/products/route.test.ts
 */

process.env.ADMIN_TOKEN = "test-token";

test("PATCH /api/admin/products - Missing ID", async () => {
    const { PATCH } = await import("./route");

    const req = new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify({})
    });

    const res = await PATCH(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, "Missing product ID");
});

test("PATCH /api/admin/products - Product Not Found", async () => {
    const { PATCH } = await import("./route");

    // Mock prisma.product.findUnique
    const findUniqueMock = mock.method(prisma.product, "findUnique", async () => null);

    const req = new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify({ id: "non-existent" })
    });

    const res = await PATCH(req);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.error, "Product not found");

    findUniqueMock.mock.restore();
});

test("PATCH /api/admin/products - Invalid Name", async () => {
    const { PATCH } = await import("./route");

    const req = new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify({ id: "123", name: "" })
    });

    const res = await PATCH(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, "Name must be a non-empty string");
});

test("PATCH /api/admin/products - Invalid Price", async () => {
    const { PATCH } = await import("./route");

    const req = new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify({ id: "123", price: "invalid" })
    });

    const res = await PATCH(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, "Invalid price");
});

test("PATCH /api/admin/products - Invalid Stock", async () => {
    const { PATCH } = await import("./route");

    const req = new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify({ id: "123", stock: "abc" })
    });

    const res = await PATCH(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, "Invalid stock");
});

test("PATCH /api/admin/products - Successful Update", async () => {
    const { PATCH } = await import("./route");

    const mockProduct = { id: "123", name: "Old Name", price: 10, stock: 5 };
    const findUniqueMock = mock.method(prisma.product, "findUnique", async () => mockProduct);
    const updateMock = mock.method(prisma.product, "update", async ({ data }: { data: Parameters<typeof prisma.product.update>[0]['data'] }) => ({ ...mockProduct, ...data }));

    const req = new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify({ id: "123", name: "New Name", price: 15, stock: 10 })
    });

    const res = await PATCH(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.name, "New Name");
    assert.strictEqual(data.price, 15);
    assert.strictEqual(data.stock, 10);

    findUniqueMock.mock.restore();
    updateMock.mock.restore();
});
