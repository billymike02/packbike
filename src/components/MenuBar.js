import styles from "./MenuBar.module.css";
import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../App";
import { firestore as db } from "./firebase";
import { BsBicycle } from "react-icons/bs";
import { PiShoppingBagOpenFill } from "react-icons/pi";
import { RiAccountCircleFill } from "react-icons/ri";
import Modal from "./ModalComponent";
import { IoArrowBack } from "react-icons/io5";

const MenuBar = ({ setBicycleSelection }) => {
  const { user } = useAuth();

  const navigator = useNavigate();
  const [accountDropdownExpanded, setAccountDropdownExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Update the "Garage" item to include bicycles dynamically
  const items = [
    {
      title: "Garage",
      icon: <BsBicycle />,
    },
    {
      title: "Gear",
      icon: <PiShoppingBagOpenFill></PiShoppingBagOpenFill>,
    },
    {
      title: "Account",
      subItems: [
        // { label: `About ${user?.displayName}`, link: "/Profile" },
        user
          ? { label: "Logout", link: "/Logout" }
          : { label: "Login", link: "/Login" },
      ],
      icon: <RiAccountCircleFill></RiAccountCircleFill>,
    },
  ];

  return (
    <div className={styles.MenuBar}>
      <h2 style={{ cursor: "default" }}>Packbike</h2>
      {true && (
        <>
          <div className={styles.Menu}>
            <div
              className={styles.menuItem}
              onClick={() => {
                navigator("/workspace");
              }}
            >
              <div className={styles.menuIcon}>
                <BsBicycle></BsBicycle>
              </div>
              <div className={styles.menuLabel}>Garage</div>
            </div>
            <div
              className={styles.menuItem}
              onClick={() => {
                navigator("/gear-manager");
              }}
            >
              <div className={styles.menuIcon}>
                <PiShoppingBagOpenFill></PiShoppingBagOpenFill>
              </div>
              <div className={styles.menuLabel}>Gear</div>
            </div>
          </div>
          <div className={styles.MenuRight}>
            <div
              className={styles.menuItem}
              onClick={() => {
                navigator("profile");
              }}
            >
              <div className={styles.menuLabel}>Account</div>
              <div className={styles.menuIcon}>
                <RiAccountCircleFill></RiAccountCircleFill>
              </div>
            </div>
            {accountDropdownExpanded && (
              <ul
                className="select-options"
                style={{ width: "200px", marginTop: "24%" }}
              >
                <li>Hey</li>
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MenuBar;
