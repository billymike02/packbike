import React, { createContext, useContext, useEffect, useState } from "react";

import BikeSVG from "./assets/images/bike.svg";
import "./App.css";
import { Creator, Login, Logout } from "./components/Login";
import { HashRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import MenuBar from "./components/MenuBar";
import Workspace from "./components/Workspace";
import Profile from "./components/Profile";
import { onSnapshot } from "firebase/firestore";
import GearManager from "./components/GearManager";
import { firestore } from "./components/firebase";

import ProtectedRoutes from "./components/ProtectedRoutes";
import { BrowserView, MobileView } from "react-device-detect";
import PWAPrompt from "react-ios-pwa-prompt";
import HomePage from "./components/HomePage";

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
  const [units, setUnits] = useState(null);

  useEffect(() => {
    const fetchUnits = async () => {
      const currentUser = await getCurrentUser(); // Ensure we get the current user
      if (!currentUser) return; // Exit if no user

      const docRef = doc(firestore, "users", currentUser.uid);

      // Set up real-time listener
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const prefs = data.prefs || {}; // Ensure prefs exists
          setUnits(prefs.units); // Default to "Lbs" if not found
        } else {
          console.log("No such document!");
        }
      });

      // Clean up subscription on component unmount
      return () => unsubscribe();
    };

    fetchUnits(); // Call the async function inside the effect
  }, []); // Only run on initial mount

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <MenuBar />
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          overflow: "scroll",
        }}
      >
        <Outlet context={[units, setUnits]} />
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUser({
            uid: user.uid,
            displayName: userDoc.data().name,
          });
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return <></>; // Or any loading spinner or placeholder
  }

  return (
    <>
      <AuthContext.Provider value={{ user, setUser }}>
        <HashRouter>
          <Routes>
            <Route path="/app" element={<ProtectedRoutes />}>
              <Route index element={<Navigate to="/app/layout" />} />
              <Route path="/app/layout" element={<Layout />}>
                <Route
                  index
                  element={<Navigate to="/app/layout/workspace" />}
                />
                <Route path="/app/layout/workspace" element={<Workspace />} />
                <Route
                  path="/app/layout/gear-manager"
                  element={<GearManager />}
                />
                <Route path="/app/layout/profile" element={<Profile />} />
              </Route>
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="create-user" element={<Creator />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </HashRouter>
      </AuthContext.Provider>
    </>
  );
}

export default App;
