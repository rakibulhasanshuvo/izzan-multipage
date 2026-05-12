# Checkout Function Audit Report

## 1. Critical Security Flaw: Price Tampering
**Issue:** The API (`POST /api/orders/route.ts`) trusts the `totalAmount` provided by the client in the request payload. A malicious user can intercept the request and manipulate `totalAmount` to be `0` or an artificially low number, successfully placing an order without paying the correct price.
**Fix:** The backend must independently calculate the true order total by fetching the exact prices of the items from the database before order creation.

## 2. Missing Inventory Management: Stock Not Deducted
**Issue:** When an order is placed, the API does not decrement the `stock` of the purchased products. Because the `Product` model has a `stock` field, failing to reduce it upon checkout will eventually lead to overselling.
**Fix:** Add logic to decrease the `stock` attribute of each purchased product.

## 3. Data Integrity Risks: Lack of Database Transactions
**Issue:** The customer's `totalSpend` is incremented in an independent Prisma query *before* the `Order` is created. If order creation fails due to a network or database issue, the customer's `totalSpend` is permanently increased, corrupting data.
**Fix:** Wrap the `Customer` upsert, `Product` stock deductions, and `Order` creation in a single atomic `prisma.$transaction`.

## 4. Unique Constraint Violation Risks
**Issue:** If an existing customer (looked up by phone number) attempts to check out with an email address that is already registered to *another* customer, `prisma.customer.update` will throw a Unique Constraint violation error, causing the checkout process to crash.
**Fix:** Handle email updates gracefully or implement validation to ensure emails are unique.

## 5. Weak Input Validation
**Issue:** The `items` array structure is not validated before being saved.
**Fix:** Ensure `items` is an array and contains proper objects with expected attributes before proceeding.
