import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { firestore as db } from "./firebase";
import bike from "../assets/images/bike.svg";
import { useOutletContext } from "react-router-dom";
import styles from "./Workspace.module.css";
import GearDropdown from "./GearDropdown";
import { IoIosAddCircle, IoMdSettings } from "react-icons/io";

// firestore stuffs
import { firestore } from "./firebase";
import { doc, deleteField } from "firebase/firestore";
import { updateDoc, onSnapshot } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import { getAuth, signOut } from "firebase/auth";

import { RxReset } from "react-icons/rx";
import { IoCreateSharp } from "react-icons/io5";

import { FaTools } from "react-icons/fa";
import CustomSelect from "./CustomSelect";

import { AiFillFunnelPlot } from "react-icons/ai";
import { TbZoomInFilled, TbZoomOutFilled } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import ModularModal from "./Modal";
import ButtonSwitch from "./ButtonSwitch";
import { animated } from "@react-spring/web";

// modal that shows bike info (gear weight, etc.)
const BikeMetrics = ({ bikeName }) => {
  const { user } = useAuth();
  const [containersUsed, setContainersUsed] = useState(null);
  const [gearWeight, setGearWeight] = useState("0");
  const [gearVolume, setGearVolume] = useState("0");
  const [units, setUnits] = useOutletContext();

  useEffect(() => {
    if (!user) return; // Exit if no user

    if (bikeName == null) {
      return;
    }

    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Convert containers map to an array
        const visualContainers = Object.entries(
          data.bicycles[bikeName].visualContainers || {}
        ).map(([id, container]) => ({
          id, // Add the key as an ID field
          ...container, // Spread the container data
        }));

        // Extract the container_id field into a new array called backend_containers
        const backendContainers = [
          ...new Set(
            visualContainers.map((container) => container.container_id)
          ),
        ];

        calculateMetrics(backendContainers);
      } else {
        console.log("No such document!");
        // Clear state if document does not exist
      }
    });

    // Clean up subscription on component unmount
    return () => unsubscribe();
  }, [user]); // Depend on `user`, so it re-subscribes if `user` changes

  const calculateMetrics = async (containers) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);

      try {
        // Fetch the current document
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const fsContainers = containers.map(
            (containerKey) => userData.containers[containerKey]
          );

          setContainersUsed(fsContainers.length);

          // Calculate the total weight
          const totalWeight = fsContainers.reduce((acc, container) => {
            if (container && container.items) {
              const containerWeight = container.items.reduce((sum, item) => {
                const weight = parseFloat(item.weight) || 0; // Convert weight to a number, default to 0 if NaN
                return sum + weight;
              }, 0);
              return acc + containerWeight;
            }
            return acc;
          }, 0);

          // Set the gear weight using setGearWeight
          setGearWeight(totalWeight);

          // Calculate the total weight
          const totalVolume = fsContainers.reduce((acc, container) => {
            if (container && container.items) {
              const containerVolume = container.items.reduce((sum, item) => {
                const volume = parseFloat(item.volume) || 0; // Convert weight to a number, default to 0 if NaN
                return sum + volume;
              }, 0);
              return acc + containerVolume;
            }
            return acc;
          }, 0);

          setGearVolume(totalVolume);
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.error("Error getting bicycle weight: ", error);
      }
    } else {
      console.log("User not authenticated");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <a>
          Weight: {gearWeight}
          {units}
        </a>
        <a>Volume: {gearVolume}L</a>
      </div>
    </div>
  );
};

