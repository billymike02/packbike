import {
  IoIosArrowRoundDown,
  IoIosArrowRoundUp,
  IoIosArrowRoundBack,
  IoIosArrowRoundForward,
} from "react-icons/io";

const iconMap = {
  down: IoIosArrowRoundDown,
  up: IoIosArrowRoundUp,
  right: IoIosArrowRoundForward,
  left: IoIosArrowRoundBack,
};

const DynamicArrow = ({ direction, size = 50 }) => {
  const IconComponent = iconMap[direction] || IoIosArrowRoundDown; // Default to down if direction is not found

  return <IconComponent size={size} />;
};

const PageNavButton = ({
  note = "Continue",
  direction = "down",
  flexDirection = "column",
  onClick,
  visible = true,
  inset,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        textTransform: "uppercase",
        position: "absolute",
        inset: inset,
        height: "min-content",
        opacity: visible ? "0.7" : "0",
        flexDirection: flexDirection,
        fontSize: "2rem",
        cursor: "pointer",
        transition: "opacity 0.3s",
      }}
      onClick={onClick}
    >
      {note}
      <DynamicArrow direction={direction} />
    </div>
  );
};

export default PageNavButton;
