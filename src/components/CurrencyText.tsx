import { formatCurrency } from '../lib/formatCurrency'

interface CurrencyTextProps {
  amount: number
  colorize?: boolean
  className?: string
}

/** Tutarı biçimlendirir; colorize=true ise pozitif/negatife göre renklendirir. */
export function CurrencyText({ amount, colorize = false, className = '' }: CurrencyTextProps) {
  const colorClass = colorize ? (amount >= 0 ? 'text-emerald-400' : 'text-rose-400') : ''
  return <span className={`${colorClass} ${className}`}>{formatCurrency(amount)}</span>
}
