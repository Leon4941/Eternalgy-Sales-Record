import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import SalesList from './components/SalesList';
import CommissionReport from './components/CommissionReport';
import ProfileSetup from './components/ProfileSetup';
import Login from './components/Login';
import { UserCircle, Mail, MapPin, Award } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!profile) {
    return <ProfileSetup />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'sales': return <SalesList />;
      case 'commissions': return <CommissionReport />;
      case 'profile': return (
        <div className="max-w-2xl mx-auto space-y-10">
          <header>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Profile</h1>
            <p className="text-slate-500 mt-1">Manage your partner information and settings.</p>
          </header>
          
          <div className="bg-white border border-slate-100 rounded-[40px] p-10 space-y-8 shadow-sm">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 bg-indigo-50 border-4 border-white rounded-[32px] flex items-center justify-center shadow-xl shadow-indigo-100">
                <UserCircle className="text-indigo-600" size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{profile.name}</h2>
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-2 font-bold uppercase tracking-wider">
                  <Mail size={16} className="text-slate-300" />
                  {profile.email}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-100">
              <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Partner Tier</p>
                <div className="flex items-center gap-2">
                  <Award className="text-amber-500" size={20} />
                  <span className="text-slate-900 font-black capitalize">{profile.type} Sales</span>
                </div>
              </div>
              <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Base Commission</p>
                <p className="text-slate-900 text-xl font-black italic">{profile.type === 'internal' ? '3.00%' : '4.50%'}</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 flex gap-6 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0">
               <Award size={24} />
            </div>
            <div>
              <h4 className="text-indigo-900 font-black uppercase tracking-widest">Status: Active Partner</h4>
              <p className="text-indigo-600/80 text-sm mt-2 leading-relaxed font-medium">
                You are currently eligible for all override commissions and incentive trip rewards. Keep up the great work!
              </p>
            </div>
          </div>
        </div>
      );
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 lg:flex">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto max-h-screen lg:pb-12 bg-white">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
