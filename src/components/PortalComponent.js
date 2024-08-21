import React, { Children } from "react";

export default function ModalContent({ children, onClose, show }) {
  return (
    <div className="modal" onClick={onClose}>
      {children}
      {/* <button onClick={onClose}>Close</button> */}
    </div>
  );
}
