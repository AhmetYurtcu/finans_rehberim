import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { TransactionType } from '../../types/models'
import { addCategory, deleteCategory, listCategories } from '../../db/repositories/categories'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Card } from '../../components/Card'

export function CategoryManager() {
  const [type, setType] = useState<TransactionType>('expense')
  const [name, setName] = useState('')
  const categories = useLiveQuery(() => listCategories(type), [type])

  async function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed) return
    await addCategory({ type, name: trimmed })
    setName('')
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategory(id)
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-slate-300">Kategoriler</h3>
      <div className="mb-3 flex gap-1 rounded-lg bg-slate-800 p-1">
        <button
          className={`flex-1 rounded-md py-1.5 text-sm ${type === 'expense' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
          onClick={() => setType('expense')}
        >
          Gider
        </button>
        <button
          className={`flex-1 rounded-md py-1.5 text-sm ${type === 'income' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
          onClick={() => setType('income')}
        >
          Gelir
        </button>
      </div>

      <ul className="mb-3 flex flex-col gap-1.5">
        {categories?.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-sm">
            <span>
              {c.icon} {c.name}
            </span>
            {!c.isDefault && (
              <button onClick={() => handleDelete(c.id)} className="text-rose-400">
                Sil
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Yeni kategori adı"
          className="flex-1"
        />
        <Button variant="secondary" onClick={handleAdd}>
          Ekle
        </Button>
      </div>
    </Card>
  )
}
