/**
 * Platform monetization config.
 * Override via env: PLATFORM_FEE_PERCENT, BOOST_PRICE_CENTS, FREE_LISTING_LIMIT, PRO_FEE_PERCENT.
 */

export const PLATFORM_FEE_PERCENT =
  typeof process.env.PLATFORM_FEE_PERCENT !== "undefined"
    ? Number(process.env.PLATFORM_FEE_PERCENT)
    : 5;

export const PRO_FEE_PERCENT =
  typeof process.env.PRO_FEE_PERCENT !== "undefined"
    ? Number(process.env.PRO_FEE_PERCENT)
    : 2;

export const BOOST_PRICE_CENTS =
  typeof process.env.BOOST_PRICE_CENTS !== "undefined"
    ? Number(process.env.BOOST_PRICE_CENTS)
    : 299;

export const BOOST_DAYS = 14;

export const FREE_LISTING_LIMIT =
  typeof process.env.FREE_LISTING_LIMIT !== "undefined"
    ? Number(process.env.FREE_LISTING_LIMIT)
    : 5;

export function getPlatformFeePercent(isPro: boolean): number {
  return isPro ? PRO_FEE_PERCENT : PLATFORM_FEE_PERCENT;
}

export function computePlatformFeeCents(amountCents: number, isProSeller: boolean): number {
  const percent = getPlatformFeePercent(isProSeller);
  return Math.round((amountCents * percent) / 100);
}
