import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { firestore as db } from "./firebase";
import bike from "../assets/images/bike.svg";
import { useOutletContext } from "react-router-dom";
import Modal from "./ModalComponent";
import styles from "./Workspace.module.css";
import GearDropdown from "./GearDropdown";
import { createPortal } from "react-dom";
import { FaPencil } from "react-icons/fa6";
import modalStyles from "./ModalComponent.module.css";

// firestore stuffs
import { firestore } from "./firebase";
import { arrayUnion, doc, arrayRemove } from "firebase/firestore";
import { updateDoc, onSnapshot } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // Import uuid

const GearModal = ({ onClose, onSubmit }) => {
  return createPortal(
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <h2>{"Assign a gear container"}</h2>
        <div className={modalStyles.modalBody}>
          <select name="gearContainer" id="selector">
            <option value="volvo">Volvo</option>
            <option value="saab">Saab</option>
            <option value="mercedes">Mercedes</option>
            <option value="audi">Audi</option>
          </select>
        </div>

        <div className={modalStyles.buttons}>
          <button onClick={onClose} className={modalStyles.abort}>
            Cancel
          </button>

          <button onClick={onSubmit} className={modalStyles.submit}>
            Done
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

const Workspace = () => {
  const { selectedBike } = useOutletContext();

  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGearModalOpen, setIsGearModalOpen] = useState(false);

  const [containerElements, setContainerElements] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

  const addVisualContainer = async () => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const unique_id = uuidv4();

          const newContainer = {
            id: unique_id,
            container_id: "", // this will be set when you decide which backend container to use with it
            // position: { x: 0, y: 0 },
            // size: { width: "0px", height: "0px" },
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

  return (
    <>
      <div className={styles.Workspace}>
        <div className={styles.Manager}>
          <nav>
            <ul>
              <li onClick={addVisualContainer}>
                <a>Add</a>
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
            />
          ))}

          {/* {containerElements.map((element) =>
            createPortal(element, doc
            ument.getElementById("display"))
          )} */}
        </div>
      </div>

      {isModalOpen && (
        <Modal
          onClose={closeModal}
          onSubmit={(bikeName) => {
            handleAddBicycle(bikeName);
            closeModal();
          }}
        />
      )}

      {isGearModalOpen && (
        <GearModal onClose={closeModal} onSubmit={closeModal} />
      )}
    </>
  );
};

export default Workspace;
