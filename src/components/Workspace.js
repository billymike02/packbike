import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { firestore as db } from "./firebase";
import bike from "../assets/images/bike.svg";
import { useOutletContext } from "react-router-dom";
import styles from "./Workspace.module.css";
import GearDropdown from "./GearDropdown";
import { IoIosAdd, IoIosAddCircle } from "react-icons/io";

// firestore stuffs
import { firestore } from "./firebase";
import { doc, deleteField } from "firebase/firestore";
import { updateDoc, onSnapshot } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import Modal from "./ModalComponent";
import { RxReset } from "react-icons/rx";
import { IoCreateSharp } from "react-icons/io5";
import { FaCircleInfo } from "react-icons/fa6";
import { FaTools } from "react-icons/fa";
import CustomSelect from "./CustomSelect";

import { AiFillFunnelPlot } from "react-icons/ai";
import { TbZoomInFilled, TbZoomOutFilled } from "react-icons/tb";

// modal that shows bike info (gear weight, etc.)
const BikeInfo = ({ bikeName }) => {
  const { user } = useAuth();
  const [containersUsed, setContainersUsed] = useState(null);
  const [gearWeight, setGearWeight] = useState("0");
  const [gearVolume, setGearVolume] = useState("0");

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
        <a>Weight: {gearWeight}lbs.</a>
        <a>Volume: {gearVolume}L</a>
      </div>
    </div>
  );
};

const Workspace = () => {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [bicycles, setBicycles] = useState([]);
  const { selectedBike, setSelectedBike } = useOutletContext();
  const [containerElements, setContainerElements] = useState([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [figureScale, setFigureScale] = useState(1);

  useEffect(() => {
    if (!user) return; // Exit if no user

    setLoading(true);
    console.log("loading");
    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Convert containers map to an array
        setBicycles(Object.keys(data.bicycles) || []);
        console.log("found bicycles: ", Object.keys(data.bicycles));

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

        console.log("Visual containers:", containersArray);
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

  const handleAddBicycle = async (bikeName) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);

      try {
        // Fetch the current document
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const bicycles = userData.bicycles || {};

          // Add the new bicycle item as a key-value pair
          const updatedBicycles = {
            ...bicycles,
            [bikeName]: {},
          };

          // Update the document with the new map
          await updateDoc(userDocRef, {
            bicycles: updatedBicycles,
          });

          console.log("Bicycle added successfully!");
          setSelectedBike(bikeName);
          setShowNewModal(false);
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

  const addVisualContainer = async (type, width, height) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const unique_id = uuidv4();

          const newContainer = {
            id: unique_id,
            container_id: null, // this will be set when you decide which backend container to use with it
            position: { x: 0, y: 0 },
            width: width,
            height: height,
            type: type,
            color: "grey",
          };

          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${unique_id}`]:
              newContainer,
          });

          console.log("Updated visual containers");
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

          console.log("Updated visual containers");
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.log("Error removing visual container: ", error);
      }
    }
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const containerTypes = [
    { name: "pannier", width: "200px", height: "200px" },
    { name: "roll", width: "100px", height: "100px" },
  ];

  const handleSelectionChange = (selected) => {
    setSelectedBike(selected);
  };

  return (
    <>
      <div className={styles.Workspace}>
        <div className={styles.leftPane}>
          <div>
            <h2 style={{ marginBlockStart: "0rem", width: "100%" }}>
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
                placeholder={selectedBike || "Select a bicycle"}
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
            {selectedBike && (
              <button
                style={{ backgroundColor: "black", textTransform: "uppercase" }}
                onClick={handleBicycleDelete}
              >
                Delete Bike
              </button>
            )}
          </div>

          <div>
            <h2 style={{ marginTop: "0.0rem" }}>
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
                    addVisualContainer(
                      container.name,
                      container.width,
                      container.height
                    );
                    setDropdownOpen(false);
                  }}
                >
                  {container.name}
                </button>
              ))}
            </div>
            <h2>
              Info <FaCircleInfo></FaCircleInfo>
            </h2>
            <BikeInfo bikeName={selectedBike}></BikeInfo>
            <h2>
              Tools <FaTools></FaTools>
            </h2>
            <button
              style={{
                backgroundColor: "red",

                textTransform: "uppercase",
                fontWeight: "500",

                color: "white",
              }}
              onClick={handleVisualReset}
            >
              Reset
              <RxReset></RxReset>
            </button>
          </div>
        </div>

        <div className={styles.Display} id="display">
          <div
            className={styles.figure}
            style={{
              filter: loading ? "blur(10px)" : "none",
              transition: "filter 0.1s",
              scale: figureScale + "",
              transition: "all 0.2s",
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

          {showNewModal && <Modal onSubmit={handleAddBicycle}></Modal>}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "2vw",
            right: "2vw",
            backgroundColor: "black",
            borderRadius: "3rem",
            width: "fit-content",
            height: "6%",
            display: "flex",

            alignItems: "center",
            gap: "30px",
            paddingInline: "1rem",
            color: "white",
          }}
        >
          <TbZoomOutFilled
            className={styles.zoomButton}
            size={40}
            style={{ cursor: "pointer" }}
            onClick={() => {
              const newScale = figureScale * 0.9;

              if (newScale > 0.4) {
                setFigureScale(newScale);
              }
            }}
          ></TbZoomOutFilled>
          <a style={{ fontSize: "1.7rem" }}>Zoom</a>
          <TbZoomInFilled
            className={styles.zoomButton}
            size={40}
            style={{ cursor: "pointer" }}
            onClick={() => {
              const newScale = figureScale * 1.1;

              if (newScale < 2.3) {
                setFigureScale(newScale);
              }
            }}
          ></TbZoomInFilled>
        </div>
      </div>
    </>
  );
};

export default Workspace;
