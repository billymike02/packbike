import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import { Rnd } from "react-rnd";
import styles from "./GearDropdown.module.css";
import { FaP, FaPencil } from "react-icons/fa6";
import { useAuth } from "../App";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import modalStyles from "./ModalComponent.module.css";
import Draggable from "react-draggable";

// firestore stuffs
import { firestore } from "./firebase";
import { doc } from "firebase/firestore";
import {
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import CustomSelect from "./CustomSelect";

// New images
import Pannier from "./Bags/Pannier";
import Roll from "./Bags/Roll";
import Forkbag from "./Bags/Forkbag";
import Seatpack from "./Bags/Seatpack";
import Framebag from "./Bags/Framebag";
import ModularModal from "./Modal";
import { IoAddCircle, IoCheckmark } from "react-icons/io5";
import { IoIosAdd } from "react-icons/io";

const InventoryItem = ({ item, selectedBike, containerQuerying }) => {
  const [bisAdded, setIsAdded] = useState(false);
  const [bTaken, setIsTaken] = useState(false);
  const { user } = useAuth();

  // We need to make sure this is 'added' if it's in the owning container
  useEffect(() => {
    if (!user) return; // Exit if no user

    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data.bicycles[selectedBike].visualContainers[containerQuerying]) {
          const contentsArray =
            data.bicycles[selectedBike].visualContainers[containerQuerying]
              .contents || [];

          if (contentsArray.includes(item.id)) {
            setIsAdded(true);
          } else {
            setIsAdded(false);
          }

          setIsTaken(isItemInUse(data, item.id));
        }
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe();
  }, []); // only call on mount

  const isItemInUse = (data, itemID) => {
    // Iterate through each bicycle
    for (const bike of Object.values(data.bicycles)) {
      // Iterate through each visual container in the current bicycle
      for (const container of Object.values(bike.visualContainers)) {
        // Check if the contents array exists and includes the itemUuid
        if (
          container.id != containerQuerying &&
          container.contents &&
          container.contents.includes(itemID)
        ) {
          return true; // Item found
        }
      }
    }
    return false; // Item not found in any visual container
  };

  const handleAddItemToContents = async (itemID) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${containerQuerying}.contents`]:
              arrayUnion(itemID),
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

  const handleRemoveItemFromContents = async (itemID) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // remove the item
          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${containerQuerying}.contents`]:
              arrayRemove(itemID),
          });

          console.log("Removed item");
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.log("Error removing item: ", error);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "99%",
        minHeight: "48px",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: "white",
        border: "0.1rem solid #ccc",
        borderRadius: "0.4rem",
        userSelect: "none",
        WebkitUserSelect: "none",
        cursor: bTaken ? "not-allowed" : "default",
        opacity: bTaken ? "0.5" : "1",
      }}
    >
      <div
        style={{
          backgroundColor: bisAdded ? "rgb(52, 199, 89)" : "black",
          height: "100%",
          width: "60px",
          color: "white",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          cursor: "pointer",
          pointerEvents: bTaken ? "none" : "all",
        }}
        onClick={() => {
          if (!bisAdded) {
            handleAddItemToContents(item.id);
          } else {
            handleRemoveItemFromContents(item.id);
          }
        }}
      >
        {bisAdded ? <IoCheckmark size={30} /> : <IoIosAdd size={40} />}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexGrow: 1, // This makes the item take the remaining space
          padding: "0 10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: "1",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.displayName}
        </div>
        <div
          style={{
            flex: "1",
            textAlign: "center",
          }}
        >
          {item.weight}
        </div>
        <div
          style={{
            flex: "1",
            textAlign: "right",
          }}
        >
          {item.volume}
        </div>
      </div>
    </div>
  );
};

