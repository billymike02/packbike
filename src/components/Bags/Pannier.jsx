import { ReactComponent as PannierSVG } from "../../assets/images/pannier.svg";
import styles from "../GearDropdown.module.css";

const Pannier = ({ fillColor }) => {
  return <PannierSVG className={styles.bag} style={{ fill: fillColor }} />;
};

export default Pannier;
