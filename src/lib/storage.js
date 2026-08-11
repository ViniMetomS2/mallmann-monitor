/**
 * Persistência local (localStorage) para processos e prazos.
 * Firestore é usado apenas para emails recebidos via Make.
 */

const KEY_PROCESSOS = 'mm_processos'
const KEY_PRAZOS = 'mm_prazos'
const KEY_USER = 'mm_user'

// ── Usuário ─────────────────────────────────────────────────────────────────
export function getUser() {
  try { return JSON.parse(localStorage.getItem(KEY_USER) || 'null') } catch { return null }
}
export function setUser(user) {
  localStorage.setItem(KEY_USER, JSON.stringify(user))
}

// ── Processos ────────────────────────────────────────────────────────────────
export function getProcessos() {
  try { return JSON.parse(localStorage.getItem(KEY_PROCESSOS) || '[]') } catch { return [] }
}

export function addProcesso(processo) {
  const lista = getProcessos()
  if (lista.find((p) => p.numero === processo.numero)) return false
  lista.push({ ...processo, adicionadoEm: new Date().toISOString(), temNovidade: false })
  localStorage.setItem(KEY_PROCESSOS, JSON.stringify(lista))
  return true
}

export function updateProcesso(numero, campos) {
  const lista = getProcessos()
  const idx = lista.findIndex((p) => p.numero === numero)
  if (idx === -1) return false
  lista[idx] = { ...lista[idx], ...campos }
  localStorage.setItem(KEY_PROCESSOS, JSON.stringify(lista))
  return true
}

export function removeProcesso(numero) {
  const lista = getProcessos().filter((p) => p.numero !== numero)
  localStorage.setItem(KEY_PROCESSOS, JSON.stringify(lista))
  // Remove prazos
  const prazos = getPrazos().filter((p) => p.processo !== numero)
  localStorage.setItem(KEY_PRAZOS, JSON.stringify(prazos))
}

// ── Prazos ───────────────────────────────────────────────────────────────────
export function getPrazos() {
  try { return JSON.parse(localStorage.getItem(KEY_PRAZOS) || '[]') } catch { return [] }
}

export function addPrazo(numero, prazo) {
  const prazos = getPrazos()
  const existe = prazos.find((p) => p.processo === numero && p.tipo === prazo.tipo && p.data === prazo.data)
  if (existe) return false
  prazos.push({ ...prazo, processo: numero, id: `${numero}-${prazo.tipo}-${prazo.data}` })
  localStorage.setItem(KEY_PRAZOS, JSON.stringify(prazos))
  return true
}

export function getPrazosDoProcesso(numero) {
  return getPrazos().filter((p) => p.processo === numero)
}

export function removePrazo(id) {
  const prazos = getPrazos().filter((p) => p.id !== id)
  localStorage.setItem(KEY_PRAZOS, JSON.stringify(prazos))
}
