import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Transaction, TransactionType } from '../../types/models'
import { listCategories } from '../../db/repositories/categories'
import { deleteTransaction, listTransactions } from '../../db/repositories/transactions'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Select } from '../../components/Input'
import { Card, EmptyState } from '../../components/Card'
import { CurrencyText } from '../../components/CurrencyText'
import { TransactionForm } from './TransactionForm'
import { currentMonthKey, formatDate, monthKey, monthLabel } from '../../lib/dateUtils'

export function TransactionsPage() {
  const [month, setMonth] = useState(currentMonthKey())
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all')
  const [editing, setEditing] = useState<Transaction | 'new' | null>(null)

  const transactions = useLiveQuery(() => listTransactions(), [])
  const categories = useLiveQuery(() => listCategories(), [])
  const categoryMap = useMemo(() => new Map(categories?.map((c) => [c.id, c])), [categories])

  const months = useMemo(() => {
    const set = new Set<string>(transactions?.map((t) => monthKey(t.date)))
    set.add(currentMonthKey())
    return Array.from(set).sort().reverse()
  }, [transactions])

  const filtered = useMemo(() => {
    return (transactions ?? []).filter((t) => {
      if (monthKey(t.date) !== month) return false
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      return true
    })
  }, [transactions, month, typeFilter])

  const totals = useMemo(() => {
    const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { income, expense, net: income - expense }
  }, [filtered])

  async function handleDelete(id: string) {
    if (confirm('Bu işlemi silmek istediğine emin misin?')) {
      await deleteTransaction(id)
    }
  }

  return (
    <div>
      <PageHeader
        title="Gelir / Gider"
        action={<Button onClick={() => setEditing('new')}>+ Ekle</Button>}
      />

      <div className="flex gap-2 px-4">
        <Select value={month} onChange={(e) => setMonth(e.target.value)} className="flex-1">
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </Select>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | TransactionType)}>
          <option value="all">Tümü</option>
          <option value="income">Gelir</option>
          <option value="expense">Gider</option>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        <Card className="text-center">
          <p className="text-xs text-slate-500">Gelir</p>
          <CurrencyText amount={totals.income} className="text-sm font-medium text-emerald-400" />
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500">Gider</p>
          <CurrencyText amount={totals.expense} className="text-sm font-medium text-rose-400" />
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500">Net</p>
          <CurrencyText amount={totals.net} colorize className="text-sm font-medium" />
        </Card>
      </div>

      <div className="flex flex-col gap-2 px-4">
        {filtered.length === 0 && <EmptyState text="Bu ayda henüz işlem yok." />}
        {filtered.map((t) => {
          const category = categoryMap.get(t.categoryId)
          return (
            <Card key={t.id} className="flex items-center justify-between">
              <button className="flex-1 text-left" onClick={() => setEditing(t)}>
                <p className="text-sm text-slate-200">
                  {category?.icon} {category?.name ?? 'Kategori yok'}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDate(t.date)}
                  {t.note ? ` · ${t.note}` : ''}
                </p>
              </button>
              <div className="flex items-center gap-3">
                <CurrencyText
                  amount={t.type === 'income' ? t.amount : -t.amount}
                  colorize
                  className="text-sm font-medium"
                />
                <button onClick={() => handleDelete(t.id)} className="text-rose-400">
                  Sil
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {editing && (
        <TransactionForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
