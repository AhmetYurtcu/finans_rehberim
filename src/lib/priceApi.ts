import type { Market } from '../types/models'

// Cloudflare Worker — sadece kamuya açık fon/hisse kodunu alıp güncel fiyatı döndürür.
// Hiçbir kullanıcı verisi (tutar/adet/maliyet) bu adrese gönderilmez.
const PRICE_PROXY_URL = 'https://finans-rehberim-price-proxy.finans-rehberim-price-proxy.workers.dev/price'

export interface LivePrice {
  market: Market
  code: string
  name: string
  price: number
  date: string
}

export class PriceFetchError extends Error {}

export async function fetchLivePrice(market: Market, code: string): Promise<LivePrice> {
  const url = `${PRICE_PROXY_URL}?market=${encodeURIComponent(market)}&code=${encodeURIComponent(code)}`

  let res: Response
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  } catch {
    throw new PriceFetchError('Fiyat servisine ulaşılamadı. İnternet bağlantını kontrol et.')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new PriceFetchError(body?.error ?? 'Fiyat çekilemedi.')
  }

  return (await res.json()) as LivePrice
}
