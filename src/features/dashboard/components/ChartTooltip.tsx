import { formatCurrency } from '../../../lib/formatCurrency'

interface TooltipPayloadItem {
  name?: string
  value?: number
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  label?: string
  payload?: TooltipPayloadItem[]
}

/**
 * Recharts için ortak tooltip: değer önde/kalın, seri adı ikincil,
 * her seri bir "line key" (kısa renkli çizgi) ile işaretlenir (kutu değil).
 */
export function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 text-slate-400">{label}</p>}
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-3" style={{ backgroundColor: item.color }} />
          <span className="text-slate-400">{item.name}</span>
          <span className="ml-auto font-semibold text-slate-100">
            {typeof item.value === 'number' ? formatCurrency(item.value) : item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
