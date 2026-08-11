import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Calendar, Mail, Plus, Settings, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const links = [
  { to: '/',              icon: LayoutDashboard, label: 'Processos' },
  { to: '/calendario',   icon: Calendar,         label: 'Calendário' },
  { to: '/emails',       icon: Mail,             label: 'Emails' },
  { to: '/adicionar',    icon: Plus,             label: 'Adicionar' },
  { to: '/configuracoes',icon: Settings,         label: 'Configurações' },
]

export default function Sidebar({ emailsNaoLidos = 0 }) {
  const { dark, toggle } = useTheme()

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-screen sticky top-0 border-r"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>

      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="text-lg font-semibold" style={{ color: 'var(--gold)' }}>
          Mallmann
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Monitor Jurídico
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {label === 'Emails' && emailsNaoLidos > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--gold)', color: '#fff' }}>
                {emailsNaoLidos}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={toggle}
          className="nav-link w-full"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{dark ? 'Modo claro' : 'Modo noturno'}</span>
        </button>
      </div>
    </aside>
  )
}
