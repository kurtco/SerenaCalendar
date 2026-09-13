import { createContext, useContext } from 'react';
import { AppDependencies } from '../../bootstrap';

export const DependenciesContext = createContext<AppDependencies | null>(null);

export function useDependencies(): AppDependencies {
  const deps = useContext(DependenciesContext);
  if (!deps) {
    throw new Error(
      'useDependencies must be used within a DependenciesProvider'
    );
  }
  return deps;
}
