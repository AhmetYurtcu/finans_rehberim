import type { HoldingLot, PriceSnapshot } from '../types/models'

/** Kalan miktar = tüm alışlar - tüm satışlar. */
export function currentQuantity(lots: HoldingLot[]): number {
  return lots.reduce((sum, lot) => {
    return lot.action === 'buy' ? sum + lot.quantity : sum - lot.quantity
  }, 0)
}

/**
 * Basit ağırlıklı ortalama maliyet. Satışlar, mevcut ortalama maliyeti değiştirmez
 * (FIFO/LIFO gibi karmaşık bir muhasebe gerekmiyor — kişisel takip için basit ortalama yeterli).
 * Alış lotları tarih sırasına göre işlenir.
 */
export function avgCost(lots: HoldingLot[]): number {
  const sorted = [...lots].sort((a, b) => a.date.localeCompare(b.date))
  let quantity = 0
  let totalCost = 0

  for (const lot of sorted) {
    if (lot.action === 'buy') {
      totalCost += lot.quantity * lot.price + (lot.fee ?? 0)
      quantity += lot.quantity
    } else {
      // Satışta, satılan miktar oranında toplam maliyetten düş; ortalama sabit kalır.
      if (quantity > 0) {
        const avgAtSaleTime = totalCost / quantity
        totalCost -= avgAtSaleTime * lot.quantity
        quantity -= lot.quantity
      }
    }
  }

  return quantity > 0 ? totalCost / quantity : 0
}

/** En güncel (tarihe göre en son) fiyat anlık görüntüsü. */
export function latestPrice(snapshots: PriceSnapshot[]): number | null {
  if (snapshots.length === 0) return null
  const sorted = [...snapshots].sort((a, b) => b.date.localeCompare(a.date))
  return sorted[0].price
}

export function currentValue(lots: HoldingLot[], snapshots: PriceSnapshot[]): number {
  const qty = currentQuantity(lots)
  const price = latestPrice(snapshots)
  if (price === null) return 0
  return qty * price
}

export function unrealizedGainLoss(lots: HoldingLot[], snapshots: PriceSnapshot[]): number {
  const qty = currentQuantity(lots)
  const cost = avgCost(lots)
  const value = currentValue(lots, snapshots)
  return value - qty * cost
}

/** Belirli bir tarihe kadar (o tarih dahil) kalan miktar. */
export function quantityAtDate(lots: HoldingLot[], date: string): number {
  return currentQuantity(lots.filter((l) => l.date <= date))
}

/** Belirli bir tarihte veya ondan önceki en güncel fiyat. */
export function priceAtDate(snapshots: PriceSnapshot[], date: string): number | null {
  return latestPrice(snapshots.filter((s) => s.date <= date))
}

export function unrealizedGainLossPercent(lots: HoldingLot[], snapshots: PriceSnapshot[]): number {
  const qty = currentQuantity(lots)
  const cost = avgCost(lots)
  const costBasis = qty * cost
  if (costBasis === 0) return 0
  return (unrealizedGainLoss(lots, snapshots) / costBasis) * 100
}
