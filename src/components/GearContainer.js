import { v4 as uuidv4 } from "uuid"; // Import uuid
import styles from "./GearManager.module.css";
import { MdDelete } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { RxCheck } from "react-icons/rx";
import { useEffect, useState } from "react";
import { IoIosAdd } from "react-icons/io";
import modalStyles from "./ModalComponent.module.css";
import { createPortal } from "react-dom";
import { FaPencil } from "react-icons/fa6";
import { useAuth } from "../App";

// firestore stuffs
import { firestore } from "./firebase";
import { arrayUnion, doc, arrayRemove } from "firebase/firestore";
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
      // don't pass in the item ID if it's new
      onSubmit(itemName, itemWeight, itemVolume);
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
            type="number"
            value={itemWeight}
            onChange={(e) => setItemWeight(e.target.value)}
            placeholder="Enter item weight"
            step="any"
          />
          <input
            type="number"
            value={itemVolume}
            onChange={(e) => setItemVolume(e.target.value)}
            placeholder="Enter item volume"
            step="any"
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

const GearContainer = ({ id, displayName, onRemove, onDisplayNameChange }) => {
  const [name, setName] = useState(displayName);
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
          const arrayFromObject = Object.values(newItems || {}) || [];
          console.log(arrayFromObject);
          setTableItems(arrayFromObject);
        }
      });

      // Cleanup the subscription on unmount
      return () => unsubscribe();
    }
  }, [user]);

  const handleNameSubmit = () => {
    if (name !== displayName) {
      onDisplayNameChange(id, name);
    }
  };

  const handleAddOrEditItem = async (
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
          const data = userDoc.data();
          // create a new item
          if (itemID == null) {
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
            // edit the item
          } else {
            // Edit the item
            const container = data.containers[id];
            if (container) {
              const items = container.items;
              const oldItemIndex = items.findIndex(
                (item) => item.id === itemID
              );

              if (oldItemIndex !== -1) {
                // Modify the old item
                const updatedItem = {
                  ...items[oldItemIndex],
                  displayName: itemName, // Replace with the new value
                  weight: itemWeight, // Replace with the new value
                  volume: itemVolume, // Replace with the new value
                };

                // Remove the old item and add the updated item
                await updateDoc(userDocRef, {
                  [`containers.${id}.items`]: arrayRemove(items[oldItemIndex]),
                });

                await updateDoc(userDocRef, {
                  [`containers.${id}.items`]: arrayUnion(updatedItem),
                });

                console.log("Item updated successfully.");
              } else {
                console.error("Item not found.");
              }
            } else {
              console.error("Container not found.");
            }
          }

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
              <RxCheck className={styles.deleteIcons}></RxCheck>
            </button>
          </div>
        )}
        <div className={styles.gearContainerHeader}>
          <form>
            <input
              placeholder="Container name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              onBlur={handleNameSubmit}
              required
            />
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
                    <div style={{ textAlign: "center" }}>{item.weight}</div>
                    <div style={{ textAlign: "right" }}>{item.volume}</div>
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
          onSubmit={handleAddOrEditItem}
        />
      )}
      {showEditItemModal && (
        <Modal
          onClose={() => {
            setShowEditItemModal(false);
          }}
          onSubmit={handleAddOrEditItem}
          bEdit={true}
          onDelete={handleRemoveItem}
          itemID={tableItems[itemEditIndex].id}
          prevName={tableItems[itemEditIndex].displayName}
          prevWeight={tableItems[itemEditIndex].weight}
          prevVolume={tableItems[itemEditIndex].volume}
        />
      )}
    </>
  );
};

export default GearContainer;
