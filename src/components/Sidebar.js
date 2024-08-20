import styles from "./Sidebar.module.css";

const Sidebar = () => {
  return (
    <nav className={styles.Sidebar}>
      <h1>Packbike</h1>
      <ul>
        <li>
          <a>Garage</a>
        </li>
        <li>
          <a>Inventory</a>
        </li>
        <li>
          <a>Account</a>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
