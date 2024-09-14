import { ReactComponent as SeatpackSVG } from "../../assets/images/seatpack.svg";
import styles from "../GearDropdown.module.css";

const Seatpack = ({ fillColor }) => {
  return <SeatpackSVG className={styles.bag} style={{ fill: fillColor }} />;
};

export default Seatpack;
