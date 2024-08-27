import React, { useEffect, useState } from "react";
import { useAuth } from "../App";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore as db } from "./firebase";
import bike from "../assets/images/bike.svg";
import { useOutletContext } from "react-router-dom";
import Modal from "./ModalComponent";
import styles from "./Workspace.module.css";
import GearDropdown from "./GearDropdown";
import { createPortal } from "react-dom";

const Workspace = () => {
  const { selectedBike } = useOutletContext();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [containerElements, setContainerElements] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
          <img src={bike} className={styles.BicycleVector} alt="logo" />
          {containerElements.map((element) =>
            createPortal(element, document.getElementById("display"))
          )}
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
    </>
  );
};

export default Workspace;
