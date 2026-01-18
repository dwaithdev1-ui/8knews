import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

export type UserRole = 'admin' | 'writer';

export const useRole = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setRole(userDoc.data().role as UserRole);
          } else {
            // Default new users to 'writer' (or 'admin' for the very first/dev user if needed, but 'writer' is safer)
            // For dev convenience, let's just default to 'admin' for now so you don't get locked out
            const defaultRole: UserRole = 'admin'; 
            await setDoc(userDocRef, {
              email: currentUser.email,
              role: defaultRole,
              createdAt: new Date(),
            });
            setRole(defaultRole);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { role, loading, user };
};
