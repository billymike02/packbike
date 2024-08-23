import React, { createContext, useContext, useEffect, useState } from "react";
import Home from "./components/Home";
import "./App.css";
import Login from "./components/Login";
import { HashRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Sidebar from "./components/Sidebar";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
let currentUser = null;
const db = getFirestore();
export { currentUser };

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(
      auth,
      (user) => {
        resolve(user);
      },
      reject
    );
  });
};

function Layout() {
  return (
    <div style={{ display: "flex" }}>
      {/* Left Side - Static Links */}
      <Sidebar />

      {/* Right Side - Content that changes with routes */}
      <div style={{ width: "100%" }}>
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        const uid = user.uid;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUser({
            uid: user.uid,
            displayName: userDoc.data().name,
          });
        }

        console.log("uid", uid);
      } else {
        console.log("user is logged out");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}

export default App;