const GearDropdown = ({ parentScale, id, type, onDelete, selectedBike }) => {
  const { user } = useAuth();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: "200px", height: "200px" });
  const [bgColor, setBgColor] = useState("");
  const [containers, setContainers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isGearModalOpen, setIsGearModalOpen] = useState(false);
  const [bFetchingData, setFetchingData] = useState(true);
  const [containerDisplayName, setContainerDisplayName] = useState(null);
  const [colorDisplayName, setColorDisplayName] = useState(null);

  // updated inventory states
  const [availableInventory, setAvailableInventory] = useState([]);
  const [contents, setContents] = useState([]);

  const [itemName, setItemName] = useState("");
  const [itemWeight, setItemWeight] = useState("");
  const [itemVolume, setItemVolume] = useState("");

  // modal states
  const [bShowAddItemModal, setShowAddItemModal] = useState(false);

  const colors = [
    { value: "rgb(199	48	43)", label: "Red" },
    { value: "rgb(254	115	2)", label: "Orange" },
    { value: "rgb(239	179	63	)", label: "Yellow" },
    { value: "rgb(100	133	73)", label: "Green" },
    { value: "rgb(44	96	117	)", label: "Blue" },
    { value: "rgb(89	76	54)", label: "Brown" },
    { value: "rgb(64	64	64)", label: "Black" },
    { value: "rgb(134	142	149)", label: "Grey" },
  ];

  const getColorLabelByValue = (value) => {
    const color = colors.find((c) => c.value === value);
    return color ? color.label : "Unknown color";
  };

  useEffect(() => {
    if (!user) return; // Exit if no user

    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // Convert containers map to an array
        const containersArray = Object.entries(data.containers || {}).map(
          ([id, container]) => ({
            id,
            ...container,
          })
        );

        setContainers(containersArray); // Set the array in state

        // Access the nested fields
        const visualContainers = data?.bicycles[selectedBike].visualContainers;
        const container = visualContainers?.[id];

        setBgColor(container?.color);

        // Assuming container_id is the value you are looking for
        const searchId = container?.container_id; // or wherever you get this value

        // Find the container that matches the searchId
        const selectedContainer = containersArray.find(
          (container) => container.id === searchId
        );

        console.log("searching for", searchId, "in", containersArray);

        if (selectedContainer) {
          console.log("found: ", selectedContainer.displayName);
          setContainerDisplayName(selectedContainer.displayName || "");
        }

        const containerWidth = container?.width;
        const containerHeight = container?.height;
        const containerPos = container?.position;
        const containerPosX = containerPos?.x;
        const containerPosY = containerPos?.y;

        setSize({ width: containerWidth, height: containerHeight });
        setPosition({ x: containerPosX, y: containerPosY });

        setFetchingData(false);
      } else {
        console.log("No such document!");
      }
    });

    // Clean up subscription on component unmount
    return () => unsubscribe();
  }, [user, selectedBike, id]);

  // Listen for available inventory
  useEffect(() => {
    if (!user) return; // Exit if no user

    const docRef = doc(firestore, "users", user.uid);

    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        const inventoryArray = Object.entries(data.inventory || {})
          .map(([id, container]) => ({
            id,
            ...container,
          }))
          .sort((a, b) => a.id.localeCompare(b.id)); // Sort by displayName

        setAvailableInventory(inventoryArray);

        if (data.bicycles[selectedBike].visualContainers[id]) {
          const contentsArray =
            data.bicycles[selectedBike].visualContainers[id].contents || [];

          const newArray = contentsArray
            .map((uuid) => {
              // Access the corresponding object in data.inventory using the uuid
              const item = data.inventory[uuid];

              // Return an object with uuid and displayName if the item exists
              return item ? { uuid, displayName: item.displayName } : null;
            })
            .filter((obj) => obj !== null) // Filter out any null values
            .sort((a, b) => a.uuid.localeCompare(b.uuid)) // Sort by uuid
            .map((obj) => obj.displayName); // Extract displayNames for the final array

          setContents(newArray);
        }
      } else {
        console.log("No such document!");
      }
    });

    // Clean up subscription on component unmount
    return () => unsubscribe();
  }, [user, selectedBike, id]);

  const onDragStop = async (e, d) => {
    const { x, y } = d;

    setPosition({ x, y });

    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${id}.position.x`]: x,
            [`bicycles.${selectedBike}.visualContainers.${id}.position.y`]: y,
          });
        }
      } catch (error) {}
    }
  };

  const firestore_ApplyColor = async (newColor) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${id}.color`]: newColor,
          });
        }
      } catch (error) {}
    }
  };

  const firestore_ApplyBackendContainer = async (newContainer) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            [`bicycles.${selectedBike}.visualContainers.${id}.container_id`]:
              newContainer,
          });
        }
      } catch (error) {}
    }
  };

  const handleAddItemToInventory = async (itemName, itemWeight, itemVolume) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // create a new item
          if (true) {
            const unique_id = uuidv4();

            const newItem = {
              displayName: itemName,
              weight: itemWeight,
              volume: itemVolume,
              id: unique_id,
            };

            await updateDoc(userDocRef, {
              [`inventory.${unique_id}`]: newItem,
            });
            // edit the item
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

  if (bFetchingData == false) {
    return (
      <>
        <Draggable
          position={{ x: position.x, y: position.y }}
          onStop={onDragStop}
          scale={parentScale}
        >
          <div
            className={styles.clickableSVG}
            style={{
              position: "absolute",
              height: size.height,
              width: size.width,
            }}
          >
            {type === "pannier" ? (
              <Pannier fillColor={bgColor} />
            ) : type === "roll" ? (
              <Roll fillColor={bgColor} />
            ) : type === "forkbag" ? (
              <Forkbag fillColor={bgColor} />
            ) : type === "seatpack" ? (
              <Seatpack fillColor={bgColor} />
            ) : type === "framebag" ? (
              <Framebag fillColor={bgColor} />
            ) : null}
            <div className={styles.clickableOverlay}>
              <FaPencil
                size={40}
                style={{
                  cursor: "pointer",
                  zIndex: "15",
                }}
                onClick={() => {
                  setIsGearModalOpen(true);
                }}
                onTouchStartCapture={() => {
                  setIsGearModalOpen(true);
                }}
              />
            </div>
          </div>
        </Draggable>

        <ModularModal title="Edit Gear Container" bShow={isGearModalOpen}>
          <div
            style={{
              display: "flex",
              width: "600px",
              flexDirection: "row",
              gap: "16px",
            }}
          >
            <div id="gear-dropdown_left-pane" style={{ width: "40%" }}>
              <div
                style={{
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <a
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    alignSelf: "flex-start",
                  }}
                >
                  Contents
                </a>
                <div
                  style={{
                    margin: "0px",
                    padding: "0px",
                    width: "100%",
                    gap: "4px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {contents.length > 0 ? (
                    contents.map((item) => {
                      return (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "99%",
                            height: "48px",

                            alignItems: "center",
                            overflow: "hidden",
                            backgroundColor: "white",
                            border: "0.1rem solid #ccc",
                            borderRadius: "0.4rem",
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            cursor: "default",
                          }}
                        >
                          <div
                            style={{
                              paddingBlock: "10px",
                              display: "flex",
                              justifyContent: "space-around",
                              width: "100%",
                            }}
                          >
                            <div>{item}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <a style={{ fontSize: "16px" }}>This container is empty.</a>
                  )}
                </div>
              </div>
            </div>
            <div
              id="gear-dropdown_right-pane"
              style={{
                width: "60%",
                minHeight: "100%",
              }}
            >
              <div
                style={{
                  minHeight: "100%",
                  height: "100%",
                  width: "100%",
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",

                  borderRadius: "0.4rem",

                  position: "relative",
                }}
              >
                <a
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    alignSelf: "flex-start",
                  }}
                >
                  Available inventory
                </a>
                <div
                  style={{
                    margin: "0px",
                    padding: "0px",
                    width: "100%",
                    height: "fit-content",
                    maxHeight: "300px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {availableInventory.map((item) => (
                    <InventoryItem
                      key={item.id}
                      item={item}
                      selectedBike={selectedBike}
                      containerQuerying={id}
                    />
                  ))}
                </div>
                <button onClick={() => setShowAddItemModal(true)}>
                  Create item
                </button>
                <ModularModal
                  bShow={bShowAddItemModal}
                  title={"Add an item to your inventory"}
                >
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
                    placeholder={`Enter item weight (${"kg"})`}
                    step="any"
                  />
                  <input
                    type="number"
                    value={itemVolume}
                    onChange={(e) => setItemVolume(e.target.value)}
                    placeholder="Enter item volume (L)"
                    step="any"
                  />
                  <button
                    onClick={() => {
                      handleAddItemToInventory(
                        itemName,
                        itemWeight,
                        itemVolume
                      );
                      setShowAddItemModal(false);
                    }}
                  >
                    Submit
                  </button>
                </ModularModal>
              </div>
            </div>
          </div>
          {/* CustomSelect for colors */}
          <CustomSelect
            placeholder={"Select a color"}
            defaultSelection={getColorLabelByValue(bgColor)}
            options={colors}
            onSelect={firestore_ApplyColor}
          />
          <div
            style={{
              display: "flex",
              width: "100%",
              flexDirection: "column",
            }}
          >
            <button
              style={{ backgroundColor: "red" }}
              onClick={() => {
                setIsGearModalOpen(false);
                onDelete(id);
              }}
            >
              Delete
            </button>
            <button onClick={() => setIsGearModalOpen(false)}>Close</button>
          </div>
        </ModularModal>
      </>
    );
  }
};

export default GearDropdown;
