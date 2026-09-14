import { useState, type FormEvent } from 'react'
import { addDebtPayment } from '../../db/repositories/debts'
import { Modal } from '../../components/Modal'
import { Field, Input, Textarea } from '../../components/Input'
import { Button } from '../../components/Button'
import { todayISO } from '../../lib/dateUtils'

interface PaymentFormProps {
  debtId: string
  onClose: () => void
}

export function PaymentForm({ debtId, onClose }: PaymentFormProps) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!parsed || parsed <= 0) return

    await addDebtPayment({ debtId, amount: parsed, date, note: note.trim() || undefined })
    onClose()
  }

  return (
    <Modal title="Ödeme Ekle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Tutar">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
          />
        </Field>
        <Field label="Tarih">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <Field label="Not (opsiyonel)">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <Button type="submit" className="mt-1">
          Ekle
        </Button>
      </form>
    </Modal>
  )
}
