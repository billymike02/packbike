import styles from "./Login.module.css";
import { Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { auth, firestore } from "./firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";

const Logout = () => {
  const [signedOut, setSignedOut] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    signOut(auth)
      .then(() => {
        setSignedOut(true);
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  }, [auth]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {signedOut ? "Signed out successfully." : "Signing out..."}
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Immediately update the user state
      setSuccess("Logged in successfully.");
      setUser(userCredential.user); // <-- Assuming you have access to setUser here

      // Introduce a slight delay before navigating
      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        name: "Bill",
        // Add any other fields you need
      });

      console.log("User registered and data saved!");
      setSuccess("User registered.");
      navigate("/");
    } catch (error) {
      setError(error.message);
      console.error("Error registering user:", error.message);
    }
  };

  return (
    <div className={styles.Base}>
      <div className={styles.Center}>
        <h1>Login to PackBike</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className={styles.login} onClick={handleLogin}>
          Sign In
        </button>
        <button
          className={styles.register}
          style={{
            border: "0.1rem solid black",
            color: "black",
            backgroundColor: "white",
          }}
          onClick={handleSignUp}
        >
          Create User
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </div>
    </div>
  );
};

export { Login, Logout };
