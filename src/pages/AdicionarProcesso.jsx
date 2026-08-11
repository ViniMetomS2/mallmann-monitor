import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { buscarProcesso } from '../lib/datajud'
import { addProcesso, addPrazo } from '../lib/firestoreStorage'
import { calcularPrazos } from '../lib/prazos'

export default function AdicionarProcesso() {
  const navigate = useNavigate()
  const [numero, setNumero] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')
  const [adicionado, setAdicionado] = useState(false)

  async function handleBuscar(e) {
    e.preventDefault()
    if (!numero.trim()) return
    setLoading(true)
    setError('')
    setResultado(null)
    setAdicionado(false)
    setNome('')
    try {
      const data = await buscarProcesso(numero.trim())
      if (!data) setError('Processo não encontrado. Verifique o número e tente novamente.')
      else setResultado(data)
    } catch (err) {
      setError(err.message || 'Erro ao consultar o processo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdicionar() {
    if (!resultado) return
    setSalvando(true)
    setError('')
    try {
      const ok = await addProcesso({ ...resultado, nome: nome.trim() })
      if (!ok) { setError('Este processo já está sendo monitorado.'); return }
      const prazos = calcularPrazos(resultado.movimentacoes || [])
      for (const prazo of prazos) await addPrazo(resultado.numero, prazo)
      setAdicionado(true)
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err.message || 'Erro ao salvar o processo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Adicionar Processo</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Digite o número CNJ para consultar no sistema judicial.
        </p>
      </div>

      <div className="card mb-6">
        <form onSubmit={handleBuscar} className="flex gap-3">
          <input
            className="input flex-1 font-mono"
            placeholder="0000000-00.0000.0.00.0000"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
          <button type="submit" disabled={loading || !numero.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          Cobre todos os TJs, TRFs, TRTs, STJ e STF
        </p>
      </div>

      {error && (
        <div className="card mb-4 flex items-start gap-3" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
          <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
        </div>
      )}

      {adicionado && (
        <div className="card mb-4 flex items-center gap-3" style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#10b981' }} />
          <p className="text-sm" style={{ color: '#10b981' }}>Processo salvo na nuvem! Redirecionando...</p>
        </div>
      )}

      {resultado && !adicionado && (
        <div className="card">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="font-mono text-sm font-medium" style={{ color: 'var(--gold)' }}>{resultado.numero}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {resultado.tribunal} — {resultado.classe}
              </p>
            </div>
            <button
              onClick={handleAdicionar}
              disabled={salvando}
              className="btn-primary flex-shrink-0 disabled:opacity-60 flex items-center gap-2"
            >
              {salvando && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {salvando ? 'Salvando...' : '+ Monitorar'}
            </button>
          </div>

          <div className="mb-4">
            <label className="text-xs uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Nome / Apelido (opcional)
            </label>
            <input
              className="input"
              placeholder="Ex: João Silva — Indenização"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            {[
              { label: 'Polo Ativo', value: resultado.poloAtivo },
              { label: 'Polo Passivo', value: resultado.poloPassivo },
              { label: 'Assunto', value: resultado.assunto },
              { label: 'Órgão Julgador', value: resultado.orgaoJulgador },
            ].map(({ label, value }) => (
              <div key={label} className="card">
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p style={{ color: 'var(--text)' }}>{value || '—'}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Últimas movimentações</p>
            <div className="space-y-2">
              {resultado.movimentacoes.slice(0, 5).map((m, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="font-mono flex-shrink-0 w-24" style={{ color: 'var(--text-muted)' }}>{m.data}</span>
                  <span style={{ color: 'var(--text)' }}>{m.descricao}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
