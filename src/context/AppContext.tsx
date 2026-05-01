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
      setUser(user);
      if (user) {
        // Fetch profile and subscribe to sales
        const initData = async () => {
          try {
            const profileDoc = await getDoc(doc(db, 'salespersons', user.uid));
            if (profileDoc.exists()) {
              setProfileState(profileDoc.data() as SalesPerson);
            }

            // Subscribe to sales for the specific user
            const q = query(
              collection(db, 'sales'),
              where('salesPersonId', '==', user.uid)
            );
            
            const unsubscribeSales = onSnapshot(q, (snapshot) => {
              const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerSale));
              // Sort client side to bypass index requirement
              salesData.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
              setSales(salesData);
              setLoading(false);
            }, (error) => {
               console.error("Firestore read error:", error);
               setLoading(false);
            });

            return unsubscribeSales;
          } catch (error) {
            console.error("Initialization error:", error);
            setLoading(false);
            return () => {};
          }
        };

        const cleanupPromise = initData();
        return () => {
          cleanupPromise.then(unsubscribe => unsubscribe && unsubscribe());
        };
      } else {
        setProfileState(null);
        setSales([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const setProfile = async (newProfile: SalesPerson) => {
    if (user) {
      await setDoc(doc(db, 'salespersons', user.uid), newProfile);
      setProfileState(newProfile);
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
