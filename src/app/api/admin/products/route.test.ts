import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  checkAdminAuth: vi.fn().mockReturnValue(true),
  withAuth: vi.fn((handler) => handler),
}));

import { NextRequest } from "next/server";
import * as auth from "../../../../lib/auth";
import { PATCH } from './route';

process.env.ADMIN_TOKEN = "test-token";

describe("Admin Products API", () => {
    it("PATCH /api/admin/products - Missing ID", async () => {
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

    it("PATCH /api/admin/products - Product Not Found", async () => {
        const { PATCH } = await import("./route");

        vi.spyOn(prisma.product, "findUnique").mockResolvedValue(null);

        const req = new NextRequest("http://localhost/api/admin/products", {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer test-token"
            },
            body: JSON.stringify({ id: "non-existent" })
        });

        const res = await PATCH(req);
        expect(res.status).toBe(404);
        const data = await res.json();
        expect(data.error).toBe("Product not found");

        vi.restoreAllMocks();
    });

    it("PATCH /api/admin/products - Invalid Name", async () => {
        const { PATCH } = await import("./route");

        const req = new NextRequest("http://localhost/api/admin/products", {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer test-token"
            },
            body: JSON.stringify({ id: "123", name: "" })
        });

        const res = await PATCH(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Name must be a non-empty string");
    });

    it("PATCH /api/admin/products - Invalid Price", async () => {
        const { PATCH } = await import("./route");

        const req = new NextRequest("http://localhost/api/admin/products", {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer test-token"
            },
            body: JSON.stringify({ id: "123", price: "invalid" })
        });

        const res = await PATCH(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid price");
    });

    it("PATCH /api/admin/products - Invalid Stock", async () => {
        const { PATCH } = await import("./route");

        const req = new NextRequest("http://localhost/api/admin/products", {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer test-token"
            },
            body: JSON.stringify({ id: "123", stock: "abc" })
        });

        const res = await PATCH(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Invalid stock");
    });

    it("PATCH /api/admin/products - Successful Update", async () => {
        const { PATCH } = await import("./route");

        const mockProduct = {
            id: "123", name: "Old Name", price: 10, stock: 5,
            description: null, img: "", hoverImg: null, categories: "",
            badge: null, originalPrice: null,
            createdAt: new Date(), updatedAt: new Date()
        };
        vi.spyOn(prisma.product, "findUnique").mockResolvedValue(mockProduct);
        vi.spyOn(prisma.product, "update").mockResolvedValue({ ...mockProduct, name: "New Name", price: 15, stock: 10 });

        const req = new NextRequest("http://localhost/api/admin/products", {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer test-token"
            },
            body: JSON.stringify({ id: "123", name: "New Name", price: 15, stock: 10 })
        });

        const res = await PATCH(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.name).toBe("New Name");
        expect(data.price).toBe(15);
        expect(data.stock).toBe(10);

        vi.restoreAllMocks();
    });
  };

  it('should return 400 if ID is missing', async () => {
    const req = createRequest({});
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing product ID");
  });

  it('should return 404 if product is not found', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    const req = createRequest({ id: "non-existent" });
    const res = await PATCH(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Product not found");
  });

  it('should return 400 for invalid price', async () => {
    const req = createRequest({ id: "123", price: "invalid" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid price");
  });

  it('should return 400 if stock is invalid', async () => {
    const req = createRequest({ id: '123', stock: 'abc' });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid stock");
  });

  it('should successfully update product', async () => {
    const mockProduct = { id: "123", name: "Old Name", price: 10, stock: 5 };
    prismaMock.product.findUnique.mockResolvedValue(mockProduct as any);

    prismaMock.product.update.mockImplementation(((args: any) => Promise.resolve({ ...mockProduct, ...args.data })) as any);

    const req = createRequest({ id: "123", name: "New Name", price: 15, stock: 10 });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("New Name");
    expect(data.price).toBe(15);
    expect(data.stock).toBe(10);
  });
});
