import { useState, type FormEvent } from 'react'
import type { LotAction } from '../../types/models'
import { addLot } from '../../db/repositories/portfolio'
import { Modal } from '../../components/Modal'
import { Field, Input, Textarea } from '../../components/Input'
import { Button } from '../../components/Button'
import { todayISO } from '../../lib/dateUtils'

interface LotFormProps {
  holdingId: string
  onClose: () => void
}

export function LotForm({ holdingId, onClose }: LotFormProps) {
  const [action, setAction] = useState<LotAction>('buy')
  const [date, setDate] = useState(todayISO())
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [fee, setFee] = useState('')
  const [note, setNote] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsedQty = Number(quantity)
    const parsedPrice = Number(price)
    if (!parsedQty || parsedQty <= 0 || !parsedPrice || parsedPrice <= 0) return

    await addLot({
      holdingId,
      action,
      date,
      quantity: parsedQty,
      price: parsedPrice,
      fee: fee ? Number(fee) : undefined,
      note: note.trim() || undefined,
    })
    onClose()
  }

  return (
    <Modal title="Alım / Satım Ekle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-1 rounded-lg bg-slate-800 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-1.5 text-sm ${action === 'buy' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
            onClick={() => setAction('buy')}
          >
            Alım
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-1.5 text-sm ${action === 'sell' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
            onClick={() => setAction('sell')}
          >
            Satım
          </button>
        </div>

        <div className="flex gap-2">
          <Field label="Adet" className="flex-1">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.0001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </Field>
          <Field label="Birim Fiyat" className="flex-1">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.0001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Field>
        </div>

        <div className="flex gap-2">
          <Field label="Tarih" className="flex-1">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label="Komisyon (opsiyonel)" className="flex-1">
            <Input type="number" inputMode="decimal" min={0} step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} />
          </Field>
        </div>

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
