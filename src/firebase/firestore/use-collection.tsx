'use client';
import { useEffect, useState, useRef } from 'react';
import {
  onSnapshot,
  query,
  Query,
  QuerySnapshot,
  collection,
  where,
  getDocs,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';

import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

const useEqualQuery = (q: Query | null) => {
  const queryRef = useRef<Query | null>(q);

  if (q && queryRef.current) {
    if (JSON.stringify(q) !== JSON.stringify(queryRef.current)) {
      queryRef.current = q;
    }
  } else {
    queryRef.current = q;
  }
  return queryRef.current;
};

export const useCollection = (q: Query | null) => {
  const [data, setData] = useState<QuerySnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();
  const query = useEqualQuery(q);

  useEffect(() => {
    if (!firestore || !query) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        setData(snapshot);
        setLoading(false);
      },
      (error: FirestoreError) => {
        setLoading(false);
        const permissionError = new FirestorePermissionError({
            path: (query as any)._query.path.segments.join('/'),
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [query, firestore]);

  return { data, loading };
};
