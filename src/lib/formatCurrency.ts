const formatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number): string {
  return formatter.format(amount)
}

export function formatNumber(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatSignedCurrency(amount: number): string {
  const sign = amount > 0 ? '+' : ''
  return `${sign}${formatCurrency(amount)}`
}
