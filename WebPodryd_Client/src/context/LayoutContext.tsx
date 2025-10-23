// src/context/LayoutContext.tsx
import { createContext, useContext, useState } from 'react';

interface LayoutContextType {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const LayoutContext = createContext<LayoutContextType>({
  collapsed: false,
  toggleCollapse: () => {},
});

export const useLayoutContext = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('navbarCollapsed');
    return saved === 'true';
  });

  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('navbarCollapsed', String(newState));
  };

  return (
    <LayoutContext.Provider value={{ collapsed, toggleCollapse }}>
      {children}
    </LayoutContext.Provider>
  );
};