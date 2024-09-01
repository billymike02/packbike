import React, { createContext, useContext, useEffect, useState } from "react";
import "./App.css";
import { Login, Logout } from "./components/Login";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./components/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Sidebar from "./components/Sidebar";
import Workspace from "./components/Workspace";
import Profile from "./components/Profile";
import GearManager from "./components/GearManager";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
const db = getFirestore();

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

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  return user ? children : <Navigate to="/login" />;
};

function Layout() {
  const [selectedBike, setSelectedBike] = useState(null);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <Sidebar
        setBicycleSelection={(newBike) => {
          console.log("new bike", newBike);
          setSelectedBike(newBike);
        }}
      />

      {/* Right Side - Content that changes with routes */}
      <div style={{ width: "100%", height: "100vh", display: "flex" }}>
        <Outlet context={{ selectedBike, setSelectedBike }} />
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUser({
            uid: user.uid,
            displayName: userDoc.data().name,
          });
        }
      } else {
        setUser(null); // Ensure user is null when logged out
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      <HashRouter>
        <Routes>
          {/* Protect the entire layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/gear-manager" element={<GearManager />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* No need to protect login and logout */}
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}

export default App;
