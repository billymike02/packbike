import React, { createContext, useContext, useEffect, useState } from "react";
import Home from "./components/Home";
import "./App.css";
import { Login, Logout } from "./components/Login";
import {
  HashRouter,
  Routes,
  Route,
  Link,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Sidebar from "./components/Sidebar";
import Workspace from "./components/Workspace";
import Profile from "./components/Profile";
import GearManager from "./components/GearManager";
import Modal from "./components/ModalComponent";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { BrowserView, MobileView } from "react-device-detect";

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
  const [selectedBike, setSelectedBike] = useState(null);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Sidebar
        setBicycleSelection={(newBike) => {
          console.log("new bike", newBike);
          setSelectedBike(newBike);
        }}
      />

      {/* Right Side - Content that changes with routes */}
      <div style={{ width: "100vw", height: "100%", display: "flex" }}>
        <Outlet context={{ selectedBike, setSelectedBike }} />
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // <-- Added authLoading state

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
        setUser(null); // Ensure user is set to null if not authenticated
      }
      setAuthLoading(false); // <-- Auth status is now determined
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <></>
      // <div style={{ height: "100vh" }} className="loading-screen">
      //   <h3>Preparing PackBike...</h3>
      // </div>
    ); // Or any loading spinner or placeholder
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <HashRouter>
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/profile" />} />{" "}
              {/* Redirect default path to /profile */}
              <Route path="/workspace" element={<Workspace />} />
              <Route path="/gear-manager" element={<GearManager />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}

export default App;
