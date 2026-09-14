import { useEffect, useState } from 'react'
import { HashRouter } from 'react-router-dom'
import { AppRouter } from './router'
import { TabBar } from './components/TabBar'
import { seedDefaultCategoriesIfEmpty } from './db/repositories/categories'
import { getSettings } from './db/repositories/settings'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([seedDefaultCategoriesIfEmpty(), getSettings()]).then(() => setReady(true))
  }, [])

  if (!ready) {
    return <div className="flex h-full items-center justify-center text-slate-500">Yükleniyor…</div>
  }

  return (
    <HashRouter>
      <div className="safe-top min-h-full pb-20">
        <AppRouter />
      </div>
      <TabBar />
    </HashRouter>
  )
}
