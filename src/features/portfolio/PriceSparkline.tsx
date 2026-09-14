import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { chartColors } from '../../lib/chartColors'

interface PriceSparklineProps {
  data: Array<{ date: string; price: number }>
  isGain: boolean
}

/**
 * Tek holding için mini fiyat geçmişi — stat-tile tarzı sparkline.
 * Eksen/gridline yok; renk durum taşır (kâr=good, zarar=critical),
 * bu yüzden yanında her zaman kâr/zarar yüzdesi metni bulunur (renk tek başına anlam taşımaz).
 */
export function PriceSparkline({ data, isGain }: PriceSparklineProps) {
  if (data.length < 2) return null
  const color = isGain ? chartColors.statusGood : chartColors.statusCritical

  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <Line type="monotone" dataKey="price" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
