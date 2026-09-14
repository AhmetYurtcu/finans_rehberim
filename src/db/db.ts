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
