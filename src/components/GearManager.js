import { useState } from "react";
import styles from "./GearManager.module.css";
import { IoIosAdd } from "react-icons/io";
import GearContainer from "./GearContainer";

const GearManager = () => {
  const [containers, setContainers] = useState([]);

  const handleContainerDelete = (id) => {
    setContainers((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const addContainer = () => {
    const newContainer = {
      id: Date.now(), // Generates a unique id based on timestamp
    };
    setContainers([...containers, newContainer]);
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
