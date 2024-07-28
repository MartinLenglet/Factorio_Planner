import React from 'react';
import FactoryComponent from './FactoryComponent';
import OutputComponent from './OutputComponent';
import './FactoryPanel.css';

const FactoryPanel = ({ factory, onRemove, onUpdate }) => {
  return (
    <div className="factory-panel">
      <button onClick={onRemove} className="remove-button">×</button>
      <FactoryComponent factory={factory} onUpdate={onUpdate} />
      <OutputComponent factory={factory} />
    </div>
  );
};

export default FactoryPanel;
