import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartColors } from '../../../lib/chartColors'
import { formatCurrency } from '../../../lib/formatCurrency'
import { ChartTooltip } from './ChartTooltip'

export interface PortfolioValueDatum {
  date: string // görüntülenecek kısa etiket
  value: number
}

/**
 * Portföy toplam değeri — tek seri zaman trendi. Tek seri olduğu için legend yok
 * (başlık zaten neyin çizildiğini söylüyor); sequential mavi.
 */
export function PortfolioValueChart({ data }: { data: PortfolioValueDatum[] }) {
  if (data.length < 2) {
    return <p className="py-6 text-center text-sm text-slate-500">Trend için en az iki fiyat güncellemesi gerekir.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <XAxis
          dataKey="date"
          tick={{ fill: chartColors.mutedText, fontSize: 11 }}
          axisLine={{ stroke: chartColors.axis }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fill: chartColors.mutedText, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          name="Portföy Değeri"
          stroke={chartColors.sequential}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, stroke: chartColors.surface, strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
