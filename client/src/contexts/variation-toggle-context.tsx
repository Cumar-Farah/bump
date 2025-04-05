import React, { createContext, useContext, useState } from 'react';

interface VariationToggleContextType {
  enabled: boolean;
  toggle: () => void;
  set: (value: boolean) => void;
}

const VariationToggleContext = createContext<VariationToggleContextType | undefined>(undefined);

export const VariationToggleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState(false);

  const toggle = () => setEnabled((prev) => !prev);
  const set = (value: boolean) => setEnabled(value);

  return (
    <VariationToggleContext.Provider value={{ enabled, toggle, set }}>
      {children}
    </VariationToggleContext.Provider>
  );
};

export const useVariationToggle = () => {
  const context = useContext(VariationToggleContext);
  if (!context) {
    throw new Error('useVariationToggle must be used within a VariationToggleProvider');
  }
  return context;
};