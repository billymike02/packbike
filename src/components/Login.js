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

// images
import { ReactComponent as BikeSVG } from "../assets/images/bike.svg";
import { FaUserCircle } from "react-icons/fa";
import { Si1Password } from "react-icons/si";
import { RiLockPasswordFill } from "react-icons/ri";
import { PiPasswordFill } from "react-icons/pi";

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
        navigate("/app/layout/workspace");
      }, 100);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.Base}>
      <div
        id="pane"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
          borderRadius: "1rem",
          height: "400px",
          width: "450px",

          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            backgroundColor: "black",
            color: "white",
            width: "100%",
            height: "min-content",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            padding: "1rem",
          }}
        >
          <h1
            style={{
              margin: "0rem",
              padding: "0rem",
              fontSize: "clamp(3vw, 5vw, 5vw)",
            }}
          >
            PACKBIKE
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            backgroundColor: "white",
            height: "100%",
          }}
        >
          <div style={{ padding: "1rem" }}>
            {" "}
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
            <button
              className={styles.login}
              style={{ backgroundColor: "rgb(52	199	89)" }}
              onClick={handleLogin}
            >
              Sign In
            </button>
            <br></br>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            <a
              style={{
                fontSize: "1rem",
                color: "blue",
                cursor: "pointer",
              }}
              onClick={() => navigate("/create-user")}
            >
              Click here to create an account.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Creator = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

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
        // Add any other fields you need
        bicycles: {},
      });

      console.log("User registered and data saved!");
      setSuccess("User registered.");
      navigate("/app/layout/workspace");
    } catch (error) {
      setError(error.message);
      console.error("Error registering user:", error.message);
    }
  };

  return (
    <div className={styles.Base}>
      <div
        id="pane"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
          borderRadius: "1rem",
          height: "fit-content",
          width: "fit-content",

          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            backgroundColor: "white",
            height: "100%",
          }}
        >
          <div style={{ padding: "3rem" }}>
            {" "}
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaUserCircle
                size={50}
                style={{ transform: "translate(0, -4px)", opacity: "0.8" }}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <PiPasswordFill
                size={50}
                style={{ transform: "translate(0, -4px)", opacity: "0.8" }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              className={styles.login}
              style={{ backgroundColor: "black" }}
              onClick={handleSignUp}
            >
              Register User
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Login, Logout, Creator };
