import { ReactComponent as RollSVG } from "../../assets/images/roll.svg";
import styles from "../GearDropdown.module.css";

const Roll = ({ fillColor }) => {
  return <RollSVG className={styles.bag} style={{ fill: fillColor }} />;
};

export default Roll;
