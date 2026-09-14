import { z } from 'zod'
import { db } from '../db/db'

// Yedek dosyasının şekli — geri yüklerken bu şemayla doğrulanır,
// bozuk/yanlış bir dosyanın veritabanını kirletmesi önlenir.
//
// İleriye/geriye dönük uyumluluk kasıtlı: her tablo `.optional().default([])` —
// böylece ileride yeni bir tablo/özellik eklendiğinde:
//   - ESKİ bir yedek YENİ uygulamada geri yüklenebilir (yeni tablo boş başlar,
//     reddedilmez),
//   - YENİ bir yedek ESKİ bir uygulama sürümünde açılırsa (zod nesneleri
//     bilmediği ek alanları sessizce yok sayar) çökmez.
// `version` de sabit `1` değil, herhangi bir pozitif tam sayı kabul eder —
// tabloları tek tek eklemek/genişletmek bu numarayı artırmayı gerektirmez.
const backupSchema = z.object({
  version: z.number().int().positive(),
  exportedAt: z.string(),
  data: z.object({
    settings: z.array(z.record(z.string(), z.unknown())).optional().default([]),
    categories: z.array(z.record(z.string(), z.unknown())).optional().default([]),
    transactions: z.array(z.record(z.string(), z.unknown())).optional().default([]),
    debts: z.array(z.record(z.string(), z.unknown())).optional().default([]),
    debtPayments: z.array(z.record(z.string(), z.unknown())).optional().default([]),
    holdings: z.array(z.record(z.string(), z.unknown())).optional().default([]),
    holdingLots: z.array(z.record(z.string(), z.unknown())).optional().default([]),
    priceSnapshots: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  }),
})

export type BackupFile = z.infer<typeof backupSchema>

export async function exportBackup(): Promise<BackupFile> {
  const [settings, categories, transactions, debts, debtPayments, holdings, holdingLots, priceSnapshots] =
    await Promise.all([
      db.settings.toArray(),
      db.categories.toArray(),
      db.transactions.toArray(),
      db.debts.toArray(),
      db.debtPayments.toArray(),
      db.holdings.toArray(),
      db.holdingLots.toArray(),
      db.priceSnapshots.toArray(),
    ])

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      settings,
      categories,
      transactions,
      debts,
      debtPayments,
      holdings,
      holdingLots,
      priceSnapshots,
    },
  } as unknown as BackupFile
}

export function downloadBackup(backup: BackupFile): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `finans-rehberim-yedek-${stamp}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export class InvalidBackupError extends Error {}

export function parseBackupFile(raw: string): BackupFile {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    throw new InvalidBackupError('Dosya geçerli bir JSON değil.')
  }

  const result = backupSchema.safeParse(json)
  if (!result.success) {
    throw new InvalidBackupError('Dosya beklenen yedek formatına uymuyor.')
  }
  return result.data
}

/** Mevcut tüm verinin üzerine yazar (geri dönüşü olmayan bir işlemdir). */
export async function restoreBackup(backup: BackupFile): Promise<void> {
  await db.transaction(
    'rw',
    [db.settings, db.categories, db.transactions, db.debts, db.debtPayments, db.holdings, db.holdingLots, db.priceSnapshots],
    async () => {
      await Promise.all([
        db.settings.clear(),
        db.categories.clear(),
        db.transactions.clear(),
        db.debts.clear(),
        db.debtPayments.clear(),
        db.holdings.clear(),
        db.holdingLots.clear(),
        db.priceSnapshots.clear(),
      ])

      await Promise.all([
        db.settings.bulkAdd((backup.data.settings ?? []) as never[]),
        db.categories.bulkAdd((backup.data.categories ?? []) as never[]),
        db.transactions.bulkAdd((backup.data.transactions ?? []) as never[]),
        db.debts.bulkAdd((backup.data.debts ?? []) as never[]),
        db.debtPayments.bulkAdd((backup.data.debtPayments ?? []) as never[]),
        db.holdings.bulkAdd((backup.data.holdings ?? []) as never[]),
        db.holdingLots.bulkAdd((backup.data.holdingLots ?? []) as never[]),
        db.priceSnapshots.bulkAdd((backup.data.priceSnapshots ?? []) as never[]),
      ])
    },
  )
}
