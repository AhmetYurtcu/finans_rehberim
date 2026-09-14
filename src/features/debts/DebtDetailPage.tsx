import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../../db/db'
import { debtBalance, deleteDebt, deleteDebtPayment, listDebtPayments, setDebtStatus } from '../../db/repositories/debts'
import { PageHeader } from '../../components/PageHeader'
import { Button } from '../../components/Button'
import { Card, EmptyState } from '../../components/Card'
import { CurrencyText } from '../../components/CurrencyText'
import { formatDate } from '../../lib/dateUtils'
import { PaymentForm } from './PaymentForm'
import { DebtForm } from './DebtForm'

export function DebtDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)

  const debt = useLiveQuery(() => db.debts.get(id), [id])
  const payments = useLiveQuery(() => listDebtPayments(id), [id])
  const balance = useLiveQuery(() => (debt ? debtBalance(debt) : undefined), [debt])

  if (!debt) {
    return (
      <div>
        <PageHeader title="Borç" />
        <EmptyState text="Borç bulunamadı." />
      </div>
    )
  }

  async function handleDeletePayment(paymentId: string) {
    if (confirm('Bu ödemeyi silmek istediğine emin misin?')) {
      await deleteDebtPayment(paymentId)
    }
  }

  async function handleDeleteDebt() {
    if (confirm('Bu borcu ve tüm ödeme geçmişini silmek istediğine emin misin? Bu işlem geri alınamaz.')) {
      await deleteDebt(id)
      navigate('/borclar')
    }
  }

  return (
    <div>
      <PageHeader title={debt.counterparty} />

      <div className="flex flex-col gap-3 px-4">
        <Card>
          <p className="text-xs text-slate-500">{debt.direction === 'borrowed' ? 'Borç aldım' : 'Borç verdim'}</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-slate-500">Anapara</p>
              <CurrencyText amount={debt.principal} className="text-sm font-medium" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Ödenen</p>
              <CurrencyText amount={balance?.paid ?? 0} className="text-sm font-medium text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Kalan</p>
              <CurrencyText amount={balance?.remaining ?? 0} className="text-sm font-medium text-rose-400" />
            </div>
          </div>
          {debt.dueDate && <p className="mt-3 text-xs text-slate-500">Vade: {formatDate(debt.dueDate)}</p>}
          {debt.note && <p className="mt-1 text-xs text-slate-500">Not: {debt.note}</p>}

          <div className="mt-3 flex gap-2">
            <Button variant="secondary" onClick={() => setShowEditForm(true)}>
              Düzenle
            </Button>
            {debt.status === 'open' ? (
              <Button variant="secondary" onClick={() => setDebtStatus(debt.id, 'closed')}>
                Kapat
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setDebtStatus(debt.id, 'open')}>
                Yeniden Aç
              </Button>
            )}
            <Button variant="danger" onClick={handleDeleteDebt}>
              Sil
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">Ödemeler</h3>
          <Button onClick={() => setShowPaymentForm(true)}>+ Ödeme</Button>
        </div>

        {(payments ?? []).length === 0 && <EmptyState text="Henüz ödeme yok." />}
        {[...(payments ?? [])].reverse().map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div>
              <CurrencyText amount={p.amount} className="text-sm font-medium text-emerald-400" />
              <p className="text-xs text-slate-500">
                {formatDate(p.date)}
                {p.note ? ` · ${p.note}` : ''}
              </p>
            </div>
            <button onClick={() => handleDeletePayment(p.id)} className="text-rose-400">
              Sil
            </button>
          </Card>
        ))}
      </div>

      {showPaymentForm && <PaymentForm debtId={debt.id} onClose={() => setShowPaymentForm(false)} />}
      {showEditForm && <DebtForm initial={debt} onClose={() => setShowEditForm(false)} />}
    </div>
  )
}
