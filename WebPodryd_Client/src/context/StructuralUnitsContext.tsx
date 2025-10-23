//src/context/StructuralUnitsContext.tsx

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface StructuralUnit {
  id: string;
  name: string;
  code?: string;
}

interface StructuralUnitsContextType {
  structuralUnits: StructuralUnit[];
  isLoading: boolean;
}

const StructuralUnitsContext = createContext<StructuralUnitsContextType | undefined>(undefined);

export const StructuralUnitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const structuralUnits = useMemo(() => {
    if (!user?.departments || user.departments.length === 0) {
      return [];
    }

    return user.departments.map(dept => ({
      id: dept.id || dept.code || dept.name,
      name: dept.name,
      code: dept.code
    }));
  }, [user?.departments]);

  const isLoading = false;

  return (
    <StructuralUnitsContext.Provider value={{ structuralUnits, isLoading }}>
      {children}
    </StructuralUnitsContext.Provider>
  );
};

export const useStructuralUnits = () => {
  const context = useContext(StructuralUnitsContext);
  if (context === undefined) {
    throw new Error('useStructuralUnits must be used within a StructuralUnitsProvider');
  }
  return context;
};