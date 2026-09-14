import { db } from '../db'
import type { Transaction, TransactionType } from '../../types/models'
import { createId } from '../../lib/id'
import { lastNMonthKeys, monthKey, nowISO } from '../../lib/dateUtils'
import { listCategories } from './categories'

export interface TransactionInput {
  type: TransactionType
  amount: number
  categoryId: string
  date: string
  note?: string
}

export function listTransactions(): Promise<Transaction[]> {
  return db.transactions.orderBy('date').reverse().toArray()
}

export async function addTransaction(input: TransactionInput): Promise<Transaction> {
  const transaction: Transaction = {
    id: createId(),
    ...input,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  await db.transactions.add(transaction)
  return transaction
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<void> {
  await db.transactions.update(id, { ...input, updatedAt: nowISO() })
}

export function deleteTransaction(id: string): Promise<void> {
  return db.transactions.delete(id)
}

/** Son N ay için toplam gelir/gider (dashboard trend grafiği için). */
export async function monthlyIncomeExpense(months: number): Promise<Array<{ monthKey: string; income: number; expense: number }>> {
  const keys = lastNMonthKeys(months)
  const all = await db.transactions.toArray()

  return keys.map((key) => {
    const inMonth = all.filter((t) => monthKey(t.date) === key)
    return {
      monthKey: key,
      income: inMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: inMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })
}

/** Belirli bir ay için kategoriye göre gider toplamları. */
export async function expenseByCategory(monthKeyValue: string): Promise<Array<{ category: string; amount: number }>> {
  const [all, categories] = await Promise.all([db.transactions.toArray(), listCategories('expense')])
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

  const totals = new Map<string, number>()
  for (const t of all) {
    if (t.type !== 'expense' || monthKey(t.date) !== monthKeyValue) continue
    const name = categoryMap.get(t.categoryId) ?? 'Diğer'
    totals.set(name, (totals.get(name) ?? 0) + t.amount)
  }

  return Array.from(totals.entries()).map(([category, amount]) => ({ category, amount }))
}
