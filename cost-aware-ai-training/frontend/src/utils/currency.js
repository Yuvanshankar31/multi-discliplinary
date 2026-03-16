export const USD_TO_INR = 83;

export function toInr(amountUsd) {
  const n = Number(amountUsd);
  if (!Number.isFinite(n)) return null;
  return n * USD_TO_INR;
}

export function formatInr(amountUsd, { maximumFractionDigits = 2 } = {}) {
  const inr = toInr(amountUsd);
  if (inr === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits,
  }).format(inr);
}

export function formatInrPerHour(amountUsdPerHour, { maximumFractionDigits = 3 } = {}) {
  const inr = toInr(amountUsdPerHour);
  if (inr === null) return '—';
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits,
  }).format(inr);
  return `${formatted}/hr`;
}
