import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  deleteHolding,
  deleteLot,
  deletePriceSnapshot,
  getHolding,
  listLots,
  listPriceSnapshots,
} from '../../db/repositories/portfolio'
import { avgCost, currentQuantity, currentValue, latestPrice, unrealizedGainLoss, unrealizedGainLossPercent } from '../../lib/calculations'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Card, EmptyState } from '../../components/Card'
import { CurrencyText } from '../../components/CurrencyText'
import { formatNumber as fmtNum } from '../../lib/formatCurrency'
import { HoldingForm } from './HoldingForm'
import { LotForm } from './LotForm'
import { PriceUpdateForm } from './PriceUpdateForm'
import { PriceSparkline } from './PriceSparkline'
import { useLivePriceRefresh } from './useLivePriceRefresh'

export function HoldingDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [showLotForm, setShowLotForm] = useState(false)
  const [showPriceForm, setShowPriceForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)

  const holding = useLiveQuery(() => getHolding(id), [id])
  const lots = useLiveQuery(() => listLots(id), [id]) ?? []
  const snapshots = useLiveQuery(() => listPriceSnapshots(id), [id]) ?? []
  const { status: fetchStatus, error: fetchError, refresh } = useLivePriceRefresh()

  useEffect(() => {
    if (holding) refresh(holding)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holding?.id])

  if (!holding) {
    return (
      <div>
        <PageHeader title="Varlık" />
        <EmptyState text="Varlık bulunamadı." />
      </div>
    )
  }

  const quantity = currentQuantity(lots)
  const cost = avgCost(lots)
  const price = latestPrice(snapshots)
  const value = currentValue(lots, snapshots)
  const gainLoss = unrealizedGainLoss(lots, snapshots)
  const gainLossPercent = unrealizedGainLossPercent(lots, snapshots)
  const sparklineData = [...snapshots]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => ({ date: s.date, price: s.price }))

  async function handleDeleteLot(lotId: string) {
    if (confirm('Bu alım/satım kaydını silmek istediğine emin misin?')) await deleteLot(lotId)
  }

  async function handleDeleteSnapshot(snapshotId: string) {
    if (confirm('Bu fiyat kaydını silmek istediğine emin misin?')) await deletePriceSnapshot(snapshotId)
  }

  async function handleDeleteHolding() {
    if (confirm('Bu varlığı ve tüm alım/satım/fiyat geçmişini silmek istediğine emin misin? Bu işlem geri alınamaz.')) {
      await deleteHolding(id)
      navigate('/portfoy')
    }
  }

  return (
    <div>
      <PageHeader title={`${holding.code} — ${holding.name}`} />

      <div className="flex flex-col gap-3 px-4">
        <Card>
          <p className="text-xs text-slate-500">
            {holding.assetType === 'fund' ? 'Fon (TEFAS)' : 'Hisse (BIST)'}
          </p>

          <div className="mt-2 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Adet</p>
              <p className="text-sm font-medium text-slate-100">{fmtNum(quantity, 4)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Ort. Maliyet</p>
              <p className="text-sm font-medium text-slate-100">{fmtNum(cost)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Güncel Fiyat</p>
              <p className="text-sm font-medium text-slate-100">
                {fetchStatus === 'loading' ? '…' : price !== null ? fmtNum(price) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Değer</p>
              <CurrencyText amount={value} className="text-sm font-medium" />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
            <span className="text-xs text-slate-500">Kâr / Zarar</span>
            <span>
              <CurrencyText amount={gainLoss} colorize className="text-sm font-medium" />
              <span className={`ml-2 text-xs ${gainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({gainLoss >= 0 ? '+' : ''}
                {fmtNum(gainLossPercent)}%)
              </span>
            </span>
          </div>

          {sparklineData.length >= 2 && (
            <div className="mt-3">
              <PriceSparkline data={sparklineData} isGain={gainLoss >= 0} />
            </div>
          )}

          {holding.note && <p className="mt-3 text-xs text-slate-500">Not: {holding.note}</p>}

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {fetchStatus === 'loading' && 'Fiyat çekiliyor…'}
              {fetchStatus === 'success' && 'Fiyat az önce güncellendi.'}
              {fetchStatus === 'error' && <span className="text-rose-400">{fetchError} Elle girebilirsin.</span>}
              {fetchStatus === 'idle' && ' '}
            </p>
            <button
              onClick={() => refresh(holding, { force: true })}
              disabled={fetchStatus === 'loading'}
              className="text-xs text-emerald-400 disabled:opacity-50"
            >
              ↻ Şimdi Çek
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <Button variant="secondary" onClick={() => setShowEditForm(true)}>
              Düzenle
            </Button>
            <Button variant="danger" onClick={handleDeleteHolding}>
              Sil
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">Fiyat Güncellemeleri</h3>
          <Button onClick={() => setShowPriceForm(true)}>+ Fiyat</Button>
        </div>
        {snapshots.length === 0 && <EmptyState text="Henüz fiyat girilmedi." />}
        {[...snapshots].reverse().map((s) => (
          <Card key={s.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-100">{fmtNum(s.price)}</p>
              <p className="text-xs text-slate-500">{dayjs(s.date).format('DD.MM.YYYY')}</p>
            </div>
            <button onClick={() => handleDeleteSnapshot(s.id)} className="text-rose-400">
              Sil
            </button>
          </Card>
        ))}

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">Alım / Satım Geçmişi</h3>
          <Button onClick={() => setShowLotForm(true)}>+ İşlem</Button>
        </div>
        {lots.length === 0 && <EmptyState text="Henüz alım/satım kaydı yok." />}
        {[...lots].reverse().map((l) => (
          <Card key={l.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-100">
                {l.action === 'buy' ? '🟢 Alım' : '🔴 Satım'} · {fmtNum(l.quantity, 4)} adet @ {fmtNum(l.price)}
              </p>
              <p className="text-xs text-slate-500">{dayjs(l.date).format('DD.MM.YYYY')}</p>
            </div>
            <button onClick={() => handleDeleteLot(l.id)} className="text-rose-400">
              Sil
            </button>
          </Card>
        ))}
      </div>

      {showLotForm && <LotForm holdingId={id} onClose={() => setShowLotForm(false)} />}
      {showPriceForm && <PriceUpdateForm holdingId={id} onClose={() => setShowPriceForm(false)} />}
      {showEditForm && <HoldingForm initial={holding} onClose={() => setShowEditForm(false)} />}
    </div>
  )
}
