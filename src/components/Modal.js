import React, { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalComponent.module.css";

const ModularModal = ({
  title = "Untitled Modal",
  children,
  onClose,
  onSubmit,
}) => {
  const handleSubmit = () => {
    onClose();
    onSubmit();
  };

  return createPortal(
    <div className={`${styles.modalOverlay} ${styles.blur}`}>
      <div className={styles.modalContent}>
        <h2>{title}</h2>
        <div className={styles.modalBody}>{children}</div>

        <div className={styles.buttons}>
          <button onClick={onClose} className={styles.abort}>
            Cancel
          </button>
          <button onClick={handleSubmit} className={styles.submit}>
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root") // Make sure to add a div with id 'modal-root' in your index.html
  );
};

export default ModularModal;
