import styles from "./Sidebar.module.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../App";
import { firestore as db } from "./firebase";

const Sidebar = () => {
  const { user } = useAuth();
  const [bicycles, setBicycles] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState("20%"); // Initialize with a default value

  useEffect(() => {
    const fetchBicycles = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setBicycles(userData.bicycles || []); // Default to empty array if bicycles field doesn't exist
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

  const handleClick = (index) => {
    const newExpandedIndex = expandedIndex === index ? null : index;
    setExpandedIndex(newExpandedIndex);
    setSidebarWidth(newExpandedIndex !== null ? "40%" : "20%");
  };

  // Update the "Garage" item to include bicycles dynamically
  const items = [
    {
      title: "Garage",
      subItems: [
        ...bicycles.map((bicycle, index) => ({
          label: bicycle,
          link: `/bicycle/${index}`, // Adjust the link as needed
        })),
      ],
    },
    {
      title: "Inventory",
      subItems: [
        { label: "Sub 3", link: "/page2" },
        { label: "Sub 4", link: "/page3" },
      ],
    },
    {
      title: "Account",
      subItems: [
        { label: `About ${user?.displayName}`, link: "/Login" },
        { label: "Login", link: "/Login" },

        { label: "Sub 6", link: "/page3" },
      ],
    },
  ];

  const divStyle = {
    padding: "10px",
    backgroundColor: "rgb(255, 255, 255)",
    color: "black",
  };

  return (
    <nav className={styles.Sidebar} style={{ width: sidebarWidth }}>
      <h1>PackBike</h1>
      <div className={styles.menu}>
        <ul>
          {items.map((item, index) => (
            <li className={styles.cascadingMenu} key={index}>
              <div>
                <a
                  style={expandedIndex === index ? divStyle : {}}
                  onClick={() => handleClick(index)}
                >
                  {item.title}
                </a>
              </div>
            </li>
          ))}
        </ul>
        {expandedIndex !== null && (
          <div className={styles.submenu}>
            <ul>
              {items[expandedIndex].subItems.map((subItem, subIndex) => (
                <li key={subIndex}>
                  <Link to={subItem.link} className={styles.subitem}>
                    {subItem.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
