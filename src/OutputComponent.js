import React from 'react';
import './OutputComponent.css';

const OutputComponent = ({ factory }) => {

  return (
    <div className="output-component">
      <h3 className='title-outputs'>Final Outputs</h3>
      <ul className='list-outputs'>
          {factory.cumulativeOutput && factory.cumulativeOutput.map((output, index) => (
              <li key={index}>{`${output.name}: ${output.flow.toFixed(2)}`}</li>
          ))}
      </ul>
    </div>
  );
};

export default OutputComponent;
