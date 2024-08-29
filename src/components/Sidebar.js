import styles from "./Sidebar.module.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../App";
import { firestore as db } from "./firebase";
import { BsBicycle } from "react-icons/bs";
import { PiShoppingBagOpenFill } from "react-icons/pi";
import { RiAccountCircleFill } from "react-icons/ri";
import Modal from "./ModalComponent";

const Sidebar = ({ setBicycleSelection }) => {
  const { user } = useAuth();
  const [bicycles, setBicycles] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const fetchBicycles = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setBicycles(Object.keys(userData.bicycles) || []); // Default to empty array if bicycles field doesn't exist
            console.log(userData.bicycles);
            // bikesToMenu(userData.bicycles);
          } else {
            console.log("User document does not exist");
          }
        } catch (error) {
          console.error("Error fetching bicycles: ", error);
        }
      } else {
        console.log("User not authenticated");
      }
    };

    fetchBicycles();
  }, [user]);


  // Update the "Garage" item to include bicycles dynamically
  const items = [
    {
      title: "Garage",
      subItems: [
        ...bicycles.map((bicycle) => ({
          label: bicycle,
          link: `/workspace`, // Adjust the link as needed
        })),
        { label: "Add +", link: "/workspace" },
      ],
      icon: <BsBicycle />,
    },
    {
      title: "Inventory",
      subItems: [
        { label: "Manage gear", link: "/gear-manager" },
        { label: "Sub 4", link: "/page3" },
      ],
      icon: <PiShoppingBagOpenFill></PiShoppingBagOpenFill>,
    },
    {
      title: "Account",
      subItems: [
        { label: `About ${user?.displayName}`, link: "/Profile" },
        { label: "Login", link: "/Login" },
      ],
      icon: <RiAccountCircleFill></RiAccountCircleFill>,
    },
  ];

  const handleMenuIconClick = (index) => {
    // handle those edge cases
    if (expandedIndex == index) {
      setExpandedIndex(null);
      setSidebarExpanded(false);

      return;
    } else if (sidebarExpanded && expandedIndex != index) {
      setExpandedIndex(index);
      return;
    }

    setSidebarExpanded(!sidebarExpanded);

    setExpandedIndex(index);
  };

  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className={styles.Sidebar}>
      <div className={styles.Menu}>
        {items.map((item, index) => (
          <div
            className={styles.menuIcon}
            onClick={() => {
              handleMenuIconClick(index);
            }}
          >
            {item.icon}
          </div>
        ))}
      </div>

      <div
        className={styles.Submenu}
        style={{
          width: sidebarExpanded ? "15vw" : "0vw",
          marginLeft: sidebarExpanded ? "30px" : "0px",
        }}
      >
        {expandedIndex !== null &&
          sidebarExpanded &&
          items[expandedIndex].subItems.map((item, index) => (
            <Link
              to={`${item.link}`}
              className={styles.submenuItem}
              onClick={() => {
                if (items[expandedIndex].title == "Garage") {
                  setBicycleSelection(item.label);
                }

                setSidebarExpanded(false);
              }}
            >
              {item.label}
            </Link>
          ))}
      </div>
    </div>
  );
};

export default Sidebar;
