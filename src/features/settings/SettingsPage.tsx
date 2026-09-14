import { PageHeader } from '../../components/PageHeader'
import { CategoryManager } from './CategoryManager'
import { BackupExportImport } from './BackupExportImport'

export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Ayarlar" />
      <div className="flex flex-col gap-4 px-4">
        <CategoryManager />
        <BackupExportImport />
        <p className="pb-4 text-center text-xs text-slate-600">Finans Rehberim · Para birimi: TRY</p>
      </div>
    </div>
  )
}
