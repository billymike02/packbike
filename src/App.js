import React, { useState } from "react";
import logo from "./logo.svg";
import bike from "./assets/images/bike.svg";
import "./App.css";
import GearDropdown from "./components/GearDropdown";
import Sidebar from "./components/Sidebar";
import { createPortal } from "react-dom";

function App() {
  const [portalElements, setPortalElements] = useState([]);

  const handleClick = () => {
    setPortalElements([
      ...portalElements,
      <GearDropdown></GearDropdown>, // Unique key for each element
    ]);
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
}

export default App;
