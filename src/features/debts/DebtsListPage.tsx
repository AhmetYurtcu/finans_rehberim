import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { listDebtsWithBalance, setDebtStatus } from '../../db/repositories/debts'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Card, EmptyState } from '../../components/Card'
import { CurrencyText } from '../../components/CurrencyText'
import { DebtForm } from './DebtForm'

export function DebtsListPage() {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'open' | 'closed'>('open')
  const debts = useLiveQuery(() => listDebtsWithBalance(), [])

  const filtered = useMemo(() => (debts ?? []).filter((d) => d.status === filter), [debts, filter])

  const totals = useMemo(() => {
    const open = (debts ?? []).filter((d) => d.status === 'open')
    const borrowed = open.filter((d) => d.direction === 'borrowed').reduce((s, d) => s + d.remaining, 0)
    const lent = open.filter((d) => d.direction === 'lent').reduce((s, d) => s + d.remaining, 0)
    return { borrowed, lent }
  }, [debts])

  return (
    <div>
      <PageHeader title="Borçlar" action={<Button onClick={() => setShowForm(true)}>+ Ekle</Button>} />

      <div className="grid grid-cols-2 gap-2 px-4">
        <Card className="text-center">
          <p className="text-xs text-slate-500">Toplam Borcum</p>
          <CurrencyText amount={totals.borrowed} className="text-sm font-medium text-rose-400" />
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500">Toplam Alacağım</p>
          <CurrencyText amount={totals.lent} className="text-sm font-medium text-emerald-400" />
        </Card>
      </div>

      <div className="flex gap-1 px-4 py-3">
        <button
          className={`flex-1 rounded-lg py-1.5 text-sm ${filter === 'open' ? 'bg-slate-700 text-slate-100' : 'bg-slate-800 text-slate-400'}`}
          onClick={() => setFilter('open')}
        >
          Açık
        </button>
        <button
          className={`flex-1 rounded-lg py-1.5 text-sm ${filter === 'closed' ? 'bg-slate-700 text-slate-100' : 'bg-slate-800 text-slate-400'}`}
          onClick={() => setFilter('closed')}
        >
          Kapalı
        </button>
      </div>

      <div className="flex flex-col gap-2 px-4">
        {filtered.length === 0 && <EmptyState text="Bu kategoride borç yok." />}
        {filtered.map((d) => (
          <Link key={d.id} to={`/borclar/${d.id}`}>
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200">
                  {d.direction === 'borrowed' ? '📤' : '📥'} {d.counterparty}
                </p>
                <p className="text-xs text-slate-500">
                  {d.direction === 'borrowed' ? 'Borç aldım' : 'Borç verdim'} · Ödenen{' '}
                  <CurrencyText amount={d.paid} />
                </p>
              </div>
              <div className="text-right">
                <CurrencyText
                  amount={d.remaining}
                  className={`text-sm font-medium ${d.direction === 'borrowed' ? 'text-rose-400' : 'text-emerald-400'}`}
                />
                {d.status === 'open' && d.remaining === 0 && (
                  <button
                    className="mt-1 block text-xs text-slate-500 underline"
                    onClick={(e) => {
                      e.preventDefault()
                      setDebtStatus(d.id, 'closed')
                    }}
                  >
                    Kapat
                  </button>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {showForm && <DebtForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
