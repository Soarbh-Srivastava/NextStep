// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCC9S4er3lXdll5G3bZTZFUFnUFRLFnEp8",
  authDomain: "easy-apply-ef76e.firebaseapp.com",
  projectId: "easy-apply-ef76e",
  storageBucket: "easy-apply-ef76e.appspot.com",
  messagingSenderId: "49124194703",
  appId: "1:49124194703:web:eb98850733ffbeade433fa",
  measurementId: "G-MPZ9WQW17Z"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
