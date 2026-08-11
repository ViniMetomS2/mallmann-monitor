/**
 * Lê emails do Firestore (escritos pelo Make quando chega email no PROJUDI).
 * Coleção: emails
 * Campos: from, subject, body, receivedAt, processNumber, movimento, lido, tipo
 */

import { db } from './firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  limit,
} from 'firebase/firestore'

export function subscribeEmails(callback) {
  const q = query(collection(db, 'emails'), orderBy('receivedAt', 'desc'), limit(100))
  return onSnapshot(q, (snap) => {
    const emails = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(emails)
  })
}

export async function marcarLido(id) {
  await updateDoc(doc(db, 'emails', id), { lido: true })
}

export async function getEmailsOnce() {
  const q = query(collection(db, 'emails'), orderBy('receivedAt', 'desc'), limit(100))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
