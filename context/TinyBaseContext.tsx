import React, { createContext, useContext, ReactNode } from 'react';
import { Provider } from 'tinybase/ui-react';
import { getStore, initDatabase } from '@/services/database';
import { type Store } from 'tinybase';

interface TinyBaseContextType {
  store: Store;
}

const TinyBaseContext = createContext<TinyBaseContextType | undefined>(undefined);

export function TinyBaseProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = React.useState<Store | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    const initialize = async () => {
      await initDatabase();
      const initializedStore = getStore();
      setStore(initializedStore);
      setIsInitialized(true);
    };
    initialize();
  }, []);

  if (!isInitialized || !store) {
    return null; // Or a loading spinner
  }

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}

export function useTinyBaseStore(): Store {
  const context = useContext(TinyBaseContext);
  if (!context) {
    // Fallback to getting store directly if context not available
    return getStore();
  }
  return context.store;
}
