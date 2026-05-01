import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { SalesPerson, CustomerSale } from '../types';

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
    // Safety timeout to ensure loading screen doesn't get stuck forever
    const timer = setTimeout(() => {
      setLoading(prev => {
        if (prev) console.warn("Loading safety timeout triggered");
        return false;
      });
    }, 10000);

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timer);
      
      // Check for placeholders
      const isPlaceholder = (import.meta.env.VITE_FIREBASE_PROJECT_ID || "").includes("YOUR_PROJECT_ID");
      if (isPlaceholder) {
        setLoading(false);
        console.error("Firebase is using placeholder values. Please check your environment variables.");
        return;
      }

      setUser(user);
      if (user) {
        // Fetch profile and subscribe to sales
        const initData = () => {
          setLoading(true);
          
          // 1. Subscribe to profile
          const unsubscribeProfile = onSnapshot(doc(db, 'salespersons', user.uid), (doc) => {
            if (doc.exists()) {
              setProfileState(doc.data() as SalesPerson);
            }
            // If user exists but doc doesn't, we still want to stop loading to show Setup screen
            setLoading(false);
          }, (error) => {
            console.error("Profile sync error:", error);
            setLoading(false);
          });

          // 2. Subscribe to sales
          const q = query(
            collection(db, 'sales'),
            where('salesPersonId', '==', user.uid)
          );
          
          const unsubscribeSales = onSnapshot(q, (snapshot) => {
            const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerSale));
            salesData.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
            setSales(salesData);
          }, (error) => {
             console.error("Sales sync error:", error);
          });

          return () => {
            unsubscribeProfile();
            unsubscribeSales();
          };
        };

        const cleanup = initData();
        return () => cleanup();
      } else {
        setProfileState(null);
        setSales([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const setProfile = async (newProfile: SalesPerson) => {
    if (!user) return;
    try {
      console.log("Attempting to save profile for:", user.uid);
      await setDoc(doc(db, 'salespersons', user.uid), newProfile);
      setProfileState(newProfile);
    } catch (error: any) {
      console.error("SetProfile Error:", error);
      alert(`Failed to save profile: ${error.message || 'Unknown error'}`);
      throw error;
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
