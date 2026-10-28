export function formatCash(value?: number | null, fractionDigits = 2): string {
  return Number.isFinite(value)
    ? `KSh ${Number(value).toLocaleString('en-US', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`
    : '—'
}
