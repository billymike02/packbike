import React, { useState } from "react";
import MenuBar from "./MenuBar";
import bike from "../assets/images/bike.svg";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import GearDropdown from "./GearDropdown";
import { useAuth } from "../App"; // Adjust the path as needed
import { firestore as db } from "./firebase"; // Adjust the path as needed
import Modal from "./ModalComponent";

const Home = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div className="App">
      <div className="Workspace">
        <div className="Manager">
          <nav>
            <ul>
              <li>
                <a onClick={openModal}>Add Bicycle</a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="Display" id="display">
          <img src={bike} className="App-logo" alt="logo" />
        </div>
      </div>
    </div>
  );
};

export default Home;
