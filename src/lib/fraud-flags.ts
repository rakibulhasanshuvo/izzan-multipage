import { prisma } from "./db";

// A phone number with this many non-cancelled orders inside the window is
// flagged as a possible fake-order / duplicate-order scam pattern.
const DUPLICATE_ORDER_THRESHOLD = 3;
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Returns phone numbers with several recent active orders so the admin
 * orders view can badge them for manual review. Cancelled orders are
 * excluded so cleared scams do not keep flagging future customers who
 * happen to share the number.
 *
 * Lives outside the page component: it performs request-time IO and clock
 * reads, which must stay out of render scope.
 */
export async function findFlaggedPhones(): Promise<string[]> {
  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);
  const duplicateGroups = await prisma.order.groupBy({
    by: ["customerPhone"],
    where: {
      createdAt: { gte: since },
      status: { not: "Cancelled" },
    },
    _count: { _all: true },
    having: {
      customerPhone: {
        _count: { gte: DUPLICATE_ORDER_THRESHOLD },
      },
    },
  });
  return duplicateGroups.map((group) => group.customerPhone);
}
