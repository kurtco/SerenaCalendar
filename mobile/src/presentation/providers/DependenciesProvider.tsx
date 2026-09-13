import React, { ReactNode } from 'react';
import { DependenciesContext } from '../hooks/useDependencies';
import { AppDependencies } from '../../bootstrap';

export function DependenciesProvider({
  deps,
  children,
}: {
  deps: AppDependencies;
  children: ReactNode;
}): React.ReactElement {
  return (
    <DependenciesContext.Provider value={deps}>
      {children}
    </DependenciesContext.Provider>
  );
}
