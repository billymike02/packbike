import { useState } from "react";
import styles from "./GearManager.module.css";
import { IoAddCircle, IoCreateSharp } from "react-icons/io5";
import GearContainer from "./GearContainer";
import { useAuth } from "../App";
import { doc } from "firebase/firestore";
import { updateDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "./firebase";
import { getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import ButtonSwitch from "./ButtonSwitch";
import { useOutletContext } from "react-router-dom";

const GearManager = () => {
  const { user } = useAuth();
  const [containers, setContainers] = useState([]);
  const [units, setUnits] = useOutletContext();

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

        // Sort the array by container displayName
        containersArray.sort((a, b) => {
          // Assuming displayName is a string and you want a case-insensitive sort
          return a.displayName.localeCompare(b.displayName, undefined, {
            sensitivity: "base",
          });
        });

        console.log(containersArray);
        setContainers(containersArray); // Set the array in state
      } else {
        console.log("No such document!");
        setContainers([]); // Clear state if document does not exist
      }
    });

    // Clean up subscription on component unmount
    return () => unsubscribe();
  }, [user]); // Depend on `user`, so it re-subscribes if `user` changes

  const handleContainerDelete = async (id) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const updatedContainers = containers.filter((item) => item.id !== id);

          await updateDoc(userDocRef, { containers: updatedContainers });

          console.log("Updated containers");
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.log("Error removing container: ", error);
      }
    }
  };

  const addContainer = async () => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const unique_id = uuidv4();

          const newContainer = {
            id: unique_id,
            displayName: "New Container",
            items: {},
          };

          await updateDoc(userDocRef, {
            [`containers.${unique_id}`]: newContainer,
          });

          console.log("Updated containers");
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.log("Error adding container: ", error);
      }
    }
  };

  const updateContainerDisplayName = async (id, newDisplayName) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        await updateDoc(userDocRef, {
          [`containers.${id}.displayName`]: newDisplayName,
        });

        console.log("Updated display name");
      } catch (error) {
        console.log("Error updating display name: ", error);
      }
    }
  };

  const onUnitsChanged = async (value) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      // Store additional user data in Firestore
      await updateDoc(userDocRef, {
        [`prefs.units`]: value,
      });
    }
  };

  return (
    <div className={styles.gearManager}>
      {containers.map((container) => (
        <GearContainer
          key={container.id}
          id={container.id}
          displayName={container.displayName} // Pass displayName
          onRemove={() => handleContainerDelete(container.id)}
          onDisplayNameChange={updateContainerDisplayName} // Pass the callback
        />
      ))}
      <div
        style={{
          position: "fixed",
          bottom: "1.5vw",
          right: "1.5vw",
          display: "flex",
          gap: "8px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ButtonSwitch
          leftOption="Lbs"
          rightOption="Kg"
          defaultSelection={units}
          onChange={onUnitsChanged}
        />
        <IoAddCircle
          size={80}
          style={{
            color: "black",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          onClick={addContainer}
        />
      </div>
    </div>
  );
};

export default GearManager;
