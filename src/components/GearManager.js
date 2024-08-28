import { useState } from "react";
import styles from "./GearManager.module.css";
import { IoIosAdd } from "react-icons/io";
import GearContainer from "./GearContainer";
import { useAuth } from "../App";
import { doc } from "firebase/firestore";
import { updateDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "./firebase";
import { getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid"; // Import uuid

const GearManager = () => {
  const { user } = useAuth();
  const [containers, setContainers] = useState([]);

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
            displayName: "",
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
      <div className={styles.addButton} onClick={addContainer}>
        <IoIosAdd />
      </div>
    </div>
  );
};

export default GearManager;
