// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCycp0dSrXwTdE91fhiFB8ugQKvfVgdcQ8",
  authDomain: "packbike-61ddf.firebaseapp.com",
  projectId: "packbike-61ddf",
  storageBucket: "packbike-61ddf.appspot.com",
  messagingSenderId: "787405879007",
  appId: "1:787405879007:web:89c92ed1142f26b0dc9b6a",
  measurementId: "G-D9GK0ZS2NZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export default app;
