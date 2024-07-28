// import React, { useCallback } from 'react';
import React from 'react';
import FacilityComponent from './FacilityComponent';
import './FactoryComponent.css';
import configRecipes from './configuration_recipes.json';

const FactoryComponent = ({ factory, onUpdate }) => {

  // ADD, DELETE, AND MODIFY FACILITIES
  const addFacility = () => {
    const newFacility = { id: Date.now().toString(), facilityType: '', number: 0, setting: 100, input: [], output: [], efficiency: 0, realInput: [], realOutput: [] };
    const updatedFactory = { ...factory, facilities: [...factory.facilities, newFacility] };
    onUpdate(updatedFactory);
  };

  // const updateFacility = (updatedFacility) => {
  //   const updatedFacilities = factory.facilities.map(facility => (
  //       facility.id === updatedFacility.id ? updatedFacility : facility
  //   ));
  //   const updatedFactory = { ...factory, facilities: updatedFacilities };
  //   onUpdate(updatedFactory);
  // };

  const removeFacility = (id) => {
    const updatedFacilities = factory.facilities.filter(facility => facility.id !== id);
    
    const updatedFacilitiesWithEfficiency = updateFacilitiesWithEfficiency(updatedFacilities, configRecipes);
    onUpdate({ ...factory, facilities: updatedFacilitiesWithEfficiency });
  };




  // MOVE FACILITIES UP AND DOWN
  const moveFacilityUp = (index) => {
    if (index === 0) return;
    const facilities = [...factory.facilities];
    [facilities[index], facilities[index - 1]] = [facilities[index - 1], facilities[index]];
    
    const updatedFacilitiesWithEfficiency = updateFacilitiesWithEfficiency(facilities, configRecipes);
    onUpdate({ ...factory, facilities: updatedFacilitiesWithEfficiency });
  };

  const moveFacilityDown = (index) => {
    if (index === factory.facilities.length - 1) return;
    const facilities = [...factory.facilities];
    [facilities[index], facilities[index + 1]] = [facilities[index + 1], facilities[index]];
    
    const updatedFacilitiesWithEfficiency = updateFacilitiesWithEfficiency(facilities, configRecipes);
    onUpdate({ ...factory, facilities: updatedFacilitiesWithEfficiency });
  };




  // HANDLE FIELDS UPDATES
  const handleFieldChange = (id, field, value) => {
    const updatedFacilities = factory.facilities.map(facility =>
      facility.id === id ? { ...facility, [field]: value } : facility
    );

    const updatedFacilitiesWithEfficiency = updateFacilitiesWithEfficiency(updatedFacilities, configRecipes);
    onUpdate({ ...factory, facilities: updatedFacilitiesWithEfficiency });
  };

  const computeInput = (facility, recipes) => {
    if (!facility.facilityType || !recipes) return [];

    const recipe = recipes.find(r => r.name === facility.facilityType);
    if (!recipe) return [];

    const { ingredients, effective_time } = recipe;
    const flow = ingredients.map(ingredient => {
        return {
            name: ingredient.name,
            flow: (ingredient.amount / effective_time) * facility.number * (facility.setting / 100)
        };
    });
    
    return flow
  };

  const computeOutput = (facility, recipes) => {
    if (!facility.facilityType || !recipes) return [];

    const recipe = recipes.find(r => r.name === facility.facilityType);
    if (!recipe) return [];

    const { result, effective_time } = recipe;
    const flow = result.map(output => {
        return {
            name: output.name,
            flow: (output.amount / effective_time) * facility.number * (facility.setting / 100)
        };
    });
    
    return flow
  };

  const computeEfficiency = (facility, cumulativeOutputs) => {
    if (!facility.input || facility.input.length === 0) return 100;
    if (facility.number === 0) return 0;

    let minEfficiency = 100;
    facility.input.forEach((input, i) => {
      const cumulativeOutput = !cumulativeOutputs.length ? {flow: 0} : cumulativeOutputs.find(output => output.name === input.name)
      const efficiency = cumulativeOutput ? (cumulativeOutput.flow / input.flow) * 100 : 0;
      minEfficiency = Math.min(minEfficiency, efficiency);
    });

    return minEfficiency;
  };

  const computeRealInput = (facility, efficiency) => {
    if (!facility.input || facility.input.length === 0) return [];

    return facility.input.map(input => ({
      ...input,
      flow: input.flow * (efficiency / 100)
    }));
  };

  const computeRealOutput = (facility, efficiency) => {
    if (!facility.output || facility.output.length === 0) return [];
  
    const updatedOutputs = [];
  
    for (let i = 0; i < facility.output.length; i++) {
      const productOutput = facility.output[i];
      const originalFlow = productOutput.flow;
      const updatedFlow = originalFlow * (efficiency / 100);
  
      // console.log(`Product: ${productOutput.name}, Original Flow: ${originalFlow}, Efficiency: ${efficiency}%, Updated Flow: ${updatedFlow}`);
  
      const updatedOutput = {
        ...productOutput,
        flow: updatedFlow
      };
  
      // Log the updated output
      // console.log('Updated Output:', updatedOutput);
  
      updatedOutputs.push(updatedOutput);
  
      // Log the state of updatedOutputs after each push
      // console.log('Current updatedOutputs:', JSON.stringify(updatedOutputs, null, 2));
    }
  
    // console.log('Final updatedOutputs:', JSON.stringify(updatedOutputs, null, 2));
    // console.log(updatedOutputs)
    return updatedOutputs;
  };

  const updateFacilitiesWithEfficiency = (facilities, recipes) => {
    const updatedFacilities = [...facilities];
    let cumulativeOutputs = [];

    updatedFacilities.forEach(facility => {
      const input = computeInput(facility, recipes);
      facility.input = input;

      const output = computeOutput(facility, recipes);
      facility.output = output;

      const efficiency = computeEfficiency(facility, cumulativeOutputs);
      facility.efficiency = efficiency;

      const realInput = computeRealInput(facility, efficiency);
      facility.realInput = realInput;

      const realOutput = computeRealOutput(facility, efficiency);
      facility.realOutput = realOutput;

      // Subtract real used inputs from the cumulative outputs
      cumulativeOutputs = addRealOutputsToCumulativeOutputs(cumulativeOutputs, realOutput);
      cumulativeOutputs = subtractRealInputsFromCumulativeOutputs(cumulativeOutputs, realInput);
    });

    factory.cumulativeOutput = cumulativeOutputs

    return updatedFacilities;
  };

  const subtractRealInputsFromCumulativeOutputs = (cumulativeOutputs, realInputs) => {
    const updatedCumulativeOutputs = [...cumulativeOutputs];
  
    realInputs.forEach(input => {
      const index = updatedCumulativeOutputs.findIndex(output => output.name === input.name);
      if (index !== -1) {
        // updatedCumulativeOutputs[index].flow -= input.flow;
        updatedCumulativeOutputs[index] = {
            ...updatedCumulativeOutputs[index],
            flow: updatedCumulativeOutputs[index].flow - input.flow
        };
        if (updatedCumulativeOutputs[index].flow <= 0) {
          updatedCumulativeOutputs.splice(index, 1);
        }
      }
    });
  
    return updatedCumulativeOutputs;
  };

  const addRealOutputsToCumulativeOutputs = (cumulativeOutputs, realOutputs) => {
    const updatedCumulativeOutputs = [...cumulativeOutputs];

    realOutputs.forEach(output => {
      const index = updatedCumulativeOutputs.findIndex(cumOutput => cumOutput.name === output.name);
      if (index !== -1) {
        // updatedCumulativeOutputs[index].flow += output.flow;
        updatedCumulativeOutputs[index] = {
          ...updatedCumulativeOutputs[index],
          flow: updatedCumulativeOutputs[index].flow + output.flow
      };
      } else {
        updatedCumulativeOutputs.push(output);
      }

    });

    return updatedCumulativeOutputs;
  };





  return (
    <div className="factory-component">
      <div className="factory-header">
      </div>
      <button onClick={addFacility} className="action-button">+ Add Facility</button>
      <table className="factory-table">
        <thead>
            <tr>
              <th>Order</th>
              <th>Facility</th>
              <th>Number</th>
              <th>Setting (%)</th>
              <th>Expected Inputs</th>
              <th>Expected Outputs</th>
              <th>Efficiency (%)</th>
              <th>Real Inputs</th>
              <th>Real Outputs</th>
              <th>Delete</th>
            </tr>
        </thead>
        <tbody>
          {factory.facilities.map((facility, index) => (
            <tr className="facility-line" key={facility.id}>

              <td>
                <button onClick={() => moveFacilityUp(index)} className="arrow-button">
                  <img src={`${process.env.PUBLIC_URL}/images/up-arrow.svg`} alt="Up" />
                </button>
                <button onClick={() => moveFacilityDown(index)} className="arrow-button">
                <img src={`${process.env.PUBLIC_URL}/images/down-arrow.svg`} alt="Down" />
                </button>
              </td>

              <FacilityComponent 
                facility={facility}
                configRecipes={configRecipes}
                onFieldChange={handleFieldChange}
              />
              
              <td>
                <input
                    type="number"
                    placeholder="Number"
                    value={facility.number}
                    onChange={(e) => handleFieldChange(facility.id, 'number', parseInt(e.target.value))}
                    style={{ 
                      height: '35px', // match the height of the select input
                      width: '70px', // restrict the width to display up to 4 figures
                      fontSize: '12px' // match the font size of the select input
                    }}
                />
              </td>

              <td>
                <input
                    type="number"
                    placeholder="Setting"
                    value={facility.setting}
                    onChange={(e) => handleFieldChange(facility.id, 'setting', parseInt(e.target.value))}
                    style={{ 
                        height: '35px', // match the height of the select input
                        width: '60px', // restrict the width to display up to 4 figures
                        fontSize: '12px' // match the font size of the select input
                    }}
                />
              </td>

              <td>
                  <ul className='list-inputs'>
                      {facility.input && facility.input.map((input, index) => (
                          <li key={index}>{`${input.name}: ${input.flow.toFixed(2)}`}</li>
                      ))}
                  </ul>
              </td>

              <td>
                  <ul className='list-inputs'>
                      {facility.output && facility.output.map((output, index) => (
                          <li key={index}>{`${output.name}: ${output.flow.toFixed(2)}`}</li>
                      ))}
                  </ul>
              </td>

              <td>
                  {facility.efficiency.toFixed(2)}
              </td>

              <td>
                  <ul className='list-inputs'>
                      {facility.realInput && facility.realInput.map((input, index) => (
                          <li key={index}>{`${input.name}: ${input.flow.toFixed(2)}`}</li>
                      ))}
                  </ul>
              </td>

              <td>
                  <ul className='list-inputs'>
                      {facility.realOutput && facility.realOutput.map((output, index) => (
                          <li key={index}>{`${output.name}: ${output.flow.toFixed(2)}`}</li>
                      ))}
                  </ul>
              </td>

              <td>
                <button onClick={() => removeFacility(facility.id)} className="remove-facility-button">×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FactoryComponent;
