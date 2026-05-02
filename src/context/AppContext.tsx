import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { SalesPerson, CustomerSale } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface AppContextType {
  user: User | null;
  profile: SalesPerson | null;
  sales: CustomerSale[];
  loading: boolean;
  setProfile: (profile: SalesPerson) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfileState] = useState<SalesPerson | null>(null);
  const [sales, setSales] = useState<CustomerSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeSales: (() => void) | null = null;
    let isMounted = true;

    // Safety timeout - if auth state doesn't resolve in 10s
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoading(prev => {
          if (prev) console.warn("Loading safety timeout triggered at root level");
          return false;
        });
      }
    }, 10000);

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timer);
      console.log("Auth State Changed:", user ? `User: ${user.uid}` : "No User");
      
      const isPlaceholder = (import.meta.env.VITE_FIREBASE_PROJECT_ID || "").includes("YOUR_PROJECT_ID") || 
                            (import.meta.env.VITE_FIREBASE_API_KEY || "").includes("YOUR_API_KEY");
      if (isPlaceholder) {
        if (isMounted) {
          setLoading(false);
          console.error("Firebase placeholders detected in environment");
        }
        return;
      }

      // Cleanup existing listeners if any
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
      if (unsubscribeSales) {
        unsubscribeSales();
        unsubscribeSales = null;
      }

      if (isMounted) setUser(user);

      if (user) {
        if (isMounted) setLoading(true);
        
        // 1. Sync Profile
        unsubscribeProfile = onSnapshot(doc(db, 'salespersons', user.uid), (doc) => {
          if (isMounted) {
            console.log("Profile Data Received:", doc.exists() ? "Exists" : "Empty");
            if (doc.exists()) {
              setProfileState(doc.data() as SalesPerson);
            } else {
              setProfileState(null);
            }
            setLoading(false);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `salespersons/${user.uid}`);
          if (isMounted) setLoading(false);
        });

        // 2. Sync Sales
        const q = query(
          collection(db, 'sales'),
          where('salesPersonId', '==', user.uid)
        );
        
        unsubscribeSales = onSnapshot(q, (snapshot) => {
          if (isMounted) {
            const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerSale));
            salesData.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
            setSales(salesData);
          }
        }, (error) => {
           handleFirestoreError(error, OperationType.GET, 'sales');
        });

      } else {
        if (isMounted) {
          setProfileState(null);
          setSales([]);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeSales) unsubscribeSales();
    };
  }, []);

  const setProfile = async (newProfile: SalesPerson) => {
    if (!user) return;
    
    // Race condition protection: Create a timeout for the write operation
    const profileDocRef = doc(db, 'salespersons', user.uid);
    
    try {
      console.log("Attempting to save profile for:", user.uid);
      const writePromise = setDoc(profileDocRef, newProfile);
      
      // If it doesn't resolve in 15 seconds, we assume there's a serious network hang
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Save operation timed out. Please check your internet connection and try again.")), 15000));
      
      await Promise.race([writePromise, timeoutPromise]);
      setProfileState(newProfile);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, `salespersons/${user.uid}`);
    }
  };

  return (
    <AppContext.Provider value={{ user, profile, sales, loading, setProfile }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
