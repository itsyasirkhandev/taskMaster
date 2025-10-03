'use client';
import { useMemo, type ReactNode } from 'react';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// This initializes Firebase on the client side
if (typeof window !== 'undefined' && !getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const services = useMemo(() => {
    // This will only be run once
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
      auth = getAuth(firebaseApp);
      firestore = getFirestore(firebaseApp);
    }
    return { firebaseApp, auth, firestore };
  }, []);

  return <FirebaseProvider {...services}>{children}</FirebaseProvider>;
}
