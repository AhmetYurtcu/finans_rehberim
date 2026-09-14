import Dexie, { type EntityTable } from 'dexie'
import type {
  Category,
  Debt,
  DebtPayment,
  Holding,
  HoldingLot,
  PriceSnapshot,
  Settings,
  Transaction,
} from '../types/models'

// NOT: Yeni bir tablo eklersen (yeni versiyon: this.version(2).stores({...}))
// src/lib/backup.ts'teki backupSchema + exportBackup + restoreBackup'ı da güncelle
// (yeni tabloyu ekle). Şema orada `.optional().default([])` kullandığı için
// eski yedekler yine sorunsuz geri yüklenir; sen sadece yeni tabloyu 4 yere
// (interface, export listesi, zod şeması, import/clear listesi) eklemen yeterli.
export class FinansDB extends Dexie {
  settings!: EntityTable<Settings, 'id'>
  categories!: EntityTable<Category, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  debts!: EntityTable<Debt, 'id'>
  debtPayments!: EntityTable<DebtPayment, 'id'>
  holdings!: EntityTable<Holding, 'id'>
  holdingLots!: EntityTable<HoldingLot, 'id'>
  priceSnapshots!: EntityTable<PriceSnapshot, 'id'>

  constructor() {
    super('finans-rehberim')

    this.version(1).stores({
      settings: 'id',
      categories: 'id, type',
      transactions: 'id, date, categoryId, type',
      debts: 'id, status, direction, startDate',
      debtPayments: 'id, debtId, date',
      holdings: 'id, assetType, code',
      holdingLots: 'id, holdingId, date',
      priceSnapshots: 'id, holdingId, date',
    })
  }
}

export const db = new FinansDB()
