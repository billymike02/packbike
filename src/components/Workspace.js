import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { firestore as db } from "./firebase";
import bike from "../assets/images/bike.svg";
import { useLocation, useOutletContext } from "react-router-dom";
import { createPortal } from "react-dom";
import styles from "./Workspace.module.css";
import GearDropdown from "./GearDropdown";
import modalStyles from "./ModalComponent.module.css";

// firestore stuffs
import { firestore } from "./firebase";
import {
  arrayUnion,
  doc,
  arrayRemove,
  FieldValue,
  deleteField,
} from "firebase/firestore";
import { updateDoc, onSnapshot } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import Modal from "./ModalComponent";

// modal that shows bike info (gear weight, etc.)
const BikeInfo = ({ bikeName }) => {
  const { user } = useAuth();
  const [containersUsed, setContainersUsed] = useState(null);
  const [gearWeight, setGearWeight] = useState(null);
  const [gearVolume, setGearVolume] = useState(null);

  useEffect(() => {
    if (!user) return; // Exit if no user

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
      <div>
        <h3>Gear containers used: {containersUsed}</h3>
        <h3>Known gear weight: {gearWeight}</h3>
        <h3>Known gear volume: {gearVolume}</h3>
      </div>
    </div>
  );
};

const Workspace = () => {
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const { selectedBike, setSelectedBike } = useOutletContext();

  const [containerElements, setContainerElements] = useState([]);

  const [showNewModal, setShowNewModal] = useState(false);

  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (!user) return; // Exit if no user

    if (selectedBike == null) {
      setSelectedBike("New Bike");
    }

    setLoading(true);
    console.log("loading");
    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && selectedBike != null) {
        const data = docSnap.data();

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
      setLoading(false);
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
    { name: "framebag", width: "500px", height: "500px" },
  ];

  if (loading) {
    return (
      <div className="loading-screen">
        <h3>Preparing your workspace...</h3>
      </div>
    );
  }

  return (
    <>
      <div className={styles.Workspace}>
        <div className={styles.leftPane}>
          <h2>Add a container</h2>
          <div className={styles.containerList}>
            {containerTypes.map((container, index) => (
              <button
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
          <h2>Info</h2>
          <BikeInfo bikeName={selectedBike}></BikeInfo>
          <h2>Tools</h2>
          <button onClick={handleVisualReset}>Reset</button>
        </div>

        <div className={styles.Display} id="display">
          <div className={styles.figure}>
            <img
              src={bike}
              className={styles.BicycleVector}
              alt="bicycle-image"
            />
          </div>

          {containerElements.map((container) => (
            <GearDropdown
              key={container.id}
              id={container.id}
              containerID={container.id}
              type={container.type}
              onDelete={handleVisualContainerDelete}
              selectedBike={selectedBike}
            />
          ))}

          {showNewModal && <Modal onSubmit={handleAddBicycle}></Modal>}
        </div>
      </div>
    </>
  );
};

export default Workspace;
