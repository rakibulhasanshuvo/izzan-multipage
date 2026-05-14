import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { POST } from "./route";

describe("Orders API", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("POST /api/orders - Missing required fields", async () => {
        const req = new NextRequest("http://localhost/api/orders", {
            method: "POST",
            body: JSON.stringify({})
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Missing required fields or empty cart");
    });

    it("POST /api/orders - Empty cart", async () => {
        const req = new NextRequest("http://localhost/api/orders", {
            method: "POST",
            body: JSON.stringify({
                name: "Test User",
                phone: "1234567890",
                zila: "Dhaka",
                upozila: "Savar",
                shippingAddress: "123 Test St",
                items: []
            })
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Missing required fields or empty cart");
    });

    it("POST /api/orders - Invalid item structure", async () => {
        const req = new NextRequest("http://localhost/api/orders", {
            method: "POST",
            body: JSON.stringify({
                name: "Test User",
                phone: "1234567890",
                zila: "Dhaka",
                upozila: "Savar",
                shippingAddress: "123 Test St",
                items: [{ id: "1" }] // Missing quantity
            })
        });

        vi.spyOn(prisma.customer, "findUnique").mockResolvedValue(null);
        vi.spyOn(prisma, "$transaction").mockImplementation(async (callback) => {
            return callback(prisma);
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toMatch(/Invalid item structure/);
    });

    it("POST /api/orders - Successful order for new customer", async () => {
        const req = new NextRequest("http://localhost/api/orders", {
            method: "POST",
            body: JSON.stringify({
                name: "New User",
                phone: "1234567890",
                email: "new@example.com",
                zila: "Dhaka",
                upozila: "Savar",
                shippingAddress: "123 Test St",
                items: [{ id: "1", quantity: 2 }]
            })
        });

        vi.spyOn(prisma.customer, "findUnique").mockResolvedValue(null);
        vi.spyOn(prisma.customer, "create").mockResolvedValue({
            id: "customer-1",
            name: "New User",
            phone: "1234567890",
            email: "new@example.com",
            location: "123 Test St",
            zila: "Dhaka",
            upozila: "Savar",
            tier: "Bronze",
            totalSpend: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const mockProduct = {
            id: "1", name: "Product 1", price: 100, stock: 10,
            description: null, img: "", hoverImg: null, categories: "",
            badge: null, originalPrice: null,
            createdAt: new Date(), updatedAt: new Date()
        };
        vi.spyOn(prisma.product, "findUnique").mockResolvedValue(mockProduct);
        vi.spyOn(prisma.product, "update").mockResolvedValue(mockProduct);
        vi.spyOn(prisma.order, "create").mockResolvedValue({
            id: "order-1",
            customerId: "customer-1",
            totalAmount: 200,
            status: "pending",
            items: "cod",
            zila: "Dhaka",
            upozila: "Savar",
            shippingAddress: "123 Test St",
            customerName: "New User",
            customerEmail: "new@example.com",
            customerPhone: "1234567890",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        vi.spyOn(prisma, "$transaction").mockImplementation(async (callback) => {
            return callback(prisma);
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.orderId).toBe("order-1");
    });

    it("POST /api/orders - Successful order for existing customer", async () => {
        const req = new NextRequest("http://localhost/api/orders", {
            method: "POST",
            body: JSON.stringify({
                name: "Existing User",
                phone: "0987654321",
                zila: "Dhaka",
                upozila: "Savar",
                shippingAddress: "123 Test St",
                items: [{ id: "2", quantity: 1 }]
            })
        });

        vi.spyOn(prisma.customer, "findUnique").mockResolvedValue({
            id: "customer-2",
            name: "Existing User",
            phone: "0987654321",
            email: null,
            location: "Old Address",
            zila: "Dhaka",
            upozila: "Savar",
            tier: "Bronze",
            totalSpend: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        vi.spyOn(prisma.customer, "update").mockResolvedValue({
            id: "customer-2",
            name: "Existing User",
            phone: "0987654321",
            email: null,
            location: "123 Test St",
            zila: "Dhaka",
            upozila: "Savar",
            tier: "Bronze",
            totalSpend: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const mockProduct = {
            id: "2", name: "Product 2", price: 50, stock: 5,
            description: null, img: "", hoverImg: null, categories: "",
            badge: null, originalPrice: null,
            createdAt: new Date(), updatedAt: new Date()
        };
        vi.spyOn(prisma.product, "findUnique").mockResolvedValue(mockProduct);
        vi.spyOn(prisma.product, "update").mockResolvedValue(mockProduct);
        vi.spyOn(prisma.order, "create").mockResolvedValue({
            id: "order-2",
            customerId: "customer-2",
            totalAmount: 50,
            status: "pending",
            items: "cod",
            zila: "Dhaka",
            upozila: "Savar",
            shippingAddress: "123 Test St",
            customerName: "New User",
            customerEmail: "new@example.com",
            customerPhone: "1234567890",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        vi.spyOn(prisma, "$transaction").mockImplementation(async (callback) => {
            return callback(prisma);
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.orderId).toBe("order-2");
    });

    it("POST /api/orders - Insufficient stock", async () => {
        const req = new NextRequest("http://localhost/api/orders", {
            method: "POST",
            body: JSON.stringify({
                name: "Test User",
                phone: "1234567890",
                zila: "Dhaka",
                upozila: "Savar",
                shippingAddress: "123 Test St",
                items: [{ id: "3", quantity: 10 }]
            })
        });

        vi.spyOn(prisma.customer, "findUnique").mockResolvedValue(null);

        const mockProduct = {
            id: "3", name: "Product 3", price: 100, stock: 5, // Only 5 in stock, ordered 10
            description: null, img: "", hoverImg: null, categories: "",
            badge: null, originalPrice: null,
            createdAt: new Date(), updatedAt: new Date()
        };
        vi.spyOn(prisma.product, "findUnique").mockResolvedValue(mockProduct);

        vi.spyOn(prisma, "$transaction").mockImplementation(async (callback) => {
            return callback(prisma);
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toMatch(/Insufficient stock for Product 3/);
    });

    it("POST /api/orders - Product not found", async () => {
        const req = new NextRequest("http://localhost/api/orders", {
            method: "POST",
            body: JSON.stringify({
                name: "Test User",
                phone: "1234567890",
                zila: "Dhaka",
                upozila: "Savar",
                shippingAddress: "123 Test St",
                items: [{ id: "non-existent", quantity: 1 }]
            })
        });

        vi.spyOn(prisma.customer, "findUnique").mockResolvedValue(null);
        vi.spyOn(prisma.product, "findUnique").mockResolvedValue(null);

        vi.spyOn(prisma, "$transaction").mockImplementation(async (callback) => {
            return callback(prisma);
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toMatch(/Product not found/);
    });
});
