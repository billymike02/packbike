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
import { arrayUnion, doc } from "firebase/firestore";
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

          if (!userData.containers[id]) {
            return;
          }

          const newItems = userData.containers[id].items;
          const arrayFromObject = Object.values(newItems) || [];
          console.log(arrayFromObject);
          setTableItems(arrayFromObject);
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
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const unique_id = uuidv4();

          const newItem = {
            displayName: itemName,
            weight: itemWeight,
            volume: itemVolume,
            id: unique_id,
          };

          await updateDoc(userDocRef, {
            [`containers.${id}.items`]: arrayUnion(newItem),
          });

          console.log("Updated items");
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.log("Error adding item: ", error);
      }
    }
  };

  const handleRemoveItem = async (itemID) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const updatedItems = tableItems.filter((item) => item.id !== itemID);

          console.log("new", updatedItems);

          await updateDoc(userDocRef, {
            [`containers.${id}.items`]: updatedItems,
          });

          console.log("Updated items");
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.log("Error removing item: ", error);
      }
    }
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
          <ul>
            {tableItems.map(
              (item) => (
                console.log(item),
                (
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

                    <div style={{ textAlign: "left" }}>{item.displayName}</div>
                    <div style={{ textAlign: "center" }}>
                      {item.itemWeight === null ? item.weight : "N/A"}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {item.itemVolume === null ? item.volume : "N/A"}
                    </div>
                  </li>
                )
              )
            )}
          </ul>

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
