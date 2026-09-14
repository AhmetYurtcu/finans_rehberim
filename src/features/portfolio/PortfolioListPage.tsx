import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { listHoldingsWithMetrics } from '../../db/repositories/portfolio'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Card, EmptyState } from '../../components/Card'
import { CurrencyText } from '../../components/CurrencyText'
import { formatNumber } from '../../lib/formatCurrency'
import { HoldingForm } from './HoldingForm'

export function PortfolioListPage() {
  const [showForm, setShowForm] = useState(false)
  const holdings = useLiveQuery(() => listHoldingsWithMetrics(), [])

  const totals = useMemo(() => {
    const value = (holdings ?? []).reduce((s, h) => s + h.value, 0)
    const gainLoss = (holdings ?? []).reduce((s, h) => s + h.gainLoss, 0)
    return { value, gainLoss }
  }, [holdings])

  return (
    <div>
      <PageHeader title="Portföy" action={<Button onClick={() => setShowForm(true)}>+ Ekle</Button>} />

      <div className="grid grid-cols-2 gap-2 px-4">
        <Card className="text-center">
          <p className="text-xs text-slate-500">Toplam Değer</p>
          <CurrencyText amount={totals.value} className="text-sm font-medium" />
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500">Toplam Kâr/Zarar</p>
          <CurrencyText amount={totals.gainLoss} colorize className="text-sm font-medium" />
        </Card>
      </div>

      <div className="flex flex-col gap-2 px-4 py-3">
        {(holdings ?? []).length === 0 && (
          <EmptyState text="Henüz varlık eklenmedi. Fon veya hisse ekleyip alım kaydı gir." />
        )}
        {holdings?.map((h) => (
          <Link key={h.id} to={`/portfoy/${h.id}`}>
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200">
                  {h.assetType === 'fund' ? '📊' : '🏢'} {h.code} — {h.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatNumber(h.quantity, 4)} adet · Ort. maliyet {formatNumber(h.avgCost)}
                </p>
              </div>
              <div className="text-right">
                <CurrencyText amount={h.value} className="text-sm font-medium" />
                <p className={`text-xs ${h.gainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {h.gainLoss >= 0 ? '+' : ''}
                  {formatNumber(h.gainLossPercent)}%
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {showForm && <HoldingForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
