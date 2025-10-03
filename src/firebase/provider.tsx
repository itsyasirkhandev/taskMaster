'use client';

import { ReactNode, createContext, useContext } from 'react';
import { Auth } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextType {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  firebaseApp: null,
  auth: null,
  firestore: null,
});

export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
}: {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}) {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore }}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context || !context.firebaseApp) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return {
    firebaseApp: context.firebaseApp,
    auth: context.auth!,
    firestore: context.firestore!,
  };
};

export const useFirebaseApp = () => {
  const context = useContext(FirebaseContext);
  if (!context || !context.firebaseApp) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.firebaseApp;
}

export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (!context || !context.auth) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context.auth;
}

export const useFirestore = () => {
    const context = useContext(FirebaseContext);
    if (!context || !context.firestore) {
      throw new Error('useFirestore must be used within a FirebaseProvider');
    }
    return context.firestore;
}
