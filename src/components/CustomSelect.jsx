import React, { useState } from "react";

const CustomSelect = ({ options, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    // Check if option has a 'value' property (for objects) or use the option itself (for strings)
    onSelect(option.value !== undefined ? option.value : option);
  };

  // Determine if options are objects or strings
  const isObjectOptions =
    options.length > 0 && typeof options[0] === "object" && options[0] !== null;

  return (
    <div className="custom-select">
      <div className="select-box" onClick={toggleDropdown}>
        {selectedOption
          ? isObjectOptions
            ? selectedOption.label
            : selectedOption
          : placeholder || "Select an option"}
      </div>
      {isOpen && (
        <ul className="select-options">
          {options.length > 0 ? (
            options.map((option, index) => (
              <li
                key={isObjectOptions ? option.value : index}
                onClick={() => handleOptionClick(option)}
                className="option"
              >
                {isObjectOptions ? option.label : option}
              </li>
            ))
          ) : (
            <li>No available options.</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
