import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

const Dashboard = lazy(() => import('./features/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })))
const TransactionsPage = lazy(() =>
  import('./features/transactions/TransactionsPage').then((m) => ({ default: m.TransactionsPage })),
)
const DebtsListPage = lazy(() => import('./features/debts/DebtsListPage').then((m) => ({ default: m.DebtsListPage })))
const DebtDetailPage = lazy(() =>
  import('./features/debts/DebtDetailPage').then((m) => ({ default: m.DebtDetailPage })),
)
const PortfolioListPage = lazy(() =>
  import('./features/portfolio/PortfolioListPage').then((m) => ({ default: m.PortfolioListPage })),
)
const HoldingDetailPage = lazy(() =>
  import('./features/portfolio/HoldingDetailPage').then((m) => ({ default: m.HoldingDetailPage })),
)
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))

function PageFallback() {
  return <div className="p-4 text-sm text-slate-500">Yükleniyor…</div>
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/gelir-gider" element={<TransactionsPage />} />
        <Route path="/borclar" element={<DebtsListPage />} />
        <Route path="/borclar/:id" element={<DebtDetailPage />} />
        <Route path="/portfoy" element={<PortfolioListPage />} />
        <Route path="/portfoy/:id" element={<HoldingDetailPage />} />
        <Route path="/ayarlar" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  )
}
