#!/bin/bash
git restore src/app/api/orders/route.test.ts src/app/api/admin/products/route.test.ts src/lib/auth.ts
sed -i '/<<<<<<</,/>>>>>>>/d' src/lib/auth.ts || true
