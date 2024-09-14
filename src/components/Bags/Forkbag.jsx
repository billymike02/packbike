import { ReactComponent as ForkbagSVG } from "../../assets/images/forkbag.svg";
import styles from "../GearDropdown.module.css";

const Forkbag = ({ fillColor }) => {
  return <ForkbagSVG className={styles.bag} style={{ fill: fillColor }} />;
};

export default Forkbag;
