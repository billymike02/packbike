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
import { FaPencil } from "react-icons/fa6";
import modalStyles from "./ModalComponent.module.css";

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
          <GearDropdown></GearDropdown>
          <div className={styles.figure}>
            <img
              src={bike}
              className={styles.BicycleVector}
              alt="bicycle-image"
            />
          </div>

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

      {isGearModalOpen && (
        <GearModal onClose={closeModal} onSubmit={closeModal} />
      )}
    </>
  );
};

export default Workspace;
