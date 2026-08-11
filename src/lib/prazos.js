/**
 * Calcula prazos processuais a partir de movimentações.
 */

const PRAZOS_MAPA = {
  'Publicação': 15,
  'Publicação de Acórdão': 15,
  'Juntada de Acórdão': 15,
  'Juntada': 15,
  'Citação': 15,
  'Intimação': 15,
  'Nova Intimação': 15,
  'Despacho': 5,
  'Decisão': 15,
  'Sentença': 15,
  'Embargo': 5,
}

function addDiasUteis(dataStr, dias) {
  const d = new Date(dataStr + 'T12:00:00')
  let count = 0
  while (count < dias) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return d.toISOString().slice(0, 10)
}

export function calcularPrazos(movimentacoes = []) {
  const prazos = []
  for (const mov of movimentacoes) {
    const descricao = mov.descricao || mov.nome || ''
    const matched = Object.entries(PRAZOS_MAPA).find(([k]) =>
      descricao.toLowerCase().includes(k.toLowerCase())
    )
    if (matched && mov.data) {
      const [tipo, dias] = matched
      prazos.push({
        tipo: `Prazo — ${tipo} (${dias} dias úteis)`,
        data: addDiasUteis(mov.data, dias),
        dataPublicacao: mov.data,
      })
    }
  }
  return prazos
}

export function diasRestantes(dataStr) {
  if (!dataStr) return 999
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const alvo = new Date(dataStr + 'T00:00:00')
  return Math.round((alvo - hoje) / 86400000)
}

export function statusPrazo(dias) {
  if (dias <= 2) return 'urgente'
  if (dias <= 7) return 'atencao'
  return 'ok'
}
