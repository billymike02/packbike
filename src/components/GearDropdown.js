import React, { useState } from "react";
import { Rnd } from "react-rnd";
import styles from "./GearDropdown.module.css";
import { FaPencil } from "react-icons/fa6";
import { useAuth } from "../App";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import modalStyles from "./ModalComponent.module.css";

// firestore stuffs
import { firestore } from "./firebase";
import { arrayUnion, doc, arrayRemove } from "firebase/firestore";
import { updateDoc, onSnapshot } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import CustomSelect from "./CustomSelect";

const GearModal = ({
  onClose,
  onSubmit,
  onDelete,
  currentBackendContainer,
  currentColor,
}) => {
  const { user } = useAuth();
  const [containers, setContainers] = useState([]);
  const [backendContainer, setBackendContainer] = useState(
    currentBackendContainer
  );

  const [bgColor, setBgColor] = useState(currentColor);

  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "brown",
    "black",
  ];

  useEffect(() => {
    if (!user) return; // Exit if no user

    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Convert containers map to an array
        const containersArray = Object.entries(data.containers || {}).map(
          ([id, container]) => ({
            id, // Add the key as an ID field
            ...container, // Spread the container data
          })
        );

        console.log("Backend containers:", containersArray);
        setContainers(containersArray); // Set the array in state
      } else {
        console.log("No such document!");
        setContainers([]); // Clear state if document does not exist
      }
    });

    // Clean up subscription on component unmount
    return () => unsubscribe();
  }, [user]); // Depend on `user`, so it re-subscribes if `user` changes

  const handleColorSelection = (selected) => {
    setBgColor(selected);
  };

  const handleContainerChange = (selected) => {
    setBackendContainer(selected);
  };

  return createPortal(
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <h2>{"Edit gear container"}</h2>
        <div className={modalStyles.modalBody}>
          <CustomSelect
            options={containers.map((container) => ({
              value: container.id, // Value to be passed back
              label: container.displayName, // Display name for the select
            }))}
            placeholder={backendContainer || "Select a container"}
            onSelect={handleContainerChange}
          ></CustomSelect>
          <CustomSelect
            placeholder="Select a color"
            options={colors}
            onSelect={handleColorSelection}
          ></CustomSelect>
        </div>

        <div className={modalStyles.buttons}>
          <button onClick={onClose} className={modalStyles.abort}>
            Cancel
          </button>
          <button
            className={modalStyles.destroy}
            onClick={() => {
              onDelete();
              onClose();
            }}
          >
            Delete
          </button>

          <button
            onClick={() => {
              onSubmit(backendContainer, bgColor);
            }}
            className={modalStyles.submit}
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

const GearDropdown = ({ id, type, onDelete, selectedBike }) => {
  const { user } = useAuth();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: "200px", height: "200px" });
  const [backendContainer, setBackendContainer] = useState("");
  const [bgColor, setBgColor] = useState("");

  const [isGearModalOpen, setIsGearModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return; // Exit if no user

    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Access the nested fields
        const visualContainers = data?.bicycles[selectedBike].visualContainers;
        const container = visualContainers?.[id];

        setBackendContainer(container?.container_id);
        setBgColor(container?.color);

        console.log("downloaded bg color: ", container?.color);

        const containerWidth = container?.width;
        const containerHeight = container?.height;
        const containerPos = container?.position;
        const containerPosX = containerPos?.x;
        const containerPosY = containerPos?.y;

        setSize({ width: containerWidth, height: containerHeight });

        setPosition({ x: containerPosX, y: containerPosY });
      } else {
        console.log("No such document!");
      }
    });

    // Clean up subscription on component unmount
    return () => unsubscribe();
  }, [user]); // Depend on `user`, so it re-subscribes if `user` changes

  const onResizeStop = async (e, direction, ref, delta, position) => {
    // Get the current width and height
    const newWidth = ref.style.width;
    const newHeight = ref.style.height;

    // Update the state with the new size
    setSize({
      width: parseInt(newWidth),
      height: parseInt(newHeight),
    });

    // Print the resize scale
    console.log("Resize scale:", { width: newWidth, height: newHeight });

    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);
        console.log(id);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${id}.size.width`]:
              newWidth,
            [`bicycles.${selectedBike}.visualContainers.${id}.size.height`]:
              newHeight,
          });
        } else {
        }
      } catch (error) {}
    }
  };

  const onDragStop = async (e, d) => {
    // Get the current position
    const { x, y } = d;

    console.log("size", size.width, size.height);
    // Update the state with the new position
    setPosition({ x, y });

    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);
        console.log(id);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${id}.position.x`]: x,
            [`bicycles.${selectedBike}.visualContainers.${id}.position.y`]: y,
          });
        } else {
        }
      } catch (error) {}
    }
  };

  const onModalChange = async (newContainer, newColor) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${id}.container_id`]:
              newContainer,
            [`bicycles.${selectedBike}.visualContainers.${id}.color`]: newColor,
          });
        } else {
        }
      } catch (error) {}
    }
  };

  return (
    <>
      <Rnd
        default={{
          x: 0,
          y: 0,
          width: 30,
          height: 30,
        }}
        // bounds="parent"
        className={`${styles.clickable} ${styles[type]} ${
          backendContainer != null && backendContainer != ""
            ? styles.filled
            : ""
        }`}
        style={{ backgroundColor: bgColor }}
        onResizeStop={onResizeStop}
        onDragStop={onDragStop}
        enableResizing="false"
        position={position}
        size={size}
      >
        <div className={styles.clickableOverlay}>
          <FaPencil
            style={{ cursor: "pointer" }}
            onClick={() => {
              setIsGearModalOpen(true);
            }}
          />
        </div>
      </Rnd>
      {isGearModalOpen && (
        <GearModal
          onClose={() => {
            setIsGearModalOpen(false);
          }}
          onSubmit={(newContainer, newColor) => {
            console.log("new container", newContainer);
            onModalChange(newContainer, newColor);
            setIsGearModalOpen(false);
          }}
          currentBackendContainer={backendContainer}
          currentColor={bgColor}
          onDelete={() => {
            onDelete(id);
          }}
        ></GearModal>
      )}
    </>
  );
};

export default GearDropdown;
