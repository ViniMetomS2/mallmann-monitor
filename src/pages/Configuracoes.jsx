import { useState } from 'react'
import { Settings, Mail, Shield, Info } from 'lucide-react'

const FIREBASE_PROJECT = 'mallmann-monitor'
const FIREBASE_API_KEY = 'AIzaSyALu319U1mzMmyelzKqbI-7S02nFOE15OM'

export default function Configuracoes() {
  const [msg, setMsg] = useState('')

  async function limparDados() {
    if (!window.confirm('Isso vai remover TODOS os processos e prazos salvos localmente. Continuar?')) return
    localStorage.removeItem('mm_processos')
    localStorage.removeItem('mm_prazos')
    setMsg('✅ Dados locais removidos.')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Configurações</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Informações do sistema Mallmann Monitor</p>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-lg text-sm border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          {msg}
        </div>
      )}

      {/* Email */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Email de notificações</h2>
        </div>
        <div className="text-sm space-y-2" style={{ color: 'var(--text)' }}>
          <p><strong>Conta:</strong> processos@advmallmann.com</p>
          <p><strong>Webmail:</strong> <a href="https://pro.suite.uol.com.br" target="_blank" rel="noreferrer" className="hover:underline" style={{ color: 'var(--gold)' }}>pro.suite.uol.com.br</a></p>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Cadastre este email nos processos do PJe/PROJUDI. Quando ocorrer movimentação, o sistema recebe o email e atualiza automaticamente via Make.
          </p>
        </div>
      </div>

      {/* Firebase */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Banco de dados</h2>
        </div>
        <div className="text-sm space-y-2" style={{ color: 'var(--text)' }}>
          <p><strong>Firebase Project:</strong> {FIREBASE_PROJECT}</p>
          <p><strong>Região:</strong> nam5 (Estados Unidos)</p>
          <p><strong>Coleções:</strong> emails, config</p>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Emails recebidos via Make são salvos na coleção "emails" do Firestore e aparecem na aba Emails.
          </p>
        </div>
      </div>

      {/* Sobre */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Sobre o sistema</h2>
        </div>
        <div className="text-sm space-y-1.5" style={{ color: 'var(--text)' }}>
          <p><strong>Versão:</strong> 1.0.0</p>
          <p><strong>Fonte de dados:</strong> DataJud (CNJ) — API Pública</p>
          <p><strong>Notificações:</strong> PROJUDI/PJe via email → Make → Firestore</p>
          <p><strong>Escritório:</strong> Mallmann Advocacia</p>
        </div>
      </div>

      {/* Perigo */}
      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.03)' }}>
        <h2 className="font-semibold mb-3" style={{ color: '#ef4444' }}>Zona de perigo</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Remove todos os processos e prazos salvos localmente no navegador. Não afeta os emails do Firestore.
        </p>
        <button
          onClick={limparDados}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          Limpar dados locais
        </button>
      </div>
    </div>
  )
}
