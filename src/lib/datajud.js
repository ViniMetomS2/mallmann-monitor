/**
 * Cliente DataJud (CNJ) — busca processos via API pública.
 */

const API_KEY = 'ApiKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='

const TRIBUNAIS = {
  '8.01': 'tjac', '8.02': 'tjal', '8.03': 'tjap', '8.04': 'tjam',
  '8.05': 'tjba', '8.06': 'tjce', '8.07': 'tjdft', '8.08': 'tjes',
  '8.09': 'tjgo', '8.10': 'tjma', '8.11': 'tjmt', '8.12': 'tjms',
  '8.13': 'tjmg', '8.14': 'tjpa', '8.15': 'tjpb', '8.16': 'tjpr',
  '8.17': 'tjpe', '8.18': 'tjpi', '8.19': 'tjrj', '8.20': 'tjrn',
  '8.21': 'tjrs', '8.22': 'tjro', '8.23': 'tjrr', '8.24': 'tjsc',
  '8.25': 'tjse', '8.26': 'tjsp', '8.27': 'tjto',
  '4.01': 'trf1', '4.02': 'trf2', '4.03': 'trf3', '4.04': 'trf4', '4.05': 'trf5', '4.06': 'trf6',
  '5.01': 'trt1', '5.02': 'trt2', '5.03': 'trt3', '5.04': 'trt4',
  '5.05': 'trt5', '5.06': 'trt6', '5.07': 'trt7', '5.08': 'trt8',
  '5.09': 'trt9', '5.10': 'trt10', '5.11': 'trt11', '5.12': 'trt12',
  '5.13': 'trt13', '5.14': 'trt14', '5.15': 'trt15', '5.16': 'trt16',
  '5.17': 'trt17', '5.18': 'trt18', '5.19': 'trt19', '5.20': 'trt20',
  '5.21': 'trt21', '5.22': 'trt22', '5.23': 'trt23', '5.24': 'trt24',
  '3.00': 'stj', '1.00': 'stf', '7.00': 'tse',
}

function identificarTribunal(numero) {
  const match = numero.trim().match(/(\d{7})-?(\d{2})\.?(\d{4})\.?(\d)\.?(\d{2})\.?(\d{4})/)
  if (!match) return null
  const j = match[4]
  const tt = match[5].padStart(2, '0')
  return TRIBUNAIS[`${j}.${tt}`] || null
}

function normalizarNumero(numero) {
  return numero.replace(/[.\-]/g, '')
}

export async function buscarProcesso(numero) {
  const tribunal = identificarTribunal(numero)
  if (!tribunal) throw new Error('Número de processo inválido ou tribunal não identificado.')
  const numeroLimpo = normalizarNumero(numero)
  const url = `/api/datajud/api_publica_${tribunal}/_search`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ size: 1, query: { match: { numeroProcesso: numeroLimpo } } }),
  })
  if (!resp.ok) throw new Error(`Erro DataJud: ${resp.status}`)
  const data = await resp.json()
  const hits = data?.hits?.hits || []
  if (!hits.length) return null
  const source = hits[0]._source
  const movimentos = (source.movimentos || []).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
  const partes = source.partes || []
  const poloAtivo = partes.find((p) =>
    ['ATIVO','AT','A','AUTOR','REQUERENTE','RECLAMANTE','EXEQUENTE','IMPETRANTE','APELANTE'].includes((p.polo||'').toUpperCase())
  )?.nome || partes[0]?.nome || 'N/A'
  const poloPassivo = partes.find((p) =>
    ['PASSIVO','PA','P','RÉU','REU','REQUERIDO','RECLAMADO','EXECUTADO','IMPETRADO','APELADO'].includes((p.polo||'').toUpperCase())
  )?.nome || partes[1]?.nome || 'N/A'
  const ultima = movimentos[0] || {}
  const valorCausa = source.valorCausa != null
    ? Number(source.valorCausa).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : null
  return {
    numero,
    tribunal: tribunal.toUpperCase(),
    classe: source.classe?.nome || 'N/A',
    assunto: source.assuntos?.[0]?.nome || 'N/A',
    assuntos: (source.assuntos || []).map((a) => a.nome).filter(Boolean),
    poloAtivo,
    poloPassivo,
    orgaoJulgador: source.orgaoJulgador?.nome || 'N/A',
    dataAjuizamento: source.dataAjuizamento ? source.dataAjuizamento.slice(0, 10) : null,
    grau: source.grau || null,
    valorCausa,
    ultimaMov: ultima.nome || '',
    ultimaData: (ultima.dataHora || '').slice(0, 10),
    movimentacoes: movimentos.map((m) => {
      const comps = (m.complementosTabelados || []).map((c) => c.nome).filter(Boolean)
      const comp = [...comps, m.complemento || ''].filter(Boolean).join(' · ')
      return {
        data: (m.dataHora || '').slice(0, 10),
        hora: (m.dataHora || '').slice(11, 16),
        descricao: m.nome || 'N/A',
        complemento: comp,
      }
    }),
  }
}

export function formatarNumero(numero) {
  const limpo = numero.replace(/\D/g, '')
  if (limpo.length !== 20) return numero
  return `${limpo.slice(0,7)}-${limpo.slice(7,9)}.${limpo.slice(9,13)}.${limpo.slice(13,14)}.${limpo.slice(14,16)}.${limpo.slice(16,20)}`
}
