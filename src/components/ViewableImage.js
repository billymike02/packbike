import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalComponent.module.css";
import { animated, useSpring } from "@react-spring/web";
import { useRef } from "react";

const ModalImage = ({ src, bShow, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Controls visibility

  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event) => {
        // alert(`${event.target}`);
        if (modalRef.current) {
          // Check if the clicked element is not the <img> tag
          if (event.target.tagName !== "IMG") {
            onClose();
            // You can also trigger the close logic here instead of the alert
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

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
        style={{
          ...animatedStyles,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
        ref={modalRef}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={src}
            style={{
              maxHeight: "90vh",
              maxWidth: "90vw",
              objectFit: "contain",
              userSelect: "none",
              WebkitUserSelect: "none",
              borderRadius: "1rem",
            }}
          />
        </div>
      </animated.div>
    ),
    document.getElementById("modal-root") // Make sure to add a div with id 'modal-root' in your index.html
  );
};

const ViewableImage = ({
  src,
  expandable = false,
  borderRadius = "0.5rem",
  maxWidth,
  maxHeight,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        style={{
          display: "flex",
          maxWidth,
          maxHeight,
        }}
        onClick={() => setShowModal(true)}
      >
        <img
          className="responsive-image"
          src={src}
          style={{ borderRadius, maxHeight: "100%", maxWidth: "100vh" }}
        />
      </div>

      {expandable && (
        <ModalImage
          src={src}
          bShow={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ViewableImage;
