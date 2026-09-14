import { db } from '../db'
import type { Settings } from '../../types/models'
import { nowISO } from '../../lib/dateUtils'

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.get(1)
  if (existing) return existing

  const created: Settings = {
    id: 1,
    currency: 'TRY',
    locale: 'tr-TR',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  await db.settings.put(created)
  return created
}
