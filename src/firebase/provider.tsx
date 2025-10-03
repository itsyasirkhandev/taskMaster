'use client';

import { ReactNode, createContext, useContext } from 'react';
import { Auth, getAuth } from 'firebase/auth';
import { app } from '@/firebase';

const FirebaseContext = createContext<{ auth: Auth } | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const auth = getAuth(app);
  return (
    <FirebaseContext.Provider value={{ auth }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
