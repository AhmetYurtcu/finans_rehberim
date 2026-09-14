import { useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { listHoldingsWithMetrics } from '../../db/repositories/portfolio'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Card, EmptyState } from '../../components/Card'
import { CurrencyText } from '../../components/CurrencyText'
import { formatNumber } from '../../lib/formatCurrency'
import { HoldingForm } from './HoldingForm'
import { refreshHoldingPrice } from './useLivePriceRefresh'

export function PortfolioListPage() {
  const [showForm, setShowForm] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const holdings = useLiveQuery(() => listHoldingsWithMetrics(), [])
  const refreshedIds = useRef(new Set<string>())

  const idsKey = holdings?.map((h) => h.id).join(',') ?? ''

  useEffect(() => {
    const toRefresh = (holdings ?? []).filter((h) => !refreshedIds.current.has(h.id))
    if (toRefresh.length === 0) return
    toRefresh.forEach((h) => refreshedIds.current.add(h.id))

    setRefreshing(true)
    Promise.allSettled(toRefresh.map((h) => refreshHoldingPrice(h))).finally(() => setRefreshing(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey])

  const totals = useMemo(() => {
    const value = (holdings ?? []).reduce((s, h) => s + h.value, 0)
    const gainLoss = (holdings ?? []).reduce((s, h) => s + h.gainLoss, 0)
    return { value, gainLoss }
  }, [holdings])

  return (
    <div>
      <PageHeader title="Portföy" action={<Button onClick={() => setShowForm(true)}>+ Ekle</Button>} />

      {refreshing && <p className="px-4 pb-2 text-xs text-slate-500">Fiyatlar güncelleniyor…</p>}

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
