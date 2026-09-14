import { db } from '../db'
import type { Debt, DebtPayment, DebtDirection } from '../../types/models'
import { createId } from '../../lib/id'
import { nowISO } from '../../lib/dateUtils'

export interface DebtInput {
  direction: DebtDirection
  counterparty: string
  principal: number
  currency: Debt['currency']
  interestRate?: number
  startDate: string
  dueDate?: string
  note?: string
}

export function listDebts(): Promise<Debt[]> {
  return db.debts.orderBy('startDate').reverse().toArray()
}

export async function addDebt(input: DebtInput): Promise<Debt> {
  const debt: Debt = {
    id: createId(),
    ...input,
    status: 'open',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  await db.debts.add(debt)
  return debt
}

export async function updateDebt(id: string, input: Partial<DebtInput>): Promise<void> {
  await db.debts.update(id, { ...input, updatedAt: nowISO() })
}

export async function setDebtStatus(id: string, status: Debt['status']): Promise<void> {
  await db.debts.update(id, { status, updatedAt: nowISO() })
}

export function deleteDebt(id: string): Promise<void> {
  return db.transaction('rw', db.debts, db.debtPayments, async () => {
    await db.debtPayments.where('debtId').equals(id).delete()
    await db.debts.delete(id)
  })
}

export function listDebtPayments(debtId: string): Promise<DebtPayment[]> {
  return db.debtPayments.where('debtId').equals(debtId).sortBy('date')
}

export async function addDebtPayment(input: { debtId: string; amount: number; date: string; note?: string }): Promise<DebtPayment> {
  const payment: DebtPayment = {
    id: createId(),
    ...input,
    createdAt: nowISO(),
  }
  await db.debtPayments.add(payment)
  return payment
}

export function deleteDebtPayment(id: string): Promise<void> {
  return db.debtPayments.delete(id)
}

/** Bir borç için ödenen toplam ve kalan bakiyeyi hesaplar. */
export async function debtBalance(debt: Debt): Promise<{ paid: number; remaining: number }> {
  const payments = await listDebtPayments(debt.id)
  const paid = payments.reduce((sum, p) => sum + p.amount, 0)
  return { paid, remaining: Math.max(debt.principal - paid, 0) }
}

export interface DebtWithBalance extends Debt {
  paid: number
  remaining: number
}

/** Tüm borçları, ödenen/kalan bakiyeleriyle birlikte döndürür (dashboard ve liste için). */
export async function listDebtsWithBalance(): Promise<DebtWithBalance[]> {
  const [debts, allPayments] = await Promise.all([listDebts(), db.debtPayments.toArray()])
  return debts.map((debt) => {
    const paid = allPayments.filter((p) => p.debtId === debt.id).reduce((sum, p) => sum + p.amount, 0)
    return { ...debt, paid, remaining: Math.max(debt.principal - paid, 0) }
  })
}
