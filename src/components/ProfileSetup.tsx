import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, ShieldCheck, Briefcase } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SalesPersonType } from '../types';

const ProfileSetup: React.FC = () => {
  const { user, setProfile } = useAppContext();
  const [name, setName] = useState(user?.displayName || '');
  const [type, setType] = useState<SalesPersonType>('internal');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await setProfile({
        uid: user.uid,
        name,
        type,
        email: user.email || '',
      });
    } catch (error: any) {
      console.error("Save error:", error);
      // alert is already called in AppContext's setProfile
    } finally {
    setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white border border-slate-100 rounded-[48px] p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 text-slate-50">
          <User size={160} />
        </div>
        
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[20px] flex items-center justify-center mb-8 shadow-xl shadow-indigo-200">
            <User className="text-white" size={32} />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Setup</h1>
          <p className="text-slate-500 mt-2 font-medium leading-relaxed">Personalize your Eternalgy Sales Pro account to get started.</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Personnel Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('internal')}
                  className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${
                    type === 'internal' 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <Briefcase size={28} />
                  <span className="font-black uppercase tracking-widest text-[10px]">Internal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('outsource')}
                  className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${
                    type === 'outsource' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-100' 
                      : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <ShieldCheck size={28} />
                  <span className="font-black uppercase tracking-widest text-[10px]">Outsource</span>
                </button>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[11px] text-slate-500 font-bold text-center italic">
                  {type === 'internal' 
                    ? 'Internal sales partners earn a 3.00% base commission.' 
                    : 'Outsource sales partners earn a 4.50% base commission.'}
                </p>
              </div>
            </div>

            <button
              disabled={saving}
              type="submit"
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-indigo-200 uppercase tracking-widest text-xs"
            >
              {saving ? 'Saving...' : 'Enter Dashboard'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
