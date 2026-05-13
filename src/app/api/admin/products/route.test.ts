/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect, vi } from "vitest";
import { NextRequest } from "next/server.js";
import { prisma } from "../../../../lib/db";
import * as auth from "../../../../lib/auth";
vi.mock("next-auth/next", () => ({ getServerSession: vi.fn().mockResolvedValue(true) }));


/**
 * 🧪 Products API PATCH handler tests
 *
 * To run these tests:
 * node --experimental-strip-types --test src/app/api/admin/products/route.test.ts
 */

process.env.ADMIN_TOKEN = "test-token";

test("PATCH /api/admin/products - Missing ID", async () => {
    vi.spyOn(auth, "checkAdminAuth").mockResolvedValue(true);
    const { PATCH } = await import("./route");

    const req = new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify({})
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing product ID");
});

test("PATCH /api/admin/products - Product Not Found", async () => {
    vi.spyOn(auth, "checkAdminAuth").mockResolvedValue(true);
    const { PATCH } = await import("./route");

    // Mock prisma.product.findUnique
    const findUniqueMock = vi.spyOn(prisma.product, "findUnique").mockResolvedValue(null as any);

vi.mock('@/lib/db', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

    const res = await PATCH(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Product not found");

    findUniqueMock.mockRestore();
});

test("PATCH /api/admin/products - Invalid Name", async () => {
    vi.spyOn(auth, "checkAdminAuth").mockResolvedValue(true);
    const { PATCH } = await import("./route");

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify(body)
    });
  };

  it('should return 400 if ID is missing', async () => {
    const req = createRequest({});
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Name must be a non-empty string");
});

test("PATCH /api/admin/products - Invalid Price", async () => {
    vi.spyOn(auth, "checkAdminAuth").mockResolvedValue(true);
    const { PATCH } = await import("./route");

  it('should return 404 if product is not found', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    const req = createRequest({ id: "non-existent" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid price");
});

test("PATCH /api/admin/products - Invalid Stock", async () => {
    vi.spyOn(auth, "checkAdminAuth").mockResolvedValue(true);
    const { PATCH } = await import("./route");

    const req = new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify({ id: "123", stock: "abc" })
    });

  it('should return 400 for invalid price', async () => {
    const req = createRequest({ id: "123", price: "invalid" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid stock");
});

test("PATCH /api/admin/products - Successful Update", async () => {
    vi.spyOn(auth, "checkAdminAuth").mockResolvedValue(true);
    const { PATCH } = await import("./route");

    const mockProduct = { id: "123", name: "Old Name", price: 10, stock: 5 };
    const findUniqueMock = vi.spyOn(prisma.product, "findUnique").mockResolvedValue(mockProduct as any);
    const updateMock = vi.spyOn(prisma.product, "update").mockImplementation(async ({ data }: any) => ({ ...mockProduct, ...data }) as any);

    // Using vi.fn().mockImplementation to simulate the update
    prismaMock.product.update.mockImplementation(((args: any) => Promise.resolve({ ...mockProduct, ...args.data })) as any);

    const req = createRequest({ id: "123", name: "New Name", price: 15, stock: 10 });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("New Name");
    expect(data.price).toBe(15);
    expect(data.stock).toBe(10);

    findUniqueMock.mockRestore();
    updateMock.mockRestore();
});

test("PATCH /api/admin/products - Invalid Original Price", async () => {
    vi.spyOn(auth, "checkAdminAuth").mockResolvedValue(true);
    const { PATCH } = await import("./route");

    const req = new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify({ id: "123", originalPrice: "invalid" })
    });

    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid original price");
});

test("PATCH /api/admin/products - Clearing Original Price", async () => {
    vi.spyOn(auth, "checkAdminAuth").mockResolvedValue(true);
    const { PATCH } = await import("./route");

    const mockProduct = { id: "123", name: "Old Name", price: 10, stock: 5, originalPrice: 20 };
    const findUniqueMock = vi.spyOn(prisma.product, "findUnique").mockResolvedValue(mockProduct as any);
    const updateMock = vi.spyOn(prisma.product, "update").mockImplementation(async ({ data }: any) => ({ ...mockProduct, ...data }) as any);

    const req = new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify({ id: "123", originalPrice: null })
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.originalPrice).toBe(null);

    findUniqueMock.mockRestore();
    updateMock.mockRestore();
});

test("PATCH /api/admin/products - Updating All Fields", async () => {
    vi.spyOn(auth, "checkAdminAuth").mockResolvedValue(true);
    const { PATCH } = await import("./route");

    const mockProduct = { id: "123", name: "Old", description: "Old desc", price: 10, originalPrice: 20, img: "old.jpg", hoverImg: "old_h.jpg", categories: "old,cat", badge: "Old Badge", stock: 5 };
    const findUniqueMock = vi.spyOn(prisma.product, "findUnique").mockResolvedValue(mockProduct as any);
    const updateMock = vi.spyOn(prisma.product, "update").mockImplementation(async ({ data }: any) => ({ ...mockProduct, ...data }) as any);

    const req = new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify({
            id: "123",
            name: " New Name ",
            description: "New desc",
            price: "15.5",
            originalPrice: "25.5",
            img: "new.jpg",
            hoverImg: "new_h.jpg",
            categories: "new,cat",
            badge: "New Badge",
            stock: "10"
        })
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.name).toBe("New Name");
    expect(data.description).toBe("New desc");
    expect(data.price).toBe(15.5);
    expect(data.originalPrice).toBe(25.5);
    expect(data.img).toBe("new.jpg");
    expect(data.hoverImg).toBe("new_h.jpg");
    expect(data.categories).toBe("new,cat");
    expect(data.badge).toBe("New Badge");
    expect(data.stock).toBe(10);

    findUniqueMock.mockRestore();
    updateMock.mockRestore();
});
