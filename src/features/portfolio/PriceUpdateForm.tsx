import { useState, type FormEvent } from 'react'
import { addPriceSnapshot } from '../../db/repositories/portfolio'
import { Modal } from '../../components/Modal'
import { Field, Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { todayISO } from '../../lib/dateUtils'

interface PriceUpdateFormProps {
  holdingId: string
  onClose: () => void
}

export function PriceUpdateForm({ holdingId, onClose }: PriceUpdateFormProps) {
  const [date, setDate] = useState(todayISO())
  const [price, setPrice] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = Number(price)
    if (!parsed || parsed <= 0) return

    await addPriceSnapshot({ holdingId, date, price: parsed })
    onClose()
  }

  return (
    <Modal title="Güncel Fiyatı Güncelle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Güncel Birim Fiyat">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.0001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            autoFocus
          />
        </Field>
        <Field label="Tarih">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <Button type="submit" className="mt-1">
          Kaydet
        </Button>
      </form>
    </Modal>
  )
}
