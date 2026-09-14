import { useState, type FormEvent } from 'react'
import type { AssetType, Holding, Market } from '../../types/models'
import { addHolding, updateHolding } from '../../db/repositories/portfolio'
import { Modal } from '../../components/Modal'
import { Field, Input, Textarea } from '../../components/Input'
import { Button } from '../../components/Button'

interface HoldingFormProps {
  initial?: Holding
  onClose: () => void
}

const MARKET_BY_TYPE: Record<AssetType, Market> = { fund: 'TEFAS', stock: 'BIST' }

export function HoldingForm({ initial, onClose }: HoldingFormProps) {
  const [assetType, setAssetType] = useState<AssetType>(initial?.assetType ?? 'fund')
  const [code, setCode] = useState(initial?.code ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [note, setNote] = useState(initial?.note ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!code.trim() || !name.trim()) return

    const input = {
      assetType,
      market: MARKET_BY_TYPE[assetType],
      code: code.trim().toUpperCase(),
      name: name.trim(),
      note: note.trim() || undefined,
    }

    if (initial) {
      await updateHolding(initial.id, input)
    } else {
      await addHolding(input)
    }
    onClose()
  }

  return (
    <Modal title={initial ? 'Varlığı Düzenle' : 'Yeni Varlık Ekle'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-1 rounded-lg bg-slate-800 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-1.5 text-sm ${assetType === 'fund' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
            onClick={() => setAssetType('fund')}
          >
            Fon (TEFAS)
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-1.5 text-sm ${assetType === 'stock' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
            onClick={() => setAssetType('stock')}
          >
            Hisse (BIST)
          </button>
        </div>

        <Field label={assetType === 'fund' ? 'Fon Kodu (örn. AFA)' : 'Hisse Kodu (örn. THYAO)'}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} required />
        </Field>

        <Field label="İsim">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
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
