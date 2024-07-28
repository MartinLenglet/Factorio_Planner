// import React, { useEffect, useState } from 'react';
import React from 'react';
import Select from 'react-select';
import './FacilityComponent.css';

const FacilityComponent = ({ facility, onFieldChange, configRecipes }) => {
// const FacilityComponent = ({ facility, onUpdate, configRecipes, onFieldChange }) => {
  // const [facilityType, setFacilityType] = useState(facility.type);
  // const [fields, setFields] = useState(facility.fields);

  // useEffect(() => {
  //   if (
  //     facility.type !== facilityType ||
  //     JSON.stringify(facility.fields) !== JSON.stringify(fields)
  //   ) {
  //     onUpdate({ ...facility, type: facilityType, fields });
  //   }
  // }, [facilityType, fields, facility, onUpdate]);

  // const handleFieldChange = (field, value) => {
  //   setFields({ ...fields, [field]: value });
  // };

  // const [selectedOption, setSelectedOption] = useState(null);

  // Transform configRecipes into the format expected by react-select
  const options = configRecipes.map(recipe => ({
      value: recipe.name,
      label: recipe.pretty_name
  }));

  // const handleChange = (selectedOption) => {
  //     setSelectedOption(selectedOption);
  // };
  const handleChange = selectedOption => {
      onFieldChange(facility.id, 'facilityType', selectedOption ? selectedOption.value : '');
  };

  // Custom styles for react-select component
  const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        minWidth: '300px', // minimum width for the input
        maxWidth: '100%', // maximum width for the input (adjust as needed)
        whiteSpace: 'nowrap', // prevent input from wrapping
        fontSize: '12px',
        height: '40px', // set the height to be consistent
    }),
    input: (provided, state) => ({
        ...provided,
        width: 'auto', // input width adjusts based on content
        flex: '1 1 auto', // flex property to maintain input within container
        fontSize: '12px',
    }),
    menu: (provided, state) => ({
        ...provided,
        minWidth: '300px', // width for the dropdown menu
        fontSize: '12px',
    }),
    option: (provided, state) => ({
        ...provided,
        fontSize: '12px',
    }),
    singleValue: (provided, state) => ({
        ...provided,
        fontSize: '12px',
    }),
  };

  return (
    <td>
      <Select
          // value={selectedOption}
          value={options.find(option => option.value === facility.facilityType)}
          onChange={handleChange}
          options={options}
          placeholder="Select Facility"
          isClearable
          styles={customSelectStyles}
      />
    </td>
  );
};

export default FacilityComponent;
