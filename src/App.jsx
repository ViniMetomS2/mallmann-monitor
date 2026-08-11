import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Calendario from './pages/Calendario'
import Emails from './pages/Emails'
import AdicionarProcesso from './pages/AdicionarProcesso'
import ProcessoDetalhe from './pages/ProcessoDetalhe'
import Configuracoes from './pages/Configuracoes'
import { useTheme } from './hooks/useTheme'
import { subscribeEmails } from './lib/emails'

export default function App() {
  useTheme() // aplica classe dark no <html>
  const [emailsNaoLidos, setEmailsNaoLidos] = useState(0)

  useEffect(() => {
    const unsub = subscribeEmails((emails) => {
      setEmailsNaoLidos(emails.filter((e) => !e.lido).length)
    })
    return unsub
  }, [])

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar emailsNaoLidos={emailsNaoLidos} />
        <main className="flex-1 p-6 overflow-y-auto" style={{ background: 'var(--bg)' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/emails" element={<Emails />} />
            <Route path="/adicionar" element={<AdicionarProcesso />} />
            <Route path="/processo/:numero" element={<ProcessoDetalhe />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
