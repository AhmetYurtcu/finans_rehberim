/**
 * Finans Rehberim — fiyat proxy'si.
 *
 * Tek görevi: TEFAS (fon) ve Yahoo Finance (BIST hisse) API'lerini, tarayıcının
 * CORS kısıtlaması yüzünden doğrudan çağıramadığı için, vekil olarak çağırıp
 * sonucu döndürmek. Hiçbir veri saklamaz/loglamaz — sadece kamuya açık bir
 * fon/hisse kodu alır, güncel fiyatı döndürür. Kullanıcının tutar/adet/maliyet
 * gibi hiçbir kişisel finansal verisi bu servise hiç ulaşmaz.
 */

const ALLOWED_ORIGIN_EXACT = ['https://ahmetyurtcu.github.io']

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  if (ALLOWED_ORIGIN_EXACT.includes(origin)) return true
  // Yerel geliştirme: herhangi bir localhost portu
  return /^http:\/\/localhost(:\d+)?$/.test(origin)
}

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin as string
  }
  return headers
}

function json(data: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

interface PriceResult {
  market: 'TEFAS' | 'BIST'
  code: string
  name: string
  price: number
  date: string // ISO (YYYY-MM-DD)
}

class UpstreamNotFoundError extends Error {}

const TEFAS_FUND_TYPES = ['YAT', 'EMK', 'BYF', 'GYF', 'GSYF']

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

async function fetchTefasPrice(code: string): Promise<PriceResult> {
  const today = new Date()
  const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)
  const basTarih = toYmd(tenDaysAgo)
  const bitTarih = toYmd(today)

  for (const fonTipi of TEFAS_FUND_TYPES) {
    const res = await fetch('https://www.tefas.gov.tr/api/funds/fonGnlBlgSiraliGetir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://www.tefas.gov.tr',
        Referer: 'https://www.tefas.gov.tr/tr/fon-verileri',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        fonTipi,
        fonKodu: code,
        basTarih,
        bitTarih,
        basSira: 1,
        bitSira: 5,
        dil: 'TR',
      }),
    })

    if (!res.ok) continue
    const data = (await res.json()) as {
      resultList?: Array<{ fiyat: number | null; tarih: string; fonUnvan: string }>
    }
    const rows = data.resultList ?? []
    const latest = rows.find((r) => r.fiyat !== null)
    if (latest) {
      return { market: 'TEFAS', code, name: latest.fonUnvan, price: latest.fiyat as number, date: latest.tarih }
    }
  }

  throw new UpstreamNotFoundError(`TEFAS fon kodu bulunamadı: ${code}`)
}

async function fetchYahooPrice(code: string): Promise<PriceResult> {
  const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${code}.IS?interval=1d&range=1d`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })

  if (res.status === 404) throw new UpstreamNotFoundError(`BIST hisse kodu bulunamadı: ${code}`)
  if (!res.ok) throw new Error(`Yahoo Finance hata verdi: ${res.status}`)

  const data = (await res.json()) as {
    chart?: {
      result?: Array<{
        meta: { regularMarketPrice?: number; longName?: string; shortName?: string; regularMarketTime?: number }
      }>
      error?: { description?: string }
    }
  }

  const result = data.chart?.result?.[0]
  if (!result || typeof result.meta.regularMarketPrice !== 'number') {
    throw new UpstreamNotFoundError(`BIST hisse kodu bulunamadı: ${code}`)
  }

  const date = result.meta.regularMarketTime
    ? new Date(result.meta.regularMarketTime * 1000).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)

  return {
    market: 'BIST',
    code,
    name: result.meta.longName ?? result.meta.shortName ?? code,
    price: result.meta.regularMarketPrice,
    date,
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    const origin = request.headers.get('Origin')
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    if (url.pathname !== '/price' || request.method !== 'GET') {
      return json({ error: 'Bulunamadı' }, 404, origin)
    }

    const market = url.searchParams.get('market')
    const codeRaw = url.searchParams.get('code') ?? ''
    const code = codeRaw.trim().toUpperCase()

    if (market !== 'TEFAS' && market !== 'BIST') {
      return json({ error: "market parametresi 'TEFAS' veya 'BIST' olmalı" }, 400, origin)
    }
    if (!/^[A-Z0-9]{1,10}$/.test(code)) {
      return json({ error: 'code parametresi geçersiz' }, 400, origin)
    }

    try {
      const result = market === 'TEFAS' ? await fetchTefasPrice(code) : await fetchYahooPrice(code)
      return json(result, 200, origin)
    } catch (err) {
      if (err instanceof UpstreamNotFoundError) {
        return json({ error: err.message }, 404, origin)
      }
      return json({ error: 'Fiyat çekilemedi, kaynak servis hata verdi.' }, 502, origin)
    }
  },
}
