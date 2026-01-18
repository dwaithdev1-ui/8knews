import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, QueryConstraint, type DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UseCollectionResult {
  data: DocumentData[];
  loading: boolean;
  error: string | null;
}

export const useCollection = (collectionName: string, _queryConstraints: QueryConstraint[] = []): UseCollectionResult => {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const collectionRef = collection(db, collectionName);
    // Default to ordering by createdAt descending if no constraints provided, 
    // but for now keeping it simple to avoid index errors on initial setup
    const q = query(collectionRef, ..._queryConstraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results: DocumentData[] = [];
      snapshot.docs.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      
      setData(results);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error(err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading, error };
};
