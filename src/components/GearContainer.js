import { v4 as uuidv4 } from "uuid"; // Import uuid
import styles from "./GearManager.module.css";
import { MdDelete } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import { useEffect, useState } from "react";
import { IoIosAdd } from "react-icons/io";
import modalStyles from "./ModalComponent.module.css";
import { createPortal } from "react-dom";
import { FaPencil } from "react-icons/fa6";
import { useAuth } from "../App";

// firestore stuffs
import { firestore } from "./firebase";
import { doc } from "firebase/firestore";
import { updateDoc, onSnapshot } from "firebase/firestore";
import { getDoc } from "firebase/firestore";

const Modal = ({
  onClose,
  onSubmit,
  onDelete,
  bEdit,
  prevName,
  prevWeight,
  prevVolume,
  itemID,
}) => {
  const [itemName, setItemName] = useState(prevName || "");
  const [itemWeight, setItemWeight] = useState(prevWeight || "");
  const [itemVolume, setItemVolume] = useState(prevVolume || "");

  useEffect(() => {
    setItemName(prevName || "");
    setItemWeight(prevWeight || "");
    setItemVolume(prevVolume || "");
  }, [prevName, prevWeight, prevVolume]);

  const handleSubmit = () => {
    if (itemName.length <= 0) {
      return;
    }

    if (bEdit) {
      onSubmit(itemName, itemWeight, itemVolume, itemID);
    } else {
      const newItemID = uuidv4(); // Generate a new unique ID
      onSubmit(itemName, itemWeight, itemVolume, newItemID);
    }

    setItemName("");
    setItemWeight("");
    setItemVolume("");
    onClose();
  };

  const handleDelete = () => {
    onDelete(itemID);
    onClose();
  };

  return createPortal(
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <h2>{!bEdit ? "Add a New Item" : "Edit Item"}</h2>
        <div className={modalStyles.modalBody}>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Enter item name"
            required
          />
          <input
            type="text"
            value={itemWeight}
            onChange={(e) => setItemWeight(e.target.value)}
            placeholder="Enter item weight"
          />
          <input
            type="text"
            value={itemVolume}
            onChange={(e) => setItemVolume(e.target.value)}
            placeholder="Enter item volume"
          />
        </div>

        <div className={modalStyles.buttons}>
          <button onClick={onClose} className={modalStyles.abort}>
            Cancel
          </button>
          {bEdit && (
            <button className={modalStyles.destroy} onClick={handleDelete}>
              Delete
            </button>
          )}
          <button onClick={handleSubmit} className={modalStyles.submit}>
            Done
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

const GearContainer = ({ id, onRemove }) => {
  const [showDelete, setShowDelete] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemEditIndex, setItemEditIndex] = useState(null);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [tableItems, setTableItems] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Reference to the 'users' collection and the specific user document
      const userDocRef = doc(firestore, "users", user.uid);

      // Listen for changes in the user's document
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const newTableItems = userData.containers[id] || [];

          console.log(newTableItems);

          setTableItems(newTableItems);
        }
      });

      // Cleanup the subscription on unmount
      return () => unsubscribe();
    }
  }, [user]);

  const handleAddOrUpdateItem = async (
    itemName,
    itemWeight,
    itemVolume,
    itemID
  ) => {
    // if (user) {
    //   const userDocRef = doc(firestore, "users", user.uid);
    //   try {
    //     const userDoc = await getDoc(userDocRef);
    //     if (userDoc.exists()) {
    //       const userData = userDoc.data();
    //       const containers = userData.containers || {};
    //       // Merge or update the container data
    //       const updatedContainers = {
    //         ...containers,
    //         [id]: {
    //           name: itemName,
    //           weight: itemWeight,
    //           volume: itemVolume,
    //           id: itemID,
    //         },
    //       };
    //       // Update the document with the new container data
    //       await updateDoc(userDocRef, { containers: updatedContainers });
    //       console.log("Updated container items");
    //     } else {
    //       console.log("User document does not exist");
    //     }
    //   } catch (error) {
    //     console.log("Error updating container: ", error);
    //   }
    // }
    // if (tableItems.find((item) => item.id === itemID)) {
    //   // Update existing item
    //   setTableItems((prevItems) =>
    //     prevItems.map((item) =>
    //       item.id === itemID
    //         ? { ...item, itemName, itemWeight, itemVolume }
    //         : item
    //     )
    //   );
    // } else {
    //   // Add new item
    //   setTableItems((prevItems) => [
    //     ...prevItems,
    //     { itemName, itemWeight, itemVolume, id: itemID },
    //   ]);
    // }
  };

  const handleRemoveItem = (itemID) => {
    setTableItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemID)
    );
  };

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
            <input placeholder="Container name" required />
          </form>
          <MdDelete
            className={styles.deleteButton}
            onClick={() => {
              setShowDelete(true);
            }}
          />
        </div>
        <div className={styles.gearContainerBody}>
          {/* <ul>
            {tableItems.map((item) => (
              <li key={item.id}>
                <div
                  className={styles.editOverlay}
                  onClick={() => {
                    setItemEditIndex(
                      tableItems.findIndex((i) => i.id === item.id)
                    );
                    setShowEditItemModal(true);
                  }}
                >
                  <FaPencil className={styles.editIcon} />
                </div>

                <div style={{ textAlign: "left" }}>{item.itemName}</div>
                <div style={{ textAlign: "center" }}>
                  {item.itemWeight === null ? "N/A" : item.itemWeight}
                </div>
                <div style={{ textAlign: "right" }}>
                  {item.itemVolume === null ? "N/A" : item.itemVolume}
                </div>
              </li>
            ))}
          </ul> */}

          <div
            className={styles.addButton}
            onClick={() => {
              setShowAddItemModal(true);
            }}
          >
            <IoIosAdd />
          </div>
        </div>
      </div>
      {showAddItemModal && (
        <Modal
          onClose={() => {
            setShowAddItemModal(false);
          }}
          onSubmit={handleAddOrUpdateItem}
        />
      )}
      {showEditItemModal && (
        <Modal
          onClose={() => {
            setShowEditItemModal(false);
          }}
          onSubmit={handleAddOrUpdateItem}
          bEdit={true}
          onDelete={handleRemoveItem}
          itemID={tableItems[itemEditIndex].id}
          prevName={tableItems[itemEditIndex].itemName}
          prevWeight={tableItems[itemEditIndex].itemWeight}
          prevVolume={tableItems[itemEditIndex].itemVolume}
        />
      )}
    </>
  );
};

export default GearContainer;
