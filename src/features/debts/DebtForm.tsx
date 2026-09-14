import { useState, type FormEvent } from 'react'
import type { Debt, DebtDirection } from '../../types/models'
import { addDebt, updateDebt } from '../../db/repositories/debts'
import { Modal } from '../../components/Modal'
import { Field, Input, Select, Textarea } from '../../components/Input'
import { Button } from '../../components/Button'
import { todayISO } from '../../lib/dateUtils'

interface DebtFormProps {
  initial?: Debt
  onClose: () => void
}

export function DebtForm({ initial, onClose }: DebtFormProps) {
  const [direction, setDirection] = useState<DebtDirection>(initial?.direction ?? 'borrowed')
  const [counterparty, setCounterparty] = useState(initial?.counterparty ?? '')
  const [principal, setPrincipal] = useState(initial ? String(initial.principal) : '')
  const [currency, setCurrency] = useState<Debt['currency']>(initial?.currency ?? 'TRY')
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayISO())
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '')
  const [note, setNote] = useState(initial?.note ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsedPrincipal = Number(principal)
    if (!parsedPrincipal || parsedPrincipal <= 0 || !counterparty.trim()) return

    const input = {
      direction,
      counterparty: counterparty.trim(),
      principal: parsedPrincipal,
      currency,
      startDate,
      dueDate: dueDate || undefined,
      note: note.trim() || undefined,
    }

    if (initial) {
      await updateDebt(initial.id, input)
    } else {
      await addDebt(input)
    }
    onClose()
  }

  return (
    <Modal title={initial ? 'Borcu Düzenle' : 'Yeni Borç'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-1 rounded-lg bg-slate-800 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-1.5 text-sm ${direction === 'borrowed' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
            onClick={() => setDirection('borrowed')}
          >
            Borç Aldım
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-1.5 text-sm ${direction === 'lent' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
            onClick={() => setDirection('lent')}
          >
            Borç Verdim
          </button>
        </div>

        <Field label={direction === 'borrowed' ? 'Kime borçlandın' : 'Kime borç verdin'}>
          <Input value={counterparty} onChange={(e) => setCounterparty(e.target.value)} required />
        </Field>

        <div className="flex gap-2">
          <Field label="Tutar" className="flex-1">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              required
            />
          </Field>
          <Field label="Para Birimi" className="w-24">
            <Select value={currency} onChange={(e) => setCurrency(e.target.value as Debt['currency'])}>
              <option value="TRY">TRY</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Select>
          </Field>
        </div>

        <div className="flex gap-2">
          <Field label="Başlangıç Tarihi" className="flex-1">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </Field>
          <Field label="Vade (opsiyonel)" className="flex-1">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
        </div>

        <Field label="Not (opsiyonel)">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>

        <Button type="submit" className="mt-1">
          {initial ? 'Kaydet' : 'Ekle'}
        </Button>
      </form>
    </Modal>
  )
}
