import React from 'react';
import { LogOut, LayoutDashboard, ListPlus, FileText, UserCircle } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales Records', icon: ListPlus },
    { id: 'commissions', label: 'Commissions', icon: FileText },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:h-screen lg:w-64 bg-white border-t lg:border-t-0 lg:border-r border-slate-200 z-50 shadow-xl shadow-slate-200/50">
      <div className="flex lg:flex-col items-center justify-around lg:justify-start h-full p-4 lg:gap-4">
        <div className="hidden lg:block mb-8 px-2">
          <img src="https://ais-pre-7th2hnfipjlehdlyo5pyyk-698513171403.asia-southeast1.run.app/artifact/eternalgy-logo.png" alt="Eternalgy" className="w-full h-auto brightness-0 opacity-80" />
        </div>
        
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-4 py-3 rounded-2xl transition-all w-full ${
              activeTab === tab.id 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={20} className={activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'} />
            <span className="text-[10px] lg:text-sm font-bold">{tab.label}</span>
          </button>
        ))}

        <button
          onClick={() => signOut(auth)}
          className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-4 py-3 rounded-2xl transition-all text-rose-500 hover:text-rose-600 hover:bg-rose-50 lg:mt-auto w-full"
        >
          <LogOut size={20} />
          <span className="text-[10px] lg:text-sm font-bold">Log Out</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
