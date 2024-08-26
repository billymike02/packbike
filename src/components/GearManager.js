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

const GearManager = () => {
  const { user } = useAuth();
  const [containers, setContainers] = useState([]);

  useEffect(() => {
    if (user) {
      // Reference to the 'users' collection and the specific user document
      const userDocRef = doc(firestore, "users", user.uid);

      // Listen for changes in the user's document
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const newContainers = userData.containers || [];
          setContainers(newContainers);
        }
      });

      // Cleanup the subscription on unmount
      return () => unsubscribe();
    }
  }, [user]);

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
          const userData = userDoc.data();
          const existingContainers = userData.containers || [];

          const newContainer = {
            id: Date.now(),
            name: "default-name",
          };

          const updatedContainers = [...existingContainers, newContainer];

          await updateDoc(userDocRef, { containers: updatedContainers });

          console.log("Updated containers");
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.log("Error adding container: ", error);
      }
    }
  };

  return (
    <div className={styles.gearManager}>
      {containers.map((container) => (
        <GearContainer
          key={container.id}
          id={container.id}
          onRemove={() => handleContainerDelete(container.id)}
        />
      ))}
      <div className={styles.addButton} onClick={addContainer}>
        <IoIosAdd />
      </div>
    </div>
  );
};

export default GearManager;
