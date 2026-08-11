import { useEffect, useState } from 'react'
import { Mail, MailOpen, RefreshCw, AlertCircle } from 'lucide-react'
import { subscribeEmails, marcarLido } from '../lib/emails'

export default function Emails() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [selecionado, setSelecionado] = useState(null)

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeEmails((lista) => {
      setEmails(lista)
      setLoading(false)
    })
    return unsub
  }, [])

  async function handleAbrir(email) {
    setSelecionado(email)
    if (!email.lido) {
      await marcarLido(email.id)
    }
  }

  const naoLidos = emails.filter((e) => !e.lido).length

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Emails</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            processos@advmallmann.com
            {naoLidos > 0 && <span className="ml-2 font-medium" style={{ color: 'var(--gold)' }}>• {naoLidos} não lido{naoLidos > 1 ? 's' : ''}</span>}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card py-16 text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: 'var(--gold)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Carregando emails...</p>
        </div>
      ) : emails.length === 0 ? (
        <div className="card py-16 text-center">
          <Mail className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--border)' }} />
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>Nenhum email ainda</p>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
            Os emails recebidos em processos@advmallmann.com aparecerão aqui automaticamente quando o PROJUDI enviar notificações.
          </p>
          <div className="mt-6 card max-w-sm mx-auto text-left">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Como funciona</p>
            <ol className="text-sm space-y-1.5" style={{ color: 'var(--text)' }}>
              <li>1. Cadastre processos@advmallmann.com nos processos do PJe</li>
              <li>2. O PROJUDI envia email ao ocorrer movimentação</li>
              <li>3. O Make lê e salva aqui automaticamente</li>
              <li>4. O processo é atualizado no sistema</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[300px_1fr] gap-4 h-[calc(100vh-160px)]">
          {/* Lista */}
          <div className="card p-0 overflow-y-auto">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => handleAbrir(email)}
                className="w-full text-left px-4 py-3 border-b transition-colors"
                style={{
                  borderColor: 'var(--border-light)',
                  background: selecionado?.id === email.id ? 'rgba(201,151,58,0.08)' : 'transparent',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {email.lido
                    ? <MailOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    : <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--gold)' }} />
                  }
                  <span className={`text-xs truncate flex-1 ${email.lido ? '' : 'font-semibold'}`}
                    style={{ color: email.lido ? 'var(--text-muted)' : 'var(--text)' }}>
                    {email.from || 'PROJUDI'}
                  </span>
                  <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {email.receivedAt ? new Date(email.receivedAt).toLocaleDateString('pt-BR') : ''}
                  </span>
                </div>
                <p className={`text-xs truncate ${email.lido ? '' : 'font-medium'}`}
                  style={{ color: email.lido ? 'var(--text-muted)' : 'var(--text)' }}>
                  {email.subject || 'Sem assunto'}
                </p>
                {email.processNumber && (
                  <p className="text-[10px] mt-0.5 font-mono truncate" style={{ color: 'var(--gold)' }}>
                    {email.processNumber}
                  </p>
                )}
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <div className="card overflow-y-auto">
            {selecionado ? (
              <>
                <div className="border-b pb-4 mb-4" style={{ borderColor: 'var(--border)' }}>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
                    {selecionado.subject || 'Sem assunto'}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span><strong>De:</strong> {selecionado.from}</span>
                    <span><strong>Data:</strong> {selecionado.receivedAt ? new Date(selecionado.receivedAt).toLocaleString('pt-BR') : '—'}</span>
                    {selecionado.processNumber && (
                      <span className="font-mono" style={{ color: 'var(--gold)' }}>
                        Processo: {selecionado.processNumber}
                      </span>
                    )}
                    {selecionado.movimento && (
                      <span className="badge-novo">{selecionado.movimento}</span>
                    )}
                  </div>
                </div>
                <pre className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text)', fontFamily: 'inherit' }}>
                  {selecionado.body || 'Conteúdo não disponível.'}
                </pre>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <Mail className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Selecione um email para ler</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
