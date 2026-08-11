/**
 * Persistência na nuvem via Firestore.
 * Processos e prazos ficam na collection "processos".
 * Prazos são armazenados como array dentro de cada documento de processo.
 */

import { db } from './firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

const COL = 'processos'

/** Converte número CNJ para ID seguro para Firestore */
function toId(numero) {
  return numero.replace(/[./\s]/g, '_')
}

// ── Processos ─────────────────────────────────────────────────────────────────

export async function getProcessos() {
  const snap = await getDocs(collection(db, COL))
  return snap.docs.map((d) => d.data())
}

export async function addProcesso(processo) {
  const id = toId(processo.numero)
  const ref = doc(db, COL, id)
  const existing = await getDoc(ref)
  if (existing.exists()) return false
  await setDoc(ref, {
    ...processo,
    adicionadoEm: new Date().toISOString(),
    temNovidade: false,
    prazos: [],
  })
  return true
}

export async function updateProcesso(numero, campos) {
  const id = toId(numero)
  const ref = doc(db, COL, id)
  await updateDoc(ref, campos)
  return true
}

export async function removeProcesso(numero) {
  const id = toId(numero)
  await deleteDoc(doc(db, COL, id))
}

// ── Prazos (armazenados dentro do documento do processo) ──────────────────────

export async function addPrazo(numero, prazo) {
  const id = toId(numero)
  const ref = doc(db, COL, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return false
  const data = snap.data()
  const prazos = data.prazos || []
  const prazoId = `${numero}-${prazo.tipo}-${prazo.data}`
  if (prazos.find((p) => p.id === prazoId)) return false
  prazos.push({ ...prazo, processo: numero, id: prazoId })
  await updateDoc(ref, { prazos })
  return true
}

export async function getPrazos() {
  const processos = await getProcessos()
  return processos.flatMap((p) => p.prazos || [])
}

export async function removePrazo(numero, prazoId) {
  const id = toId(numero)
  const ref = doc(db, COL, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const prazos = (snap.data().prazos || []).filter((p) => p.id !== prazoId)
  await updateDoc(ref, { prazos })
}
