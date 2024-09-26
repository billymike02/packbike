import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalComponent.module.css";
import { animated, useSpring } from "@react-spring/web";

const ModularModal = ({ title, subtitle, bShow, children, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Controls visibility

  useEffect(() => {
    if (bShow) {
      setIsVisible(true); // Make it visible first
      setIsOpen(true); // Then trigger animation to show
    } else {
      setIsOpen(false); // Trigger animation to hide
    }
  }, [bShow]);

  const animatedStyles = useSpring({
    opacity: isOpen ? 1 : 0,
    config: { duration: 200 },
    onRest: () => {
      if (!isOpen) {
        setIsVisible(false); // Set visibility to hidden after animation
      }
    },
  });

  return createPortal(
    isVisible && ( // Only render the modal if it's visible
      <animated.div
        className={`${styles.modalOverlay} ${styles.blur}`}
        style={animatedStyles}
      >
        <div className={styles.modalContent}>
          <h2>{title}</h2>
          {subtitle && <h3 style={{ marginTop: "0.0rem" }}>{subtitle}</h3>}
          <div className={styles.modalBody}>{children}</div>
        </div>
      </animated.div>
    ),
    document.getElementById("modal-root") // Make sure to add a div with id 'modal-root' in your index.html
  );
};

export default ModularModal;
