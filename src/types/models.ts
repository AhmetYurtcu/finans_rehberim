// Tüm veri modeli burada tanımlı. Dexie tabloları (src/db/db.ts) bu tiplerle 1:1 eşleşir,
// böylece ileride bir Claude-analiz özelliği ya da otomatik fiyat çekme bu tipleri
// doğrudan okuyup yazabilir.

export type TransactionType = 'income' | 'expense'

export interface Settings {
  id: 1 // tek satır ayarlar tablosu
  currency: 'TRY'
  locale: 'tr-TR'
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  type: TransactionType
  name: string
  icon?: string
  color?: string
  isDefault: boolean
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number // her zaman pozitif, işaret "type" alanından gelir
  categoryId: string
  date: string // ISO tarih (YYYY-MM-DD)
  note?: string
  createdAt: string
  updatedAt: string
}

export type DebtDirection = 'borrowed' | 'lent' // borrowed: ben aldım, lent: ben verdim
export type DebtStatus = 'open' | 'closed'

export interface Debt {
  id: string
  direction: DebtDirection
  counterparty: string
  principal: number
  currency: 'TRY' | 'USD' | 'EUR'
  interestRate?: number
  startDate: string
  dueDate?: string
  status: DebtStatus
  note?: string
  createdAt: string
  updatedAt: string
}

export interface DebtPayment {
  id: string
  debtId: string
  amount: number
  date: string
  note?: string
  createdAt: string
}

export type AssetType = 'fund' | 'stock'
export type Market = 'TEFAS' | 'BIST'

export interface Holding {
  id: string
  assetType: AssetType
  market: Market
  code: string // fon kodu (örn. "AFA") veya hisse kodu (örn. "THYAO")
  name: string
  currency: 'TRY'
  note?: string
  createdAt: string
  updatedAt: string
}

export type LotAction = 'buy' | 'sell'

export interface HoldingLot {
  id: string
  holdingId: string
  action: LotAction
  date: string
  quantity: number
  price: number // işlem anındaki birim fiyat
  fee?: number
  note?: string
  createdAt: string
}

export interface PriceSnapshot {
  id: string
  holdingId: string
  date: string
  price: number
  createdAt: string
}
