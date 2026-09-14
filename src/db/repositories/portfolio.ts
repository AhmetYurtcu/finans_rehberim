import { db } from '../db'
import type { AssetType, Holding, HoldingLot, LotAction, Market, PriceSnapshot } from '../../types/models'
import { createId } from '../../lib/id'
import { nowISO } from '../../lib/dateUtils'
import {
  avgCost,
  currentQuantity,
  currentValue,
  latestPrice,
  priceAtDate,
  quantityAtDate,
  unrealizedGainLoss,
  unrealizedGainLossPercent,
} from '../../lib/calculations'

export interface HoldingInput {
  assetType: AssetType
  market: Market
  code: string
  name: string
  note?: string
}

export function listHoldings(): Promise<Holding[]> {
  return db.holdings.orderBy('code').toArray()
}

export function getHolding(id: string): Promise<Holding | undefined> {
  return db.holdings.get(id)
}

export async function addHolding(input: HoldingInput): Promise<Holding> {
  const holding: Holding = {
    id: createId(),
    ...input,
    currency: 'TRY',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  await db.holdings.add(holding)
  return holding
}

export async function updateHolding(id: string, input: Partial<HoldingInput>): Promise<void> {
  await db.holdings.update(id, { ...input, updatedAt: nowISO() })
}

export function deleteHolding(id: string): Promise<void> {
  return db.transaction('rw', db.holdings, db.holdingLots, db.priceSnapshots, async () => {
    await db.holdingLots.where('holdingId').equals(id).delete()
    await db.priceSnapshots.where('holdingId').equals(id).delete()
    await db.holdings.delete(id)
  })
}

export function listLots(holdingId: string): Promise<HoldingLot[]> {
  return db.holdingLots.where('holdingId').equals(holdingId).sortBy('date')
}

export async function addLot(input: {
  holdingId: string
  action: LotAction
  date: string
  quantity: number
  price: number
  fee?: number
  note?: string
}): Promise<HoldingLot> {
  const lot: HoldingLot = {
    id: createId(),
    ...input,
    createdAt: nowISO(),
  }
  await db.holdingLots.add(lot)
  return lot
}

export function deleteLot(id: string): Promise<void> {
  return db.holdingLots.delete(id)
}

export function listPriceSnapshots(holdingId: string): Promise<PriceSnapshot[]> {
  return db.priceSnapshots.where('holdingId').equals(holdingId).sortBy('date')
}

export async function addPriceSnapshot(input: { holdingId: string; date: string; price: number }): Promise<PriceSnapshot> {
  const snapshot: PriceSnapshot = {
    id: createId(),
    ...input,
    createdAt: nowISO(),
  }
  await db.priceSnapshots.add(snapshot)
  return snapshot
}

export function deletePriceSnapshot(id: string): Promise<void> {
  return db.priceSnapshots.delete(id)
}

export interface HoldingWithMetrics extends Holding {
  quantity: number
  avgCost: number
  latestPrice: number | null
  value: number
  gainLoss: number
  gainLossPercent: number
}

/** Tüm holding'leri türetilmiş metriklerle (miktar/ortalama maliyet/güncel değer/kâr-zarar) döndürür. */
export async function listHoldingsWithMetrics(): Promise<HoldingWithMetrics[]> {
  const [holdings, allLots, allSnapshots] = await Promise.all([
    listHoldings(),
    db.holdingLots.toArray(),
    db.priceSnapshots.toArray(),
  ])

  return holdings.map((holding) => {
    const lots = allLots.filter((l) => l.holdingId === holding.id)
    const snapshots = allSnapshots.filter((s) => s.holdingId === holding.id)
    return {
      ...holding,
      quantity: currentQuantity(lots),
      avgCost: avgCost(lots),
      latestPrice: latestPrice(snapshots),
      value: currentValue(lots, snapshots),
      gainLoss: unrealizedGainLoss(lots, snapshots),
      gainLossPercent: unrealizedGainLossPercent(lots, snapshots),
    }
  })
}

/**
 * Tüm holding'ler için birleşik toplam portföy değeri zaman serisi.
 * Her fiyat güncelleme tarihinde, o tarihe kadarki miktar × o tarihe kadarki en güncel fiyat
 * baz alınarak toplam değer hesaplanır (yaklaşık ama kişisel takip için yeterli).
 */
export async function portfolioValueSeries(): Promise<Array<{ date: string; value: number }>> {
  const [holdings, allLots, allSnapshots] = await Promise.all([
    listHoldings(),
    db.holdingLots.toArray(),
    db.priceSnapshots.toArray(),
  ])

  const dates = Array.from(new Set(allSnapshots.map((s) => s.date))).sort()

  return dates.map((date) => {
    const value = holdings.reduce((sum, holding) => {
      const lots = allLots.filter((l) => l.holdingId === holding.id)
      const snapshots = allSnapshots.filter((s) => s.holdingId === holding.id)
      const qty = quantityAtDate(lots, date)
      const price = priceAtDate(snapshots, date)
      return sum + (price ? qty * price : 0)
    }, 0)
    return { date, value }
  })
}
