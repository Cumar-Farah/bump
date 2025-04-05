import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the types of outputs we'll be managing
export type OutputType = 'chart' | 'table' | 'text' | 'stats';

// Define what a result object looks like
export interface OutputResult {
  technique: string;
  target?: string;
  outputType: OutputType;
  data: any;
  chart?: {
    title?: string;
    description?: string;
    type?: string;
  };
}

// Define the structure of our output map
interface OutputMap {
  chart: OutputResult[];
  table: OutputResult[];
  text: OutputResult[];
  stats: OutputResult[];
}

// Define the context value shape
interface OutputContextValue {
  outputMap: OutputMap;
  addOutput: (result: OutputResult) => void;
  clearOutputs: () => void;
  clearOutputsByType: (type: OutputType) => void;
  clearOutputsByTechnique: (technique: string) => void;
}

// Create the context
const OutputContext = createContext<OutputContextValue | undefined>(undefined);

// Create a provider component
export function OutputProvider({ children }: { children: ReactNode }) {
  // Initialize the state with empty arrays for each output type
  const [outputMap, setOutputMap] = useState<OutputMap>({
    chart: [],
    table: [],
    text: [],
    stats: [],
  });

  // Add a new output to the appropriate type array
  const addOutput = (result: OutputResult) => {
    console.log("Adding output:", result);
    setOutputMap(prev => {
      // Create a copy of the current state
      const newMap = { ...prev };
      
      // Add the new result to the appropriate type array
      newMap[result.outputType] = [...prev[result.outputType], result];
      
      return newMap;
    });
  };

  // Clear all outputs
  const clearOutputs = () => {
    setOutputMap({
      chart: [],
      table: [],
      text: [],
      stats: [],
    });
  };

  // Clear outputs of a specific type
  const clearOutputsByType = (type: OutputType) => {
    setOutputMap(prev => ({ ...prev, [type]: [] }));
  };

  // Clear outputs from a specific technique
  const clearOutputsByTechnique = (technique: string) => {
    setOutputMap(prev => {
      const newMap = { ...prev };
      
      // For each output type, filter out results from the specified technique
      Object.keys(newMap).forEach(key => {
        const outputType = key as OutputType;
        newMap[outputType] = prev[outputType].filter(
          result => result.technique !== technique
        );
      });
      
      return newMap;
    });
  };

  return (
    <OutputContext.Provider
      value={{
        outputMap,
        addOutput,
        clearOutputs,
        clearOutputsByType,
        clearOutputsByTechnique,
      }}
    >
      {children}
    </OutputContext.Provider>
  );
}

// Create a custom hook to use the context
export function useOutputMap() {
  const context = useContext(OutputContext);
  if (context === undefined) {
    throw new Error('useOutputMap must be used within an OutputProvider');
  }
  return context;
}