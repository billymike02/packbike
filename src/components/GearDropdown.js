import styles from "./GearDropdown.module.css";
import Draggable from "react-draggable";
import { useState } from "react";

const GearDropdown = ({ position, onPositionChange }) => {
  const [showDelete, setShowDelete] = useState(false);

  const handleStart = (event) => {
    console.log("Drag started", event);
    // You can also manipulate state or perform actions here
  };

  const handleStop = (e, data) => {
    const { x, y } = data;
    onPositionChange({ x, y });
  };

  return (
    <Draggable
      handle={`.${styles.moveIcon}`}
      onStart={handleStart}
      onStop={handleStop}
      bounds="parent"
      defaultPosition={{ x: position.x, y: position.y }}
    >
      <div className={styles.gear}>
        {showDelete && <div className={styles.deleteButton}>✗</div>}
        <div className={styles.moveIcon}>⋯</div>
        <div className={styles.title}>Gear #1</div>
        <div className={styles.dropdownContainer}>
          <select className={styles.dropdown}>
            <option value="1">Pannier</option>

            <option value="2">Roll</option>

            <option value="3">Cage</option>
          </select>
        </div>
      </div>
    </Draggable>
  );
};

export default GearDropdown;
