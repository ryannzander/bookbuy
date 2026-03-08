import type { PrismaClient } from "@prisma/client";
import { ListingStatus, ListingType } from "@prisma/client";
import { createNotification } from "@/server/api/notifications";

export async function resolveAuctionIfEnded(db: PrismaClient, listingId: string) {
  const listing = await db.listing.findUnique({
    where: { id: listingId },
    include: { bids: { orderBy: { amount: "desc" }, take: 1, include: { user: true } }, seller: true },
  });
  if (!listing || listing.type !== ListingType.AUCTION || listing.status !== ListingStatus.AVAILABLE) {
    return;
  }
  const endsAt = listing.auctionEndsAt;
  if (!endsAt || new Date() < endsAt) return;
  const winningBid = listing.bids[0];
  if (!winningBid) {
    await db.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.AUCTION_ENDED },
    });
    return;
  }
  await db.$transaction([
    db.purchase.create({
      data: {
        listingId: listing.id,
        buyerId: winningBid.userId,
        finalPrice: winningBid.amount,
      },
    }),
    db.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.AUCTION_ENDED },
    }),
  ]);
  await createNotification(db, {
    userId: winningBid.userId,
    type: "AUCTION_WON",
    title: "You won an auction!",
    body: `You won "${listing.title}" at $${winningBid.amount}. Contact the seller to arrange payment.`,
    linkUrl: `/listings/${listing.id}`,
  });
  await createNotification(db, {
    userId: listing.sellerId,
    type: "AUCTION_ENDED",
    title: "Auction ended",
    body: `"${listing.title}" sold to the highest bidder for $${winningBid.amount}.`,
    linkUrl: `/listings/${listing.id}`,
  });
}
