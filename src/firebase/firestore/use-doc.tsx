'use client';
import { useEffect, useState, useRef } from 'react';
import {
  onSnapshot,
  doc,
  DocumentReference,
  DocumentSnapshot,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';

import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

const useEqualDocRef = (ref: DocumentReference | null) => {
    const refRef = useRef<DocumentReference | null>(ref);
  
    if (ref && refRef.current) {
      if (ref.path !== refRef.current.path) {
        refRef.current = ref;
      }
    } else {
      refRef.current = ref;
    }
    return refRef.current;
  };

export const useDoc = (ref: DocumentReference | null) => {
  const [data, setData] = useState<DocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();
  const docRef = useEqualDocRef(ref);

  useEffect(() => {
    if (!firestore || !docRef) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setData(snapshot);
        setLoading(false);
      },
      (error: FirestoreError) => {
        setLoading(false);
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [docRef, firestore]);

  return { data, loading };
};
