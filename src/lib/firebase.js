import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyALu319U1mzMmyelzKqbI-7S02nFOE15OM",
  authDomain: "mallmann-monitor.firebaseapp.com",
  projectId: "mallmann-monitor",
  storageBucket: "mallmann-monitor.firebasestorage.app",
  messagingSenderId: "438431768975",
  appId: "1:438431768975:web:df81fcdeb5e3ae240e6bfa"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
