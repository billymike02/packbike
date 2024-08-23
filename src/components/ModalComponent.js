import React, { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalComponent.module.css";

const Modal = ({ onClose, onSubmit }) => {
  const [bikeName, setBikeName] = useState("");

  const handleSubmit = () => {
    onSubmit(bikeName);
    setBikeName("");
    onClose();
  };

  return createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Add a New Bike</h2>
        <div className={styles.modalBody}>
          <input
            type="text"
            value={bikeName}
            onChange={(e) => setBikeName(e.target.value)}
            placeholder="Enter bike name"
          />
        </div>

        <div className={styles.buttons}>
          <button onClick={onClose} className={styles.abort}>
            Cancel
          </button>
          <button onClick={handleSubmit} className={styles.submit}>
            Done
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root") // Make sure to add a div with id 'modal-root' in your index.html
  );
};

export default Modal;
