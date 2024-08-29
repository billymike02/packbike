import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { firestore as db } from "./firebase";
import bike from "../assets/images/bike.svg";
import { useLocation, useOutletContext } from "react-router-dom";

import styles from "./Workspace.module.css";
import GearDropdown from "./GearDropdown";

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

const Workspace = () => {
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const { selectedBike, setSelectedBike } = useOutletContext();

  const [containerElements, setContainerElements] = useState([]);

  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    if (!user) return; // Exit if no user

    if (selectedBike == "Add +") {
      setShowNewModal(true);
      return;
    }

    setLoading(true);
    console.log("loading");
    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && selectedBike != null) {
        const data = docSnap.data();

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

  const addVisualContainer = async (type) => {
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

  if (selectedBike == null) {
    return (
      <div className="loading-screen">
        <h3>Please select a bicycle from the sidebar.</h3>
      </div>
    );
  }

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
        <div className={styles.Manager}>
          <nav>
            <div className={styles.MenuBar}>
              <ul>
                <li
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                  }}
                >
                  <a>Add</a>
                </li>
                <li>
                  <a>View Info</a>
                </li>
                <li>
                  <a>Reset</a>
                </li>
              </ul>
            </div>
            {dropdownOpen && (
              <div className={styles.dropdown}>
                <button
                  onClick={() => {
                    addVisualContainer("pannier");
                    setDropdownOpen(false);
                  }}
                >
                  Pannier
                </button>
                <button
                  onClick={() => {
                    addVisualContainer("roll");
                    setDropdownOpen(false);
                  }}
                >
                  Roll
                </button>
              </div>
            )}
          </nav>

          <a className={styles.bikeName}>Selected Bike: {selectedBike}</a>
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
