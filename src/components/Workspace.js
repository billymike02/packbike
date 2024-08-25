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

  const [portalElements, setPortalElements] = useState([]);
  const [containersData, setContainersData] = useState([]);

  const handleAddContainer = () => {
    const newContainer = {
      id: Date.now(), // Use Date.now() or another unique ID generator
      position: { x: 0, y: 0 }, // Default starting position
    };

    setContainersData((prev) => [...prev, newContainer]);
    setPortalElements((prev) => [
      ...prev,
      <GearDropdown
        key={newContainer.id}
        position={newContainer.position}
        onPositionChange={(newPosition) =>
          handlePositionChange(newContainer.id, newPosition)
        }
      />,
    ]);
  };

  const handlePositionChange = (id, newPosition) => {
    setContainersData((prev) =>
      prev.map((container) =>
        container.id === id
          ? { ...container, position: newPosition }
          : container
      )
    );

    console.log(newPosition);
  };

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

  const handleSaveContainers = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const existingBicycles = userDoc.data().bicycles || [];

          if (existingBicycles.includes(selectedBike)) {
            const updatedContainers = containersData.map((container) => ({
              position: container.position,
              // Add other data if needed
            }));

            await updateDoc(userDocRef, {
              [`containers.${selectedBike}`]: updatedContainers,
            });

            console.log("Containers and positions saved successfully!");
          } else {
            console.log("Selected bike does not exist in the user’s bicycles");
          }
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.error("Error saving containers: ", error);
      }
    } else {
      console.log("User not authenticated");
    }
  };

  useEffect(() => {
    const fetchContainers = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        try {
          // Clear previous data (for switching between)
          setPortalElements([]);
          setContainersData([]);

          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const containers = userData.containers?.[selectedBike] || [];

            // Set new data
            setContainersData(
              containers.map((container, index) => ({
                id: index, // Ensure each container has a unique ID
                position: container.position,
              }))
            );

            // Create portal elements with the loaded positions
            setPortalElements(
              containers.map((container) => (
                <GearDropdown
                  key={container.id}
                  position={container.position}
                  onPositionChange={(newPosition) =>
                    handlePositionChange(container.id, newPosition)
                  }
                />
              ))
            );
          } else {
            console.log("User document does not exist");
          }
        } catch (error) {
          console.error("Error fetching containers: ", error);
        }
      } else {
        console.log("User not authenticated");
      }
    };

    fetchContainers();
  }, [selectedBike, user]);

  return (
    <>
      <div className={styles.Workspace}>
        <div className={styles.Manager}>
          <nav>
            <h2>{selectedBike}</h2>
            <ul>
              <li onClick={openModal}>
                <a>Add Bicycle</a>
              </li>
              <li onClick={handleAddContainer}>
                <a>Add container</a>
              </li>
              <li onClick={handleSaveContainers}>
                <a>Save containers</a>
              </li>
            </ul>
          </nav>
        </div>
        <div className={styles.Display} id="display">
          <img src={bike} className="App-logo" alt="logo" />
          {portalElements.map((element) =>
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
