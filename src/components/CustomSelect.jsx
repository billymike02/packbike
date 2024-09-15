import React, { useState, useEffect } from "react";

// designed to work with key, value arrays
const CustomSelect = ({
  options,
  onSelect,
  placeholderText = "Select an option", // default value for placeholder
  defaultSelection = null, // default to null if no selection is passed
  expanded = false,
  emptyMessage = "No available options.",
}) => {
  const [isOpen, setIsOpen] = useState(expanded);
  const [selectedOption, setSelectedOption] = useState(defaultSelection);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (defaultSelection == null) {
      setSelectedOption(null);
    } else if (defaultSelection != null) {
      setSelectedOption(defaultSelection);
    }
  }, [defaultSelection]);

  const handleOptionClick = (option) => {
    setSelectedOption(option.label);
    setIsOpen(false);
    // Return the `value` to the parent
    onSelect(option ? option.value : null);
  };

  return (
    <div className="custom-select">
      <div className="select-box" onClick={toggleDropdown}>
        {selectedOption ? selectedOption : placeholderText}
      </div>
      {isOpen && (
        <ul className="select-options">
          {options.length > 0 ? (
            options.map((option, index) => (
              <li
                key={option.key || option.id || option.value || index} // Ensure a unique key
                onClick={() => handleOptionClick(option)}
                className="option"
              >
                {option.label}
              </li>
            ))
          ) : (
            <li>{emptyMessage}</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
