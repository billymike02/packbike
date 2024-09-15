import React, { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalComponent.module.css";
import { animated, useSpring } from "@react-spring/web";

const ModularModal = ({ title = "Untitled Modal", subtitle, children }) => {
  const animatedStyles = useSpring({
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  });

  return createPortal(
    <animated.div
      className={`${styles.modalOverlay} ${styles.blur}`}
      style={animatedStyles}
    >
      <div className={styles.modalContent}>
        <h2 style={{ marginBottom: "0.5rem" }}>{title}</h2>
        {subtitle && <h3 style={{ marginTop: "0.5rem" }}>{subtitle}</h3>}
        <div className={styles.modalBody}>{children}</div>
      </div>
    </animated.div>,
    document.getElementById("modal-root") // Make sure to add a div with id 'modal-root' in your index.html
  );
};

export default ModularModal;
