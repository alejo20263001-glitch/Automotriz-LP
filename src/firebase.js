import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDE3C03Y7ohjghpIKcTwBATen8vz36Gsig",
  authDomain: "servicio-automotriz-lp.firebaseapp.com",
  projectId: "servicio-automotriz-lp",
  storageBucket: "servicio-automotriz-lp.firebasestorage.app",
  messagingSenderId: "823327497118",
  appId: "1:823327497118:web:d324ff396c3ea8ebcbd48f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const DOC_REF = doc(db, "taller", "datos");

// Escucha los datos del taller en tiempo real (todos los empleados ven los mismos datos al instante)
export function subscribeToTallerData(callback) {
  return onSnapshot(DOC_REF, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

// Guarda los datos del taller
export function saveTallerData(data) {
  return setDoc(DOC_REF, data);
}
