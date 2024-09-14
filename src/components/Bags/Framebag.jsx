import { ReactComponent as FramebagSVG } from "../../assets/images/framebag.svg";
import styles from "../GearDropdown.module.css";

const Framebag = ({ fillColor }) => {
  return <FramebagSVG className={styles.bag} style={{ fill: fillColor }} />;
};

export default Framebag;
