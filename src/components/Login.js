import styles from "./Login.module.css";
import { Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { auth, firestore } from "./firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in successfully!");
      setSuccess("Logged in successfully.");
      navigate("/");
      // Handle successful login (e.g., redirect, update state)
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
        <button className={styles.register} onClick={handleSignUp}>
          Create User
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </div>
    </div>
  );
};

export default Login;
