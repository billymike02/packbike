import React, { useState } from "react";
import Home from "./components/Home";
import "./App.css";
import Login from "./components/Login";
import { HashRouter, Routes, Route } from "react-router-dom";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
const analytics = getAnalytics(app);

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