const Workspace = () => {
  const [loading, setLoading] = useState(true);
  const auth = getAuth(); // Initialize the Firebase auth instance
  const { user } = useAuth();
  const [bicycles, setBicycles] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [containerElements, setContainerElements] = useState([]);

  const [figureScale, setFigureScale] = useState(1);
  const [trackingClick, setTrackingClick] = useState(false);
  const [indexNewContainer, setIndexNewContainer] = useState(null);

  const [units, setUnits] = useOutletContext();

  // Modal states
  const [bShowingResetModal, setShowResetModal] = useState(false);
  const [bShowingRemoveBikeModal, setShowRemoveBikeModal] = useState(false);
  const [bShowNewModal, setShowNewModal] = useState(false);
  const [bShowConfigMenu, setShowConfigMenu] = useState(false);

  useEffect(() => {
    if (!user) return; // Exit if no user

    setLoading(true);

    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Transform the bicycles map into an array of objects with id and displayName
        const bicyclesArray = Object.entries(data.bicycles || {}).map(
          ([id, bike]) => ({
            value: id, // The bicycle's unique id (from Firebase key)
            label: bike.name || id, // The name of the bicycle or use the id as a fallback
          })
        );

        setBicycles(bicyclesArray); // Set bicycles as an array of objects with id and displayName

        if (data.bicycles[selectedBike] == null) {
          return;
        }

        // Convert containers map to an array
        const containersArray = Object.entries(
          data.bicycles[selectedBike].visualContainers || {}
        ).map(([id, container]) => ({
          id, // Add the key as an ID field
          ...container, // Spread the container data
        }));

        setContainerElements(containersArray); // Set the array in state
      } else {
        console.log("No such document!");
        setContainerElements([]); // Clear state if document does not exist
      }
    });

    setTimeout(() => {
      if (selectedBike != null) {
        setLoading(false);
      }
    }, 750);

    // Clean up subscription on component unmount
    return () => unsubscribe();
  }, [user, selectedBike]); // Depend on `user`, so it re-subscribes if `user` changes

  const onUnitsChanged = async (value) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      // Store additional user data in Firestore
      await updateDoc(userDocRef, {
        [`prefs.units`]: value,
      });
    }
  };

  const handleAddBicycle = async (bikeName) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);

      try {
        // Fetch the current document
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const bicycles = userData.bicycles || {};

          const newBike = {};

          // Add the new bicycle item as a key-value pair
          const updatedBicycles = {
            ...bicycles,
            [bikeName]: newBike,
          };

          // Update the document with the new map
          await updateDoc(userDocRef, {
            bicycles: updatedBicycles,
          });

          console.log("Bicycle added successfully!");
          setSelectedBike(bikeName);
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.error("Error adding bicycle: ", error);
      }
    } else {
      console.log("User not authenticated");
    }
  };

  const addVisualContainer = async (
    type,
    width,
    height,
    posX = 0,
    posY = 0
  ) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const unique_id = uuidv4();

          const newContainer = {
            id: unique_id,
            container_id: null, // this will be set when you decide which backend container to use with it
            position: { x: posX, y: posY },
            width: width,
            height: height,
            type: type,
            color: "rgb(134	142	149)",
          };

          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${unique_id}`]:
              newContainer,
          });
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.log("Error adding visual container: ", error);
      }
    }
  };

  const handleVisualReset = async () => {
    containerElements.forEach((element) =>
      handleVisualContainerDelete(element.id)
    );
  };

  const handleBicycleDelete = async () => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}`]: deleteField(),
          });

          setSelectedBike(null);
        }
      } catch (error) {
        console.log("Error removing bicycle: ", error);
      }
    }
  };

  const handleVisualContainerDelete = async (id) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          console.log(`bicycles.${selectedBike}.visualContainers.${id}`);

          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${id}`]: deleteField(),
          });
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.log("Error removing visual container: ", error);
      }
    }
  };

  const containerTypes = [
    { name: "pannier", width: 200, height: 200 },
    { name: "roll", width: 100, height: 100 },
    { name: "forkbag", width: 140, height: 160 },
    { name: "seatpack", width: 220, height: 100 },
    { name: "framebag", width: 220, height: 175 },
  ];

  const handleSelectionChange = (selected) => {
    setSelectedBike(selected);
  };

  const handleVisualClick = (event) => {
    setTrackingClick(false);
    let clientX, clientY;

    // Replace 'specificDivId' with the id or class of the div you want to use
    const specificDiv =
      document.getElementById("Figure") ||
      document.querySelector(".workspace-figure");

    if (!specificDiv) {
      console.error("Specific div not found");
      return;
    }

    // Get the bounds of the specific div
    const bounds = specificDiv.getBoundingClientRect();

    if (event.type === "touchstart") {
      const touch = event.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    const container = containerTypes[indexNewContainer];

    // Calculate x and y coordinates relative to the specific div
    const x = (clientX - bounds.left) / figureScale - container.width * 0.5;
    const y = (clientY - bounds.top) / figureScale - container.height * 0.5;

    addVisualContainer(container.name, container.width, container.height, x, y);
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        // Optional: redirect to a login page or show a signed-out message
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  return (
    <animated.div className={styles.Workspace}>
      <ModularModal
        title={"PackBike Settings"}
        bShow={bShowConfigMenu}
        onClose={() => {
          setShowConfigMenu(false);
        }}
      >
        <div
          style={{
            width: "100%",
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ButtonSwitch
            leftOption="Lbs"
            rightOption="Kg"
            defaultSelection={units}
            onChange={onUnitsChanged}
          />
        </div>
        <div>
          <h3>User: {auth.currentUser.email || "unset-username"}</h3>
          <button onClick={handleSignOut} style={{ backgroundColor: "red" }}>
            Sign Out
          </button>
          <button onClick={() => setShowConfigMenu(false)}>Close</button>
        </div>
      </ModularModal>
      <div
        id="Left-Pane"
        style={{
          zIndex: 10,
          height: "100%",
          minWidth: "200px",
          width: "350px",
          backgroundColor: "#eee",
          overflow: "auto",
          boxShadow: "0px 0px 30px #aaa",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* <div className={styles.paneContainer}>
          <a
            style={{
              textTransform: "uppercase",
              fontSize: "3rem",
              fontWeight: "700",
              textDecoration: "underline",
              textUnderlineOffset: "10px",
              userSelect: "none",
              WebkitUserSelect: "none",
              cursor: "default",
            }}
          >
            PackBike
          </a>
        </div> */}
        <div className={styles.paneContainer}>
          <h2 style={{ marginBlock: "0px", width: "100%" }}>
            Bicycle <AiFillFunnelPlot></AiFillFunnelPlot>
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <CustomSelect
              options={bicycles}
              onSelect={handleSelectionChange}
              placeholderText={"Select a bicycle"}
              defaultSelection={selectedBike}
              emptyMessage="No bicycles."
            />
            <IoIosAddCircle
              size={60}
              style={{
                color: "black",
                cursor: "pointer",
              }}
              onClick={() => setShowNewModal(true)}
              className="button-icon"
            ></IoIosAddCircle>
          </div>
        </div>

        <div
          className={styles.paneContainer}
          style={{
            paddingTop: "0rem",
            pointerEvents: selectedBike ? "auto" : "none",
            transition: "all 0.2s",
            opacity: loading ? "0.5" : "1",
          }}
        >
          <h2 style={{ marginBlock: "10px" }}>
            Create <IoCreateSharp></IoCreateSharp>
          </h2>
          <div className={styles.containerList}>
            {containerTypes.map((container, index) => (
              <button
                style={{
                  textTransform: "capitalize",
                }}
                key={index}
                onClick={() => {
                  setIndexNewContainer(index);
                  setTrackingClick(true);
                }}
              >
                {container.name}
              </button>
            ))}
          </div>

          <h2>
            Tools <FaTools></FaTools>
          </h2>
          <button
            style={{
              backgroundColor: "#007FFF",
              textTransform: "uppercase",
              fontWeight: "500",
              color: "white",
            }}
            onClick={() => {
              setShowResetModal(true);
            }}
          >
            Reset
            <RxReset size={20}></RxReset>
          </button>

          <button
            style={{
              backgroundColor: "red",
              textTransform: "uppercase",
              pointerEvents: selectedBike ? "all" : "none",
            }}
            onClick={() => {
              setShowRemoveBikeModal(true);
            }}
          >
            Delete Bike
            <MdDelete size={25} />
          </button>
        </div>

        <div className={styles.paneContainer} style={{ marginTop: "auto" }}>
          <button
            style={{
              color: "black",
              backgroundColor: "#ccc",
              textTransform: "uppercase",
            }}
            onClick={() => setShowConfigMenu(true)}
          >
            Config
            <IoMdSettings size={28} />
          </button>
        </div>
      </div>

      <div
        id="Right-Pane"
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "white",
          backgroundColor: trackingClick ? "rgb(200 200 200)" : "white",
          transition: "background-color 0.5s",
          cursor: trackingClick ? "copy" : "default",
          display: "relative",
          overflow: "auto",
        }}
        onClick={trackingClick ? handleVisualClick : null}
        onTouchStart={trackingClick ? handleVisualClick : null}
      >
        <a
          style={{
            color: "black",
            left: "50vw",
            top: "100px",
            transform: "translate(-50%, -50%)",
            position: "fixed",
            backgroundColor: "white",
            fontSize: "1.5rem",
            boxShadow: "0px 0px 10px rgb(25, 0, 0, 0.7)",
            zIndex: "10",
            fontWeight: "400",
            padding: "0.7rem",
            margin: "1rem",
            borderRadius: "0.6rem",
            transition: "all 0.5s",
            userSelect: "none",
            opacity: trackingClick ? "100%" : "0%",
            pointerEvents: trackingClick ? "all" : "none",
          }}
        >
          Tap to place the container.
        </a>

        <div
          className="workspace-figure"
          id="Figure"
          style={{
            transform: `scale(${figureScale})`,
            transition: "all 0.2s",
            filter: loading ? "blur(10px)" : "",
            position: "relative",
            height: "100%",
            width: "100%",
            transformOrigin: "top left",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <img
            src={bike}
            className={styles.BicycleVector}
            alt="bicycle-image"
          />

          <div style={{ visibility: loading ? "hidden" : "visible" }}>
            {containerElements.map((container) => (
              <GearDropdown
                parentScale={figureScale}
                key={container.id}
                id={container.id}
                containerID={container.id}
                type={container.type}
                onDelete={handleVisualContainerDelete}
                selectedBike={selectedBike}
              />
            ))}
          </div>
        </div>
      </div>

      <ModularModal
        title="Add Bicycle"
        bShow={bShowNewModal}
        onClose={() => {
          setShowNewModal(false);
        }}
      >
        <input
          id="bicycleNameInput"
          placeholder="Name for your bicycle"
        ></input>
        <div style={{ display: "flex", width: "100%", gap: "8px" }}>
          <button
            onClick={() => {
              setShowNewModal(false);
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const bicycleName =
                document.getElementById("bicycleNameInput").value;

              handleAddBicycle(bicycleName);
              setShowNewModal(false);
            }}
            style={{ backgroundColor: "rgb(52	199	89)" }}
          >
            Add Bicycle
          </button>
        </div>
      </ModularModal>

      <ModularModal
        title="Confirm Reset"
        subtitle="This will remove all gear on your bike."
        bShow={bShowingResetModal}
        onClose={() => setShowResetModal(false)}
      >
        <div style={{ display: "flex", width: "100%", gap: "8px" }}>
          {" "}
          <button onClick={() => setShowResetModal(false)}>Cancel</button>
          <button
            style={{ backgroundColor: "red" }}
            onClick={() => {
              setShowResetModal(false);
              handleVisualReset();
            }}
          >
            Continue
          </button>
        </div>
      </ModularModal>

      <ModularModal
        title="Are you sure?"
        subtitle="This will remove your bike from your account."
        bShow={bShowingRemoveBikeModal}
        onClose={() => setShowRemoveBikeModal(false)}
      >
        <div style={{ display: "flex", width: "100%", gap: "8px" }}>
          {" "}
          <button onClick={() => setShowRemoveBikeModal(false)}>Cancel</button>
          <button
            style={{ backgroundColor: "red" }}
            onClick={() => {
              setShowRemoveBikeModal(false);
              handleBicycleDelete();
            }}
          >
            Continue
          </button>
        </div>
      </ModularModal>

      <div
        id="zoom-buttons"
        style={{
          position: "fixed",
          bottom: "2vh",
          right: "2vh",
          backgroundColor: "black",
          borderRadius: "3rem",
          width: "fit-content",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "30px",
          color: "white",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <TbZoomOutFilled
          className={styles.zoomButton}
          size={30}
          style={{ cursor: "pointer" }}
          onClick={() => {
            const newScale = figureScale * 0.9;

            if (newScale > 0.3) {
              setFigureScale(newScale);
            }
          }}
        ></TbZoomOutFilled>
        <a
          style={{
            fontSize: "1.5rem",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          Zoom
        </a>
        <TbZoomInFilled
          className={styles.zoomButton}
          size={30}
          style={{ cursor: "pointer" }}
          onClick={() => {
            const newScale = figureScale * 1.1;

            if (newScale < 3) {
              setFigureScale(newScale);
            }
          }}
        ></TbZoomInFilled>
      </div>
    </animated.div>
  );
};

export default Workspace;
