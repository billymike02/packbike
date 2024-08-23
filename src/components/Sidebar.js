import styles from "./Sidebar.module.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState("20%"); // Initialize with a default value

  const handleClick = (index) => {
    const newExpandedIndex = expandedIndex === index ? null : index;

    setExpandedIndex(newExpandedIndex);
    setSidebarWidth(newExpandedIndex !== null ? "40%" : "20%");
  };

  const items = [
    {
      title: "Garage",
      subItems: [
        { label: "Sub 1", link: "/page1" },
        { label: "Sub 2", link: "/page2" },
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
                  <Link to={subItem.link}>{subItem.label}</Link>
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
