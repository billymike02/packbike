import React, { useState } from "react";
import { Rnd } from "react-rnd";
import styles from "./GearDropdown.module.css";
import { FaPencil } from "react-icons/fa6";
import { useAuth } from "../App";
import { useEffect } from "react";

// firestore stuffs
import { firestore } from "./firebase";
import { arrayUnion, doc, arrayRemove } from "firebase/firestore";
import { updateDoc, onSnapshot } from "firebase/firestore";
import { getDoc } from "firebase/firestore";

const GearDropdown = ({ id }) => {
  const { user } = useAuth();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: "200px", height: "200px" });

  useEffect(() => {
    if (!user) return; // Exit if no user

    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Access the nested fields
        const visualContainers = data?.bicycles?.null?.visualContainers;
        const container = visualContainers?.[id];
        const containerSize = container?.size;
        const containerWidth = containerSize?.width;
        const containerHeight = containerSize?.height;
        const containerPos = container?.position;
        const containerPosX = containerPos?.x;
        const containerPosY = containerPos?.y;

        setPosition({ x: containerPosX, y: containerPosY });
        setSize({ width: containerWidth, height: containerHeight });
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
            [`bicycles.null.visualContainers.${id}.size.width`]: newWidth,
            [`bicycles.null.visualContainers.${id}.size.height`]: newHeight,
          });
        } else {
        }
      } catch (error) {}
    }
  };

  const onDragStop = async (e, d) => {
    // Get the current position
    const { x, y } = d;

    // Update the state with the new position
    setPosition({ x, y });

    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);
        console.log(id);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            [`bicycles.null.visualContainers.${id}.position.x`]: x,
            [`bicycles.null.visualContainers.${id}.position.y`]: y,
          });
        } else {
        }
      } catch (error) {}
    }
  };

  return (
    <Rnd
      default={{
        x: 0,
        y: 0,
        width: 200,
        height: 200,
      }}
      minWidth={100}
      minHeight={100}
      bounds="parent"
      className={styles.clickable}
      onResizeStop={onResizeStop}
      onDragStop={onDragStop}
    >
      <div className={styles.clickableOverlay}>
        <FaPencil />
      </div>
    </Rnd>
  );
};

export default GearDropdown;
