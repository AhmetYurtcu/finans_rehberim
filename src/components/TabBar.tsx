import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Özet', icon: '🏠' },
  { to: '/gelir-gider', label: 'Gelir/Gider', icon: '💳' },
  { to: '/borclar', label: 'Borçlar', icon: '🤝' },
  { to: '/portfoy', label: 'Portföy', icon: '📈' },
  { to: '/ayarlar', label: 'Ayarlar', icon: '⚙️' },
]

export function TabBar() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-900/95 backdrop-blur">
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[11px] ${
                  isActive ? 'text-emerald-400' : 'text-slate-500'
                }`
              }
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
