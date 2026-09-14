import { db } from '../db'
import type { Category, TransactionType } from '../../types/models'
import { createId } from '../../lib/id'

const DEFAULT_CATEGORIES: Array<Pick<Category, 'type' | 'name' | 'icon'>> = [
  { type: 'income', name: 'Maaş', icon: '💼' },
  { type: 'income', name: 'Ek Gelir', icon: '➕' },
  { type: 'income', name: 'Yatırım Geliri', icon: '📈' },
  { type: 'income', name: 'Diğer Gelir', icon: '💰' },
  { type: 'expense', name: 'Market', icon: '🛒' },
  { type: 'expense', name: 'Kira', icon: '🏠' },
  { type: 'expense', name: 'Faturalar', icon: '🧾' },
  { type: 'expense', name: 'Ulaşım', icon: '🚗' },
  { type: 'expense', name: 'Sağlık', icon: '🏥' },
  { type: 'expense', name: 'Eğlence', icon: '🎬' },
  { type: 'expense', name: 'Giyim', icon: '👕' },
  { type: 'expense', name: 'Eğitim', icon: '📚' },
  { type: 'expense', name: 'Diğer Gider', icon: '📦' },
]

/**
 * İlk çalıştırmada varsayılan kategorileri tohumlar; kategori tablosu boşsa çalışır.
 * Kontrol ve ekleme aynı 'rw' transaction içinde yapılır — React StrictMode'un
 * efekti geliştirmede iki kez tetiklemesi gibi durumlarda yarış (race) yaşanıp
 * kategorilerin iki kez eklenmesini önler.
 */
export async function seedDefaultCategoriesIfEmpty(): Promise<void> {
  await db.transaction('rw', db.categories, async () => {
    const count = await db.categories.count()
    if (count > 0) return

    const categories: Category[] = DEFAULT_CATEGORIES.map((c) => ({
      id: createId(),
      type: c.type,
      name: c.name,
      icon: c.icon,
      isDefault: true,
    }))

    await db.categories.bulkAdd(categories)
  })
}

export function listCategories(type?: TransactionType): Promise<Category[]> {
  if (type) {
    return db.categories.where('type').equals(type).toArray()
  }
  return db.categories.toArray()
}

export async function addCategory(input: { type: TransactionType; name: string; icon?: string }): Promise<Category> {
  const category: Category = {
    id: createId(),
    type: input.type,
    name: input.name,
    icon: input.icon,
    isDefault: false,
  }
  await db.categories.add(category)
  return category
}

export async function deleteCategory(id: string): Promise<void> {
  const category = await db.categories.get(id)
  if (category?.isDefault) {
    throw new Error('Varsayılan kategoriler silinemez.')
  }
  await db.categories.delete(id)
}
