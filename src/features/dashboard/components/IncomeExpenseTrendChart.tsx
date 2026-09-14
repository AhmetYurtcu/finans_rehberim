import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartColors } from '../../../lib/chartColors'
import { formatCurrency } from '../../../lib/formatCurrency'

export interface IncomeExpenseDatum {
  month: string // kısa etiket, örn "Oca 25"
  income: number
  expense: number
}

interface IncomeExpenseTrendChartProps {
  data: IncomeExpenseDatum[]
}

/**
 * Aylık gelir/gider — baseline'ın üstünde/altında iki kutup (diverging job):
 * gelir pozitif (mavi), gider negatif değere çevrilip aşağı (kırmızı) çizilir.
 * 2 seri olduğu için legend her zaman görünür.
 */
export function IncomeExpenseTrendChart({ data }: IncomeExpenseTrendChartProps) {
  const chartData = data.map((d) => ({ month: d.month, income: d.income, expense: -d.expense }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }} barGap={2}>
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis
          dataKey="month"
          tick={{ fill: chartColors.mutedText, fontSize: 11 }}
          axisLine={{ stroke: chartColors.axis }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(Math.abs(v))}
          tick={{ fill: chartColors.mutedText, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <ReferenceLine y={0} stroke={chartColors.axis} />
        <Tooltip
          content={({ active, label, payload }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs shadow-lg">
                <p className="mb-1 text-slate-400">{label}</p>
                {payload.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="inline-block h-0.5 w-3" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-400">{item.name === 'income' ? 'Gelir' : 'Gider'}</span>
                    <span className="ml-auto font-semibold text-slate-100">
                      {formatCurrency(Math.abs(Number(item.value ?? 0)))}
                    </span>
                  </div>
                ))}
              </div>
            )
          }}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
        />
        <Legend
          formatter={(value) => (value === 'income' ? 'Gelir' : 'Gider')}
          wrapperStyle={{ fontSize: 12, color: chartColors.secondaryText }}
        />
        <Bar dataKey="income" name="income" fill={chartColors.divergingPositive} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        <Bar dataKey="expense" name="expense" fill={chartColors.divergingNegative} radius={[0, 0, 4, 4]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}
