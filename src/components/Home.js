import { createPortal } from "react-dom";
import Sidebar from "./Sidebar";
import bike from "../assets/images/bike.svg";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import GearDropdown from "./GearDropdown";
import { useAuth } from "../App"; // Adjust the path as needed
import { firestore as db } from "./firebase"; // Adjust the path as needed

const Home = () => {
  const { user } = useAuth();
  const [portalElements, setPortalElements] = useState([]);
  const [uid, setUid] = useState(null);

  const handleClick = () => {
    setPortalElements([
      ...portalElements,
      <GearDropdown></GearDropdown>, // Unique key for each element
    ]);
  };

  const handleAddBicycle = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);

      try {
        // Fetch the current document
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const existingBicycles = userData.bicycles || []; // Default to empty array if bicycles field doesn't exist

          // Add the new bicycle item
          const updatedBicycles = [...existingBicycles, "New Bicycle"];

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
      <Sidebar></Sidebar>
      <div className="Workspace">
        <div className="Manager">
          <nav>
            <ul>
              <li>
                <a onClick={handleClick}>Add</a>
              </li>
              <li>
                <a>Edit</a>
              </li>
              <li>
                <a>Search</a>
              </li>
              <li>
                <a onClick={handleAddBicycle}>Add Bicycle</a>
              </li>
            </ul>
          </nav>
          <nav className="right-nav">
            <p>Welcome{user ? `, ${user.displayName}` : ""}!</p>
            <ul>
              <li>
                <a>Save</a>
              </li>
              <li>
                <a>Revert</a>
              </li>
              <li>
                <a>Reset</a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="Display" id="display">
          <img src={bike} className="App-logo" alt="logo" />

          {portalElements.map((element) =>
            createPortal(element, document.getElementById("display"))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
