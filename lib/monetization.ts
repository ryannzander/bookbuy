/**
 * Platform monetization config.
 * Override via env: PLATFORM_FEE_PERCENT, BOOST_PRICE_CENTS.
 */

export const PLATFORM_FEE_PERCENT =
  typeof process.env.PLATFORM_FEE_PERCENT !== "undefined"
    ? Number(process.env.PLATFORM_FEE_PERCENT)
    : 5;

export const BOOST_PRICE_CENTS =
  typeof process.env.BOOST_PRICE_CENTS !== "undefined"
    ? Number(process.env.BOOST_PRICE_CENTS)
    : 299;

export const BOOST_DAYS = 14;

export function computePlatformFeeCents(amountCents: number): number {
  return Math.round((amountCents * PLATFORM_FEE_PERCENT) / 100);
}
