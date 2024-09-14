import React from "react";
import { useNavigate } from "react-router-dom";
import BikeSVG from "../assets/images/bike.svg";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        overflow: "hidden",
        backgroundColor: "#202020",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        color: "white",
        flexDirection: "row",
        position: "relative",
      }}
    >
      <img
        src={BikeSVG}
        style={{
          height: "150vh",
          width: "auto",
          filter: "invert(1)",
          opacity: "5%",
          zIndex: "1",
          transform: "scale(-100%, 100%)",
        }}
      />

      <div
        style={{
          width: "200px",
          display: "flex",
          flexDirection: "column",
          zIndex: "1",
          position: "absolute",
          right: "50%",
          left: "50%",
          transform: "translate(-50%)",
        }}
      >
        <h1 style={{ padding: "0px", margin: "0.1rem" }}>packbike</h1>
        <h3 style={{ opacity: "50%", margin: "0.1rem" }}>load-up. let's go</h3>
        <p></p>

        <button
          style={{ backgroundColor: "rgb(120, 21, 222)" }}
          onClick={() => {}}
        >
          Install me
        </button>
        <button
          style={{ backgroundColor: "rgb(87, 182, 96)" }}
          onClick={() => navigate("/app")}
        >
          Launch in Browser
        </button>
      </div>
    </div>
  );
};

export default HomePage;
