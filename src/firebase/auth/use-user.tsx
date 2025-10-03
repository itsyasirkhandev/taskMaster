'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useFirebase } from '../provider';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export const useUser = () => {
  const { auth } = useFirebase();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user && firestore) {
        const userRef = doc(firestore, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          } else {
              const newUserProfile: UserProfile = {
                  uid: user.uid,
                  email: user.email!,
                  displayName: user.displayName,
                  photoURL: user.photoURL,
              };
              setDoc(userRef, newUserProfile).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                  path: userRef.path,
                  operation: 'create',
                  requestResourceData: newUserProfile,
                });
                errorEmitter.emit('permission-error', permissionError);
              });
              setUserProfile(newUserProfile);
          }
        } catch (error) {
            const permissionError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, userProfile, loading };
};
