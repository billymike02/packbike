import React from "react";
import { Rnd } from "react-rnd";
import styles from "./GearDropdown.module.css";
import { FaPencil } from "react-icons/fa6";

const GearDropdown = () => {
  return (
    <Rnd
      default={{
        x: 100,
        y: 100,
        width: 200,
        height: 200,
      }}
      minWidth={100}
      minHeight={100}
      bounds="parent" // Optional: Restricts movement within the parent container
      className={styles.clickable}
    >
      <div className={styles.clickableOverlay}>
        <FaPencil></FaPencil>
      </div>
    </Rnd>
  );
};

export default GearDropdown;
