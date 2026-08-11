import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Trash2, Clock } from 'lucide-react'
import { getProcessos, removeProcesso, updateProcesso, addPrazo } from '../lib/storage'
import { buscarProcesso } from '../lib/datajud'
import { calcularPrazos, diasRestantes, statusPrazo } from '../lib/prazos'

export default function ProcessoDetalhe() {
  const { numero } = useParams()
  const navigate = useNavigate()
  const numeroDecoded = decodeURIComponent(numero)
  const [processo, setProcesso] = useState(null)
  const [atualizando, setAtualizando] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const p = getProcessos().find((x) => x.numero === numeroDecoded)
    setProcesso(p || null)
    if (p?.temNovidade) updateProcesso(numeroDecoded, { temNovidade: false })
  }, [numeroDecoded])

  async function handleAtualizar() {
    setAtualizando(true)
    setMsg('')
    try {
      const dados = await buscarProcesso(numeroDecoded)
      if (!dados) { setMsg('❌ Processo não encontrado.'); return }
      const houveMudanca = dados.ultimaMov !== processo?.ultimaMov
      updateProcesso(numeroDecoded, { ...dados })
      const prazosNovos = calcularPrazos(dados.movimentacoes)
      for (const prazo of prazosNovos) addPrazo(numeroDecoded, prazo)
      const p = getProcessos().find((x) => x.numero === numeroDecoded)
      setProcesso(p || null)
      setMsg(houveMudanca ? '🔔 Nova movimentação detectada!' : '✅ Já está atualizado.')
    } catch (err) {
      setMsg(`❌ ${err.message}`)
    } finally {
      setAtualizando(false)
    }
  }

  function handleRemover() {
    if (!window.confirm(`Remover processo ${numeroDecoded}?`)) return
    removeProcesso(numeroDecoded)
    navigate('/')
  }

  if (!processo) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-sm mb-6 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="card text-center py-12" style={{ color: 'var(--text-muted)' }}>Processo não encontrado.</div>
      </div>
    )
  }

  const prazos = (processo.prazos || []).filter((pr) => diasRestantes(pr.data) >= 0)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-medium" style={{ color: 'var(--gold)' }}>{processo.numero}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{processo.tribunal} — {processo.classe}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleAtualizar} disabled={atualizando} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${atualizando ? 'animate-spin' : ''}`} />
            {atualizando ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button onClick={handleRemover} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }} title="Remover">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-lg text-sm border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          {msg}
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Polo Ativo', value: processo.poloAtivo },
          { label: 'Polo Passivo', value: processo.poloPassivo },
          { label: 'Assunto', value: processo.assunto },
          { label: 'Órgão Julgador', value: processo.orgaoJulgador },
          { label: 'Data de Ajuizamento', value: processo.dataAjuizamento },
          { label: 'Valor da Causa', value: processo.valorCausa },
        ].filter(({ value }) => value && value !== 'N/A').map(({ label, value }) => (
          <div key={label} className="card">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-sm" style={{ color: 'var(--text)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Prazos */}
      {prazos.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" style={{ color: '#f59e0b' }} />
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Prazos Ativos</h2>
          </div>
          <div className="space-y-2">
            {prazos.map((pr) => {
              const dias = diasRestantes(pr.data)
              const status = statusPrazo(dias)
              return (
                <div key={pr.id} className="flex items-center justify-between gap-3 p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text)' }}>{pr.tipo}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Vence: {pr.data}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    status === 'urgente' ? 'badge-urgente' :
                    status === 'atencao' ? 'badge-novo' : 'badge-ok'
                  }`}>
                    {dias === 0 ? 'Hoje' : `${dias}d`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Movimentações */}
      <div className="card">
        <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Movimentações</h2>
        {(processo.movimentacoes || []).length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Clique em "Atualizar" para buscar as movimentações.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-[88px] top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />
            <div className="space-y-4">
              {(processo.movimentacoes || []).map((m, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-xs font-mono w-20 flex-shrink-0 pt-0.5 text-right" style={{ color: 'var(--text-muted)' }}>{m.data}</span>
                  <div className="relative pl-5">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--gold)', border: '2px solid var(--bg)' }} />
                    <p className="text-sm" style={{ color: 'var(--text)' }}>{m.descricao}</p>
                    {m.complemento && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.complemento}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
