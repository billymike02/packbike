import { useState, useEffect, useRef } from "react";
import styles from "./ButtonSwitch.module.css";

const ButtonSwitch = ({
  leftOption = "A",
  rightOption = "B",
  transition = 0.1,
  onChange,
  defaultSelection,
}) => {
  const buttonStyle = {
    fontSize: "2rem",
    zIndex: "2",
    transition: `color ${transition}s`,
    paddingInline: "20px", // Optional: add padding to the button to make spacing consistent
    userSelect: "none",
    WebkitUserSelect: "none",
    textTransform: "uppercase",
  };

  // Sync internal state with prop changes
  useEffect(() => {
    setSelectedOption(defaultSelection == leftOption ? "left" : "right");
  }, [defaultSelection]);

  // Refs to store button elements
  const leftButtonRef = useRef(null);
  const rightButtonRef = useRef(null);

  const [selectedOption, setSelectedOption] = useState(null);
  const [markerStyle, setMarkerStyle] = useState({
    width: "50%",
    left: "0%",
  });

  // Adjust marker size and position based on the selected button
  useEffect(() => {
    const leftButtonWidth = leftButtonRef.current?.offsetWidth || 0;
    const rightButtonWidth = rightButtonRef.current?.offsetWidth || 0;

    if (selectedOption === "left") {
      setMarkerStyle({
        width: `${leftButtonWidth + 10}px`,
        left: "0%",
      });
    } else {
      setMarkerStyle({
        width: `${rightButtonWidth + 10}px`,
        left: `${leftButtonWidth}px`, // This will correctly position the slider to the right button
      });
    }
  }, [selectedOption, leftOption, rightOption]);

  const handleToggle = () => {
    const newSelection = selectedOption === "left" ? "right" : "left";
    setSelectedOption(newSelection);
    if (onChange) {
      onChange(newSelection == "left" ? leftOption : rightOption);
    }
  };

  return (
    <div
      id="switch"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px",
        backgroundColor: "#f0f0f0",
        borderRadius: "25px",
        cursor: "pointer",
      }}
      onClick={handleToggle}
      className={styles.switch}
    >
      <div
        id="left-button"
        ref={leftButtonRef}
        style={{
          ...buttonStyle,
          color: selectedOption === "left" ? "white" : "black",
        }}
      >
        {leftOption}
      </div>
      <div
        id="right-button"
        ref={rightButtonRef}
        style={{
          ...buttonStyle,
          color: selectedOption === "right" ? "white" : "black",
        }}
      >
        {rightOption}
      </div>
      <div
        id="marker"
        style={{
          backgroundColor: "black",
          height: "100%",
          position: "absolute",
          borderRadius: "25px",
          transition: `left ${transition}s, width ${transition}s`,
          visibility: selectedOption == null ? "hidden" : "visible",
          ...markerStyle,
        }}
      />
    </div>
  );
};

export default ButtonSwitch;
