-- AlterTable: product names must be unique so seeding can upsert on the
-- natural key without changing IDs (which would orphan order history).
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
