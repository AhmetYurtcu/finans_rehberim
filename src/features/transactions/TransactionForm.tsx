import { useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Transaction, TransactionType } from '../../types/models'
import { listCategories } from '../../db/repositories/categories'
import { addTransaction, updateTransaction } from '../../db/repositories/transactions'
import { Modal } from '../../components/Modal'
import { Field, Input, Select, Textarea } from '../../components/Input'
import { Button } from '../../components/Button'
import { todayISO } from '../../lib/dateUtils'

interface TransactionFormProps {
  initial?: Transaction
  onClose: () => void
}

export function TransactionForm({ initial, onClose }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [note, setNote] = useState(initial?.note ?? '')
  const categories = useLiveQuery(() => listCategories(type), [type])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0 || !categoryId) return

    const input = { type, amount: parsedAmount, categoryId, date, note: note.trim() || undefined }
    if (initial) {
      await updateTransaction(initial.id, input)
    } else {
      await addTransaction(input)
    }
    onClose()
  }

  return (
    <Modal title={initial ? 'İşlemi Düzenle' : 'Yeni İşlem'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-1 rounded-lg bg-slate-800 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-1.5 text-sm ${type === 'expense' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
            onClick={() => {
              setType('expense')
              setCategoryId('')
            }}
          >
            Gider
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-1.5 text-sm ${type === 'income' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
            onClick={() => {
              setType('income')
              setCategoryId('')
            }}
          >
            Gelir
          </button>
        </div>

        <Field label="Tutar (TRY)">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </Field>

        <Field label="Kategori">
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="" disabled>
              Seç…
            </option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tarih">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>

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
