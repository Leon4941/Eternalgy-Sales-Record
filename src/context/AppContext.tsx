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
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch profile
        const profileDoc = await getDoc(doc(db, 'salespersons', user.uid));
        if (profileDoc.exists()) {
          setProfileState(profileDoc.data() as SalesPerson);
        }

        // Subscribe to sales for the specific user to improve performance
        const q = query(
          collection(db, 'sales'),
          where('salesPersonId', '==', user.uid),
          orderBy('saleDate', 'desc')
        );
        
        const unsubscribeSales = onSnapshot(q, (snapshot) => {
          const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerSale));
          setSales(salesData);
          setLoading(false);
        }, (error) => {
           console.error("Firestore read error:", error);
           // If index is missing, it will fail here. We should still set loading to false.
           setLoading(false);
        });

        return () => unsubscribeSales();
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
