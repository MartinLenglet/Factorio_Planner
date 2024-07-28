import React, { useState } from 'react';
import FactoryPanel from './FactoryPanel';
import './App.css';
import { saveAs } from 'file-saver';

const App = () => {
  const [factories, setFactories] = useState([]);

  const addFactory = () => {
    const newFactory = {
      id: Date.now().toString(),
      facilities: [],
      cumulativeOutputs: []
    };
    setFactories([...factories, newFactory]);
  };

  const updateFactory = (updatedFactory) => {
    if (updatedFactory === null) {
      // Remove factory
      setFactories(factories.filter(f => f.id !== updatedFactory.id));
    } else {
      // Update factory
      setFactories(factories.map(f => (f.id === updatedFactory.id ? updatedFactory : f)));
    }
  };

  const removeFactory = (id) => {
    setFactories(factories.filter(f => f.id !== id));
  };

  const moveFactoryUp = (index) => {
    if (index > 0) {
      const updatedFactories = [...factories];
      [updatedFactories[index - 1], updatedFactories[index]] = [updatedFactories[index], updatedFactories[index - 1]];
      setFactories(updatedFactories);
    }
  };

  const moveFactoryDown = (index) => {
    if (index < factories.length - 1) {
      const updatedFactories = [...factories];
      [updatedFactories[index], updatedFactories[index + 1]] = [updatedFactories[index + 1], updatedFactories[index]];
      setFactories(updatedFactories);
    }
  };

  // Export factories to a JSON file
  const exportFactories = () => {
    const blob = new Blob([JSON.stringify(factories, null, 2)], { type: 'application/json' });
    saveAs(blob, 'factorio_planner.json');
  };

  // Import factories from a JSON file
  const importFactories = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const importedFactories = JSON.parse(e.target.result);
        // Compute additional fields (e.g., efficiency, real outputs)
        const updatedFactories = importedFactories.map(factory => {
          return { ...factory, facilities: factory.facilities };
        });
        setFactories(updatedFactories);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <button onClick={exportFactories} className="action-button">Export Factories</button>
        {/* <button className="action-button">Import Factories</button> */}
        <input
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          id="import-factories"
          onChange={importFactories}
        />
        <label htmlFor="import-factories" className="action-button">Import Factories</label>
      </div>
      <div className="header">
        <button onClick={addFactory} className="action-button">+ New Factory</button>
      </div>
      <div className="factory-list">
        {factories.map((factory, index) => (
          <div key={factory.id} className="factory-panel-arrow">
            <div className="factory-actions">
              <button onClick={() => moveFactoryUp(index)} className="arrow-button">
                <img src="/images/up-arrow.svg" alt="Up" />
              </button>
              <button onClick={() => moveFactoryDown(index)} className="arrow-button">
                <img src="/images/down-arrow.svg" alt="Down" />
              </button>
            </div>
            <FactoryPanel
              factory={factory}
              onUpdate={updateFactory}
              onRemove={() => removeFactory(factory.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
