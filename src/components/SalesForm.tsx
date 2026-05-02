import React, { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppContext } from '../context/AppContext';
import { CustomerSale, PropertyType, ProgressStatus } from '../types';
import { PROPERTY_TYPES, PROGRESS_STATUSES, EP_MULTIPLIERS, OVERRIDING_RATES } from '../constants';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface SalesFormProps {
  sale?: CustomerSale;
  onClose: () => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ sale, onClose }) => {
  const { user, profile } = useAppContext();
  const [formData, setFormData] = useState<Partial<CustomerSale>>(
    sale || {
      customerName: '',
      saleDate: new Date().toISOString().split('T')[0],
      propertyType: 'Residential',
      salesFigure: 0,
      progress: 'Deposit-5%',
      progressDate: new Date().toISOString().split('T')[0],
      epMultiplier: 1,
      overridingRate: 0,
      extraCommission: 0,
    }
  );

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);

    try {
      // Remove id from payload if it exists
      const { id, ...cleanData } = formData;
      
      const payload = {
        ...cleanData,
        salesPersonId: user.uid,
        salesPersonType: profile.type,
        updatedAt: new Date().toISOString(),
        createdAt: sale?.createdAt || new Date().toISOString(),
      };

      const operation = sale?.id 
        ? updateDoc(doc(db, 'sales', sale.id), payload)
        : addDoc(collection(db, 'sales'), payload);

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Save operation timed out. Please check your connection.")), 15000));
      
      await Promise.race([operation, timeoutPromise]);
      onClose();
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, 'sales');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!sale?.id || !window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteDoc(doc(db, 'sales', sale.id));
      onClose();
    } catch (error) {
      console.error("Error deleting sale:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest italic">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            {sale ? 'Update Sale Record' : 'New Sale Entry'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
              <input
                required
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                placeholder="Full Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sale Date</label>
              <input
                required
                type="date"
                value={formData.saleDate}
                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Property Type</label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none"
              >
                {PROPERTY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Figure (RM)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold">RM</span>
                </div>
                <input
                  required
                  type="number"
                  value={formData.salesFigure || ''}
                  onChange={(e) => setFormData({ ...formData, salesFigure: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-5 py-4 text-slate-900 font-black focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Progress</label>
              <select
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value as ProgressStatus })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none"
              >
                {PROGRESS_STATUSES.map(prog => <option key={prog} value={prog}>{prog}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Progress Date</label>
              <input
                required
                type="date"
                value={formData.progressDate}
                onChange={(e) => setFormData({ ...formData, progressDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">EP Divider / Multiplier</label>
              <select
                value={formData.epMultiplier}
                onChange={(e) => setFormData({ ...formData, epMultiplier: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none"
              >
                {EP_MULTIPLIERS.map(m => <option key={m} value={m}>Rate: x{m}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Overriding Rate</label>
              <select
                value={formData.overridingRate}
                onChange={(e) => setFormData({ ...formData, overridingRate: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none"
              >
                <option value={0}>No Overriding (0%)</option>
                {OVERRIDING_RATES.map(r => <option key={r} value={r}>Manager Tier: {(r * 100).toFixed(2)}%</option>)}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contest Extra Bonus (RM)</label>
              <input
                type="number"
                value={formData.extraCommission || ''}
                onChange={(e) => setFormData({ ...formData, extraCommission: parseFloat(e.target.value) || 0 })}
                className="w-full bg-teal-50/30 border border-teal-100 rounded-2xl px-5 py-4 text-teal-700 font-black focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            {sale && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-rose-50 text-rose-500 font-black py-5 rounded-2xl hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest text-xs"
              >
                Delete Record
              </button>
            )}
            <button
              disabled={saving}
              type="submit"
              className="flex-[2] bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-indigo-200 uppercase tracking-widest text-xs"
            >
              {saving ? 'Processing...' : sale ? 'Update Record' : 'Confirm & Save'}
              {!saving && <Plus size={20} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesForm;
