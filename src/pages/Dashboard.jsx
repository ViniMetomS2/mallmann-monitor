import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Search, AlertCircle, Bell, CheckCircle } from 'lucide-react'
import { getProcessos, updateProcesso, addPrazo } from '../lib/storage'
import { buscarProcesso } from '../lib/datajud'
import { calcularPrazos, diasRestantes, statusPrazo } from '../lib/prazos'

export default function Dashboard() {
  const [processos, setProcessos] = useState(() => getProcessos())
  const [busca, setBusca] = useState('')
  const [atualizando, setAtualizando] = useState(null)

  const reload = () => setProcessos(getProcessos())

  const filtrados = processos.filter((p) => {
    const q = busca.toLowerCase()
    return (
      p.numero?.includes(q) ||
      p.nome?.toLowerCase().includes(q) ||
      p.poloAtivo?.toLowerCase().includes(q) ||
      p.poloPassivo?.toLowerCase().includes(q)
    )
  })

  const novidades = processos.filter((p) => p.temNovidade).length
  const prazosHoje = processos.reduce((acc, p) => {
    const ativos = (p.prazos || []).filter((pr) => diasRestantes(pr.data) <= 1 && diasRestantes(pr.data) >= 0)
    return acc + ativos.length
  }, 0)

  async function handleAtualizar(numero) {
    setAtualizando(numero)
    try {
      const dados = await buscarProcesso(numero)
      if (!dados) return
      const p = processos.find((x) => x.numero === numero)
      const houveMudanca = dados.ultimaMov !== p?.ultimaMov
      updateProcesso(numero, {
        ...dados,
        temNovidade: houveMudanca ? true : (p?.temNovidade || false),
      })
      const prazosNovos = calcularPrazos(dados.movimentacoes)
      for (const prazo of prazosNovos) addPrazo(numero, prazo)
      reload()
    } catch (err) {
      console.error(err)
    } finally {
      setAtualizando(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Processos</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {processos.length} processo{processos.length !== 1 ? 's' : ''} monitorado{processos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/adicionar" className="btn-primary">+ Adicionar</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: processos.length, color: 'var(--gold)' },
          { label: 'Novidades', value: novidades, color: novidades > 0 ? '#e8c057' : 'var(--text-muted)' },
          { label: 'Prazos hoje', value: prazosHoje, color: prazosHoje > 0 ? '#ef4444' : 'var(--text-muted)' },
          { label: 'Em dia', value: processos.length - novidades, color: '#10b981' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-3xl font-semibold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          className="input pl-9"
          placeholder="Buscar por número, nome ou parte..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Process list */}
      <div className="card p-0 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.5fr_100px_90px_90px] gap-4 px-5 py-3 border-b text-xs uppercase tracking-wide"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <div>Processo</div>
          <div>Última movimentação</div>
          <div>Tribunal</div>
          <div>Status</div>
          <div>Ações</div>
        </div>

        {filtrados.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>
            {processos.length === 0
              ? 'Nenhum processo adicionado ainda.'
              : 'Nenhum resultado para a busca.'}
          </div>
        ) : (
          filtrados.map((p) => {
            const prazosAtivos = (p.prazos || []).filter((pr) => diasRestantes(pr.data) >= 0)
            const prazoUrgente = prazosAtivos.find((pr) => statusPrazo(diasRestantes(pr.data)) === 'urgente')
            return (
              <div
                key={p.numero}
                className="grid grid-cols-[2fr_1.5fr_100px_90px_90px] gap-4 px-5 py-4 border-b items-center hover:opacity-90 transition-opacity"
                style={{ borderColor: 'var(--border-light)' }}
              >
                {/* Número e nome */}
                <div>
                  <Link to={`/processo/${encodeURIComponent(p.numero)}`}>
                    <p className="font-mono text-xs font-medium hover:underline" style={{ color: 'var(--gold)' }}>
                      {p.numero}
                    </p>
                  </Link>
                  <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--text)' }}>
                    {p.nome || `${p.poloAtivo || '?'} × ${p.poloPassivo || '?'}`}
                  </p>
                </div>

                {/* Última mov */}
                <div>
                  <p className="text-sm truncate" style={{ color: 'var(--text)' }}>{p.ultimaMov || '—'}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.ultimaData || ''}</p>
                </div>

                {/* Tribunal */}
                <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  {p.tribunal || '—'}
                </div>

                {/* Status */}
                <div>
                  {p.temNovidade ? (
                    <span className="badge-novo">NOVO</span>
                  ) : prazoUrgente ? (
                    <span className="badge-urgente">URGENTE</span>
                  ) : (
                    <span className="badge-ok">em dia</span>
                  )}
                </div>

                {/* Ações */}
                <div>
                  <button
                    onClick={() => handleAtualizar(p.numero)}
                    disabled={atualizando === p.numero}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    title="Atualizar"
                  >
                    <RefreshCw className={`w-4 h-4 ${atualizando === p.numero ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
