import React from "react";
import { useNavigate } from "react-router-dom";
import BikeSVG from "../assets/images/bike.svg";
import { TbDownload } from "react-icons/tb";
import { useRef } from "react";
import {
  useSpring,
  useSpringRef,
  animated,
  useChain,
  easings,
} from "@react-spring/web";
import { useState, useEffect } from "react";
import ModularModal from "./Modal";
import { IoCodeSlash, IoShareOutline } from "react-icons/io5";
import { MdInstallDesktop, MdMoreVert } from "react-icons/md";
import {
  IoIosArrowDown,
  IoIosArrowRoundDown,
  IoIosArrowRoundUp,
} from "react-icons/io";

const HomePage = () => {
  const navigate = useNavigate();

  // Static styles
  const downloadButtonStyling = {
    borderRadius: "100px",
    padding: "30px",
    fontSize: "1.3rem",
    fontWeight: "500",
    gap: "12px",
    justifyContent: "center",
    alignItems: "center",
  };

  // Animated styles
  const backgroundAnimRef = useSpringRef();
  const backgroundStyles = useSpring({
    ref: backgroundAnimRef,
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
    config: { duration: 500 },
  });

  const buttonAnimRef = useSpringRef();
  const buttonStyles = useSpring({
    ref: buttonAnimRef,
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
    config: { duration: 1000 },
  });

  const titleAnimRef = useSpringRef();
  const titleStyles = useSpring({
    ref: titleAnimRef,
    from: {
      opacity: 0,
      fontSize: "300vw",
    },
    to: {
      opacity: 1,
      fontSize: "15vw",
    },
    config: {
      duration: 500,
      easing: easings.easeInOutQuad,
    },
  });

  useChain([backgroundAnimRef, titleAnimRef, buttonAnimRef], [0, 0.3, 0.9]);

  // Page animations for scrolling
  const defaultPageRef = useRef(null);
  const infoPageRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden"; // Disable scrolling

    return () => {
      document.body.style.overflow = "auto"; // Enable scrolling when component unmounts
    };
  }, []);

  const scrollToSection = (pageRef) => {
    pageRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // States
  const [bShowInstallModal, setShowInstallModal] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "200vh", // Ensure there's enough space to scroll
        background:
          "linear-gradient(144deg, rgba(2,0,36,1) 0%, rgba(62,62,193,1) 35%, rgba(0,212,255,1) 100%)",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        overflow: "hidden", // Disable scrolling on the body
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <animated.div
        ref={defaultPageRef}
        style={{
          ...backgroundStyles,
          height: "100vh",
          width: "100vw",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          color: "white",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div
          id="title"
          style={{
            ...buttonStyles,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <animated.h1 style={{ ...titleStyles, margin: "0px" }}>
            PackBike
          </animated.h1>
        </div>
        <animated.div
          id="download-buttons"
          style={{
            ...buttonStyles,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <button
            onClick={() => {
              window.open("https://github.com/billymike02/packbike", "_blank");
            }}
            style={{
              position: "fixed",
              width: "max-content",
              top: "2vh",
              right: "2vh",
              borderRadius: "100px",
              padding: "1.6rem",
              fontSize: "20px",
              backgroundColor: "transparent",
              border: "2px solid white",
              textTransform: "uppercase",
              zIndex: "5",
              gap: "8px",
              fontWeight: "500",
            }}
          >
            <IoCodeSlash size={28} />
            Source Code
          </button>
          <h3
            style={{
              fontSize: "30px",
              opacity: "0.7",
              margin: "0.5rem",
              transform: "translate(0px, -3vh)",
            }}
          >
            The bikepacking/touring gear manager.
          </h3>
          <div style={{ display: "flex", gap: "24px" }}>
            <button
              onClick={() => setShowInstallModal(true)}
              style={{
                ...downloadButtonStyling,
                color: "black",
                backgroundColor: "white",
                textWrap: "nowrap",
              }}
            >
              <TbDownload size={30} />
              Install on device
            </button>

            <button
              onClick={() => navigate("/app")}
              style={{
                ...downloadButtonStyling,
                width: "max-content",
                textWrap: "nowrap",
              }}
            >
              Open PackBike in your browser
            </button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "transparent",
              textTransform: "uppercase",
              position: "absolute",
              bottom: "2vh",
              width: "max-content",
              height: "min-content",
              opacity: "0.7",
              flexDirection: "column",
              fontSize: "2rem",
              cursor: "pointer",
            }}
            onClick={() => scrollToSection(infoPageRef)}
          >
            More Info
            <IoIosArrowRoundDown size={50}></IoIosArrowRoundDown>
          </div>
        </animated.div>
      </animated.div>
      <div
        ref={infoPageRef}
        style={{
          height: "100vh",
          color: "white",
          display: "flex",
          width: "100vw",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "transparent",
            textTransform: "uppercase",
            position: "absolute",
            top: "2vh",
            width: "max-content",
            height: "min-content",
            opacity: "0.7",
            flexDirection: "column",
            fontSize: "2rem",
            cursor: "pointer",
          }}
          onClick={() => scrollToSection(defaultPageRef)}
        >
          <IoIosArrowRoundUp size={50}></IoIosArrowRoundUp>
          Go Back
        </div>
      </div>

      <ModularModal bShow={bShowInstallModal} title={"Install to Device"}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            flexDirection: "column",
            width: "90%",
          }}
        >
          <h4 style={{ marginBlock: "0.7rem" }}>
            Desktop (Chromium browsers):
          </h4>
          <ol style={{ margin: "0px" }}>
            <li>
              Press the <MdInstallDesktop /> button in the search bar
            </li>
            <li>Press 'Install app' when prompted</li>
          </ol>
          <h4 style={{ marginBlock: "0.7rem" }}>Android devices:</h4>
          <ol style={{ margin: "0px" }}>
            <li>
              Press the <MdMoreVert /> button in the browser menu
            </li>
            <li>Press 'Add to homescreen'</li>
          </ol>
          <h4 style={{ marginBlock: "0.7rem" }}>Apple devices:</h4>
          <ol style={{ margin: "0px", marginBottom: "1rem" }}>
            <li>
              Press the <IoShareOutline /> button in Safari
            </li>
            <li>Press 'Add to Home Screen' or 'Add to Dock'</li>
          </ol>
        </div>
        <button onClick={() => setShowInstallModal(false)}>Close</button>
      </ModularModal>
    </div>
  );
};

export default HomePage;
