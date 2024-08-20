import styles from "./GearDropdown.module.css";
import Draggable from "react-draggable";

const GearDropdown = () => {
  const handleStart = (event) => {
    console.log("Drag started", event);
    // You can also manipulate state or perform actions here
  };

  return (
    <Draggable handle={`.${styles.moveIcon}`} onStart={handleStart}>
      <div className={styles.gear}>
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
