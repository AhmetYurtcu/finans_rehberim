import { useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { downloadBackup, exportBackup, InvalidBackupError, parseBackupFile, restoreBackup } from '../../lib/backup'

export function BackupExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  async function handleExport() {
    const backup = await exportBackup()
    downloadBackup(backup)
    setStatus('Yedek indirildi.')
  }

  async function handleImportFile(file: File) {
    const confirmed = confirm(
      'Bu işlem mevcut TÜM verilerin üzerine yazacak ve geri alınamaz. Yedek dosyasından geri yüklemek istediğine emin misin?',
    )
    if (!confirmed) return

    try {
      const text = await file.text()
      const backup = parseBackupFile(text)
      await restoreBackup(backup)
      setStatus('Yedek başarıyla geri yüklendi. Sayfa yenileniyor…')
      setTimeout(() => location.reload(), 800)
    } catch (err) {
      if (err instanceof InvalidBackupError) {
        setStatus(`Geri yükleme başarısız: ${err.message}`)
      } else {
        setStatus('Geri yükleme sırasında beklenmeyen bir hata oluştu.')
      }
    }
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-slate-300">Yedekleme</h3>
      <p className="mb-3 text-xs text-slate-500">
        Verilerin sadece bu cihazda saklanıyor. Telefon değişirse veya uygulama verisi silinirse kaybolmaması için
        düzenli olarak yedek al.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleExport}>
          Yedek İndir
        </Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Yedekten Geri Yükle
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImportFile(file)
            e.target.value = ''
          }}
        />
      </div>
      {status && <p className="mt-2 text-xs text-slate-400">{status}</p>}
    </Card>
  )
}
