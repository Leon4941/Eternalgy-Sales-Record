import React, { useState } from 'react';
import { Plus, Search, Filter, ChevronRight, Calendar, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CustomerSale } from '../types';
import SalesForm from './SalesForm';

const SalesList: React.FC = () => {
  const { sales } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<CustomerSale | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredSales = sales.filter(s => 
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Records</h1>
          <p className="text-slate-500 mt-1">Manage and track your customer sales history.</p>
        </div>
        <button
          onClick={() => { setSelectedSale(null); setIsFormOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus size={20} />
          Add New Record
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search by customer name..."
          className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredSales.map((sale) => (
          <div
            key={sale.id}
            onClick={() => { setSelectedSale(sale); setIsFormOpen(true); }}
            className="group bg-white border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50 p-6 rounded-3xl cursor-pointer transition-all active:scale-[0.99] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">{sale.customerName}</h3>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    sale.propertyType === 'Residential' ? 'bg-teal-100 text-teal-700' :
                    sale.propertyType === 'Shoplot' ? 'bg-sky-100 text-sky-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {sale.propertyType}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="font-medium text-slate-600">{new Date(sale.saleDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-indigo-600">RM {sale.salesFigure.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                      sale.progress === 'Complete-100%' 
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {sale.progress}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-indigo-200">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        ))}

        {filteredSales.length === 0 && (
          <div className="text-center py-24 bg-white/50 rounded-[40px] border-2 border-dashed border-slate-200">
            <div className="bg-slate-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900">No records found</h3>
            <p className="text-slate-500 mt-2 px-6 max-w-sm mx-auto">Try a different search term or add a fresh record to your list.</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <SalesForm
          sale={selectedSale || undefined}
          onClose={() => { setIsFormOpen(false); setSelectedSale(null); }}
        />
      )}
    </div>
  );
};

export default SalesList;
