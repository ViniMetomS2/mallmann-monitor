import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPrazos, getProcessos } from '../lib/storage'
import { diasRestantes, statusPrazo } from '../lib/prazos'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Calendario() {
  const hoje = new Date()
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth())

  const prazos = getPrazos()
  const processos = getProcessos()
  const processosMap = Object.fromEntries(processos.map((p) => [p.numero, p]))

  // Mapa: "YYYY-MM-DD" -> [{ prazo, processo }]
  const prazosMap = useMemo(() => {
    const m = {}
    for (const pr of prazos) {
      if (!pr.data) continue
      if (!m[pr.data]) m[pr.data] = []
      m[pr.data].push(pr)
    }
    return m
  }, [prazos])

  function navMes(dir) {
    let nm = mes + dir
    let na = ano
    if (nm < 0) { nm = 11; na-- }
    if (nm > 11) { nm = 0; na++ }
    setMes(nm)
    setAno(na)
  }

  // Build calendar grid
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < primeiroDia; i++) cells.push(null)
  for (let d = 1; d <= diasNoMes; d++) cells.push(d)

  const prazosMes = Object.entries(prazosMap).filter(([data]) => {
    const [y, m2] = data.split('-').map(Number)
    return y === ano && m2 - 1 === mes
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Calendário de Prazos</h1>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Calendar */}
        <div className="card p-0 overflow-hidden">
          {/* Nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => navMes(-1)} className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
              {MESES[mes]} {ano}
            </h2>
            <button onClick={() => navMes(1)} className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="text-center text-xs py-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {cells.map((dia, idx) => {
              const dataStr = dia ? `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}` : null
              const prazosDia = dataStr ? (prazosMap[dataStr] || []) : []
              const isHoje = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()
              const temPrazo = prazosDia.length > 0
              const urgente = prazosDia.some((pr) => statusPrazo(diasRestantes(pr.data)) === 'urgente')

              return (
                <div
                  key={idx}
                  className="min-h-[64px] p-2 border-r border-b"
                  style={{
                    borderColor: 'var(--border-light)',
                    background: temPrazo ? (urgente ? 'rgba(239,68,68,0.06)' : 'rgba(201,151,58,0.06)') : 'transparent',
                  }}
                >
                  {dia && (
                    <>
                      <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isHoje ? 'text-white' : ''}`}
                        style={{ background: isHoje ? 'var(--gold)' : 'transparent', color: isHoje ? '#fff' : 'var(--text-muted)' }}>
                        {dia}
                      </div>
                      {prazosDia.slice(0, 2).map((pr, i) => {
                        const p = processosMap[pr.processo]
                        const label = p?.nome || pr.processo?.slice(0, 12) || 'Processo'
                        const status = statusPrazo(diasRestantes(pr.data))
                        return (
                          <div key={i} className="text-[9px] rounded px-1 py-0.5 mb-0.5 truncate font-medium"
                            style={{
                              background: status === 'urgente' ? '#ef4444' : 'var(--gold)',
                              color: '#fff',
                            }}>
                            {label}
                          </div>
                        )
                      })}
                      {prazosDia.length > 2 && (
                        <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>+{prazosDia.length - 2}</div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar: prazos do mês */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Prazos em {MESES[mes]}
          </h3>
          {prazosMes.length === 0 ? (
            <div className="card text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
              Nenhum prazo neste mês
            </div>
          ) : (
            prazosMes
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([data, lista]) =>
                lista.map((pr, i) => {
                  const dias = diasRestantes(data)
                  const status = statusPrazo(dias)
                  const p = processosMap[pr.processo]
                  return (
                    <div key={`${data}-${i}`} className="card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{data}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          status === 'urgente' ? 'badge-urgente' :
                          status === 'atencao' ? 'badge-novo' : 'badge-ok'
                        }`}>
                          {dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `${dias}d`}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                        {p?.nome || pr.processo}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{pr.tipo}</p>
                    </div>
                  )
                })
              )
          )}
        </div>
      </div>
    </div>
  )
}
