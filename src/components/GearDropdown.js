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
  currentBackendContainer, // this is the id, not the display name
  currentColor,
}) => {
  const { user } = useAuth();
  const [containers, setContainers] = useState([]);
  const [backendContainer, setBackendContainer] = useState(
    currentBackendContainer
  );
  const [containerDisplayName, setContainerDisplayName] = useState(null);

  const [bgColor, setBgColor] = useState(currentColor);

  // Convert colors to the correct format for CustomSelect
  const colors = [
    { value: "red", label: "Red" },
    { value: "orange", label: "Orange" },
    { value: "yellow", label: "Yellow" },
    { value: "green", label: "Green" },
    { value: "blue", label: "Blue" },
    { value: "purple", label: "Purple" },
    { value: "brown", label: "Brown" },
    { value: "black", label: "Black" },
  ];

  useEffect(() => {
    if (!user) return; // Exit if no user

    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      console.log("kate", currentColor);
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Convert containers map to an array
        const containersArray = Object.entries(data.containers || {}).map(
          ([id, container]) => ({
            id, // Add the key as an ID field
            ...container, // Spread the container data
          })
        );

        // Assuming container_id is the value you are looking for
        const searchId = backendContainer; // or wherever you get this value

        // Find the container that matches the searchId
        const selectedContainer = containersArray.find(
          (container) => container.id === searchId
        );

        console.log("searching for", searchId, "in", containersArray);

        console.log("found: ", selectedContainer);

        if (selectedContainer) {
          setContainerDisplayName(selectedContainer.displayName || "");
        }

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

    console.log("set bg container", selected);
  };

  return createPortal(
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <h2>{"Edit gear container"}</h2>
        <div className={modalStyles.modalBody}>
          {/* CustomSelect for containers */}
          <CustomSelect
            options={containers.map((container) => ({
              value: container.id, // Value to be passed back
              label: container.displayName, // Display name for the select
            }))}
            placeholder={containerDisplayName || "Select a container"}
            onSelect={handleContainerChange}
          />
          {/* CustomSelect for colors */}
          <CustomSelect
            placeholder={currentColor || "Select a color"}
            options={colors}
            onSelect={handleColorSelection}
          />
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
              console.log("submitted backend", backendContainer);
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

const GearDropdown = ({ parentScale, id, type, onDelete, selectedBike }) => {
  const { user } = useAuth();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: "200px", height: "200px" });
  const [backendContainer, setBackendContainer] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [containers, setContainers] = useState([]);
  const [isGearModalOpen, setIsGearModalOpen] = useState(false);
  const [currentDisplayName, setCurrentDisplayName] = useState("");

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
            id,
            ...container,
          })
        );

        setContainers(containersArray); // Set the array in state

        // Access the nested fields
        const visualContainers = data?.bicycles[selectedBike].visualContainers;
        const container = visualContainers?.[id];

        setBackendContainer(container?.container_id);
        setBgColor(container?.color);

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
  }, [user, selectedBike, id]);

  const onResizeStop = async (e, direction, ref, delta, position) => {
    const newWidth = ref.style.width;
    const newHeight = ref.style.height;

    setSize({
      width: parseInt(newWidth),
      height: parseInt(newHeight),
    });

    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${id}.size.width`]:
              newWidth,
            [`bicycles.${selectedBike}.visualContainers.${id}.size.height`]:
              newHeight,
          });
        }
      } catch (error) {}
    }
  };

  const onDragStop = async (e, d) => {
    const { x, y } = d;

    setPosition({ x, y });

    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${id}.position.x`]: x,
            [`bicycles.${selectedBike}.visualContainers.${id}.position.y`]: y,
          });
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
        scale={parentScale}
        className={`${styles.clickable} ${styles[type]} ${
          backendContainer != null && backendContainer != ""
            ? styles.filled
            : ""
        }`}
        style={{ backgroundColor: bgColor }}
        onResizeStop={onResizeStop}
        onDragStop={onDragStop}
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
