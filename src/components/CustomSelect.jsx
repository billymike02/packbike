import React, { useState } from "react";

// designed to work with key, value arrays
const CustomSelect = ({ options, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    // Return the `key` to the parent
    onSelect(option.value);
  };

  return (
    <div className="custom-select">
      <div className="select-box" onClick={toggleDropdown}>
        {selectedOption
          ? selectedOption.label
          : placeholder || "Select an option"}
      </div>
      {isOpen && (
        <ul className="select-options">
          {options.length > 0 ? (
            options.map((option) => (
              <li
                key={option.key}
                onClick={() => handleOptionClick(option)}
                className="option"
              >
                {option.label}
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
