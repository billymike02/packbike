import React from "react";
import { useNavigate } from "react-router-dom";
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

import PageNavButton from "./PageNavButton";
import ModalImage from "./ViewableImage";

// Image assets
import WorkspaceImg from "../assets/images/workspace.PNG";
import GarageImg from "../assets/images/garage.PNG";
import GearContainerImg from "../assets/images/gear-container_edit.PNG";
import GearManagerImg from "../assets/images/gear-manager.PNG";
import ViewableImage from "./ViewableImage";

const InfoBox = ({ src, title, description, width }) => {
  return (
    <div
      style={{
        display: "flex",
        // flexDirection: "column",
        justifyContent: "flex-start",

        width,
        height: "min-content",
        padding: "2rem",
        gap: "30px",
        backgroundColor: "rgb(0, 0, 0, 0.2)",
        borderRadius: "1rem",
      }}
    >
      <ViewableImage src={src} maxWidth={"20"}></ViewableImage>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <a style={{ fontSize: "40px", fontWeight: "600" }}>{title}</a>
        <p style={{ fontSize: "1.3rem", textWrap: "wrap" }}>{description}</p>
      </div>
    </div>
  );
};

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
    maxWidth: "min-content",
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
      fontSize: "16vw",
    },
    config: {
      duration: 500,
      easing: easings.easeInOutQuad,
    },
  });

  useChain([backgroundAnimRef, titleAnimRef, buttonAnimRef], [0, 0.3, 0.9]);

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
          id="homepage-subcontent"
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
              fontSize: "1.8rem",
              opacity: "0.7",
              margin: "1rem",
              transform: "translate(0px, -3vh)",
              textAlign: "center",
            }}
          >
            The bikepacking/touring gear manager.
          </h3>
          <div
            style={{
              display: "flex",
              gap: "4vmin",
              flexWrap: "wrap", // Allows wrapping when needed
              width: "100%",
              justifyContent: "center", // Space items if possible
            }}
          >
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
              Open PackBike here
            </button>
          </div>
          <PageNavButton
            onClick={() => scrollToSection(infoPageRef)}
            note="More Info"
            inset="auto auto 2vh auto"
            visible="false"
          />
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
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            height: "100vh",
            width: "100vw",
            justifyContent: "center",
            position: "absolute",
            top: "20%",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          <InfoBox
            src={WorkspaceImg}
            title={"Visual workspace"}
            description={
              "Handle bag placement and weight distribution in an intuitive and simple window. Add color to your bags to personalize your loadout."
            }
            width={"90%"}
            // height={"30%"}
          />

          {/* <InfoBox
            src={GarageImg}
            title={"Manage multiple bikes"}
            description={
              "Do you adhere to the N+1 rule? With PackBike you can manage multiple different bikes with the click of a button. You can easily swap your gear between different bikes."
            }
            width={"20%"}
            height={"30%"}
          />

          <InfoBox
            src={GearManagerImg}
            width={"20%"}
            height={"30%"}
            title={"Gear manager"}
            description={""}
          /> */}
        </div>

        <PageNavButton
          onClick={() => scrollToSection(defaultPageRef)}
          note="Back"
          direction="up"
          flexDirection="column-reverse"
          inset="2vh auto auto auto"
        />
      </div>

      <ModularModal bShow={bShowInstallModal} title={"How to install"}>
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
