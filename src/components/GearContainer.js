import styles from "./GearManager.module.css";
import { MdDelete } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import { useState } from "react";

const GearContainer = ({ onRemove }) => {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <div className={styles.gearContainer}>
        {showDelete && (
          <div className={styles.deleteOverlay}>
            Are you sure?
            <button
              className={styles.abort}
              onClick={() => {
                setShowDelete(false);
              }}
            >
              <RxCross2 className={styles.deleteIcons}></RxCross2>
            </button>
            <button
              className={styles.continue}
              onClick={() => {
                onRemove();
              }}
            >
              <IoCheckmark className={styles.deleteIcons}></IoCheckmark>
            </button>
          </div>
        )}
        <div className={styles.gearContainerHeader}>
          <form>
            <input placeholder="Container name" />
          </form>
          <MdDelete
            className={styles.deleteButton}
            onClick={() => {
              setShowDelete(true);
            }}
          />
        </div>
        <div className={styles.gearContainerBody}>
          <ul>
            <li>Item A</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default GearContainer;
