import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartColors } from '../../../lib/chartColors'
import { formatCurrency } from '../../../lib/formatCurrency'
import { ChartTooltip } from './ChartTooltip'

export interface ExpenseByCategoryDatum {
  category: string
  amount: number
}

interface ExpenseByCategoryChartProps {
  data: ExpenseByCategoryDatum[]
}

/**
 * Kategoriye göre gider — büyüklük karşılaştırması, tek seri.
 * Form: yatay bar (kategori adları uzun olabileceği için). Renk: sequential (tek mavi ton),
 * çünkü uzunluk zaten büyüklüğü taşıyor — gradyan ek bilgi eklemiyor.
 */
export function ExpenseByCategoryChart({ data }: ExpenseByCategoryChartProps) {
  const sorted = [...data].sort((a, b) => b.amount - a.amount).slice(0, 8)

  if (sorted.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">Bu ay için gider kaydı yok.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(sorted.length * 34, 120)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 0 }} barSize={16}>
        <CartesianGrid horizontal={false} stroke={chartColors.grid} />
        <XAxis
          type="number"
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fill: chartColors.mutedText, fontSize: 11 }}
          axisLine={{ stroke: chartColors.axis }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          width={90}
          tick={{ fill: chartColors.secondaryText, fontSize: 11 }}
          axisLine={{ stroke: chartColors.axis }}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="amount" name="Gider" radius={[0, 4, 4, 0]} isAnimationActive={false}>
          {sorted.map((_, i) => (
            <Cell key={i} fill={chartColors.sequential} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
