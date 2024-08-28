import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { firestore as db } from "./firebase";
import bike from "../assets/images/bike.svg";
import { useOutletContext } from "react-router-dom";
import Modal from "./ModalComponent";
import styles from "./Workspace.module.css";
import GearDropdown from "./GearDropdown";

// firestore stuffs
import { firestore } from "./firebase";
import { arrayUnion, doc, arrayRemove } from "firebase/firestore";
import { updateDoc, onSnapshot } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // Import uuid

const Workspace = () => {
  const { selectedBike } = useOutletContext();

  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [containerElements, setContainerElements] = useState([]);

  useEffect(() => {
    if (!user) return; // Exit if no user

    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Convert containers map to an array
        const containersArray = Object.entries(
          data.bicycles.null.visualContainers || {}
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

    // Clean up subscription on component unmount
    return () => unsubscribe();
  }, [user]); // Depend on `user`, so it re-subscribes if `user` changes

  const addVisualContainer = async (type) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const unique_id = uuidv4();

          const newContainer = {
            id: unique_id,
            container_id: "", // this will be set when you decide which backend container to use with it
            position: { x: 0, y: 0 },
            type: type,
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

  const handleAddBicycle = async (bikeName) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);

      try {
        // Fetch the current document
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const existingBicycles = userData.bicycles || []; // Default to empty array if bicycles field doesn't exist

          // Add the new bicycle item
          const updatedBicycles = [...existingBicycles, bikeName];

          // Update the document with the new array
          await updateDoc(userDocRef, {
            bicycles: updatedBicycles,
          });

          console.log("Bicycle added successfully!");
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

  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <div className={styles.Workspace}>
        <div className={styles.Manager}>
          <nav>
            <ul>
              <li
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                }}
              >
                <a>Add</a>
                {dropdownOpen && (
                  <div className={styles.dropdown}>
                    <button
                      onClick={() => {
                        addVisualContainer("pannier");
                      }}
                    >
                      Pannier
                    </button>
                    <button
                      onClick={() => {
                        addVisualContainer("roll");
                      }}
                    >
                      Roll
                    </button>
                  </div>
                )}
              </li>
              <li>
                <a>View Info</a>
              </li>
              <li>
                <a>Reset</a>
              </li>
            </ul>
          </nav>
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
            />
          ))}

          {/* {containerElements.map((element) =>
            createPortal(element, doc
            ument.getElementById("display"))
          )} */}
        </div>
      </div>

      {/* {isModalOpen && (
        <Modal
          onClose={closeModal}
          onSubmit={(bikeName) => {
            handleAddBicycle(bikeName);
            closeModal();
          }}
        />
      )} */}
    </>
  );
};

export default Workspace;
