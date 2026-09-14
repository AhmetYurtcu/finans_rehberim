import { useCallback, useState } from 'react'
import type { Holding } from '../../types/models'
import { fetchLivePrice, PriceFetchError } from '../../lib/priceApi'
import { upsertPriceSnapshot } from '../../db/repositories/portfolio'

const DEBOUNCE_MS = 5 * 60 * 1000 // 5 dakika
const lastFetchedAt = new Map<string, number>()

/**
 * Debounce kontrolü ve "son çekildi" işaretlemesi TEK bir senkron adımda yapılır
 * (await'siz) — böylece React StrictMode'un bir efekti geliştirmede iki kez
 * art arda tetiklemesi gibi durumlarda, iki çağrı arasında yarış (race) oluşup
 * ikisinin de "geçti" sanmasının veya durumun birbirini ezmesinin önüne geçilir.
 */
function shouldSkipAndMark(holdingId: string, force: boolean | undefined): boolean {
  const last = lastFetchedAt.get(holdingId)
  if (!force && last && Date.now() - last < DEBOUNCE_MS) return true
  lastFetchedAt.set(holdingId, Date.now())
  return false
}

/** Toplu/otomatik liste taraması için — UI durumu göstermez, sadece veriyi günceller. */
export async function refreshHoldingPrice(
  holding: Pick<Holding, 'id' | 'market' | 'code'>,
  opts: { force?: boolean } = {},
): Promise<{ skipped: true } | { skipped: false; ok: true } | { skipped: false; ok: false; error: string }> {
  if (shouldSkipAndMark(holding.id, opts.force)) return { skipped: true }

  try {
    const live = await fetchLivePrice(holding.market, holding.code)
    await upsertPriceSnapshot({ holdingId: holding.id, date: live.date, price: live.price })
    return { skipped: false, ok: true }
  } catch (err) {
    const message = err instanceof PriceFetchError ? err.message : 'Fiyat çekilemedi.'
    return { skipped: false, ok: false, error: message }
  }
}

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

/** Tek bir holding'in canlı fiyat çekme durumunu (yükleniyor/hata) yöneten küçük hook. */
export function useLivePriceRefresh() {
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (holding: Pick<Holding, 'id' | 'market' | 'code'>, opts: { force?: boolean } = {}) => {
    // Debounce'a giren (kısa süre önce zaten çekilmiş) çağrı, React state'ine
    // HİÇ dokunmaz — böylece "gerçek" çağrının loading/success/error geçişiyle
    // yarışmaz; ekranda önceki durum ne ise o kalır.
    if (shouldSkipAndMark(holding.id, opts.force)) return

    setStatus('loading')
    try {
      const live = await fetchLivePrice(holding.market, holding.code)
      await upsertPriceSnapshot({ holdingId: holding.id, date: live.date, price: live.price })
      setStatus('success')
      setError(null)
    } catch (err) {
      setStatus('error')
      setError(err instanceof PriceFetchError ? err.message : 'Fiyat çekilemedi.')
    }
  }, [])

  return { status, error, refresh }
}
