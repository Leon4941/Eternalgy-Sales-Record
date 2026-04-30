import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Wallet, Calculator, TrendingUp, Calendar as CalendarIcon, Coins } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { BASE_COMMISSION_RATES } from '../constants';
import { CustomerSale } from '../types';

const CommissionReport: React.FC = () => {
  const { sales, profile } = useAppContext();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const calculateSaleCommissions = (sale: CustomerSale) => {
    const baseRate = sale.salesPersonType === 'internal' ? BASE_COMMISSION_RATES.internal : BASE_COMMISSION_RATES.outsource;
    const base = sale.salesFigure * baseRate;
    const overriding = sale.salesFigure * (sale.overridingRate || 0);
    const contest = sale.extraCommission || 0;
    return { base, overriding, contest, total: base + overriding + contest };
  };

  // Monthly filtering
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  const monthlySales = sales.filter(s => {
    const date = new Date(s.saleDate);
    return isWithinInterval(date, { start: monthStart, end: monthEnd });
  });

  const monthlyStats = monthlySales.reduce((acc, s) => {
    const comms = calculateSaleCommissions(s);
    acc.base += comms.base;
    acc.overriding += comms.overriding;
    acc.contest += comms.contest;
    acc.total += comms.total;
    return acc;
  }, { base: 0, overriding: 0, contest: 0, total: 0 });

  const lifetimeTotal = sales.reduce((acc, s) => acc + calculateSaleCommissions(s).total, 0);

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Commission Reports</h1>
        <p className="text-slate-500 mt-1">Track and view your earnings based on sales performance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-8 rounded-[32px] text-white shadow-xl shadow-emerald-200">
          <div className="flex justify-between items-start mb-8">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Wallet size={24} />
            </div>
            <span className="text-emerald-50 text-xs font-black uppercase tracking-widest">Lifetime Status</span>
          </div>
          <p className="text-emerald-100 font-bold mb-1">Total Accumulated Balance</p>
          <h2 className="text-4xl font-black tracking-tight">RM {lifetimeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
        </div>

        <div className="bg-white border border-indigo-100 p-8 rounded-[32px] shadow-sm shadow-indigo-100/50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-indigo-900 uppercase tracking-widest">{format(selectedMonth, 'MMMM yyyy')}</h3>
            <div className="flex items-center gap-1 bg-indigo-50/50 rounded-xl p-1 border border-indigo-100">
              <button 
                onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-indigo-600 transition-all font-bold"
              >
                &lsaquo;
              </button>
              <button 
                 onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))}
                 className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-indigo-600 transition-all font-bold"
              >
                &rsaquo;
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Monthly Total</p>
              <p className="text-2xl font-black text-indigo-900">RM {monthlyStats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Number of Sales</p>
              <p className="text-2xl font-black text-indigo-900">{monthlySales.length}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/20">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest">
            <div className="w-2 h-8 bg-indigo-500 rounded-full" />
            Monthly Breakdown
          </h3>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50/10">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Base</span>
              <span className="text-blue-600 font-black">RM {monthlyStats.base.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(monthlyStats.base / (monthlyStats.total || 1)) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Overriding</span>
              <span className="text-purple-600 font-black">RM {monthlyStats.overriding.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(monthlyStats.overriding / (monthlyStats.total || 1)) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-indigo-600">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Contest Bonus</span>
              <span className="font-black flex items-center gap-1">
                <Coins size={14} />
                RM {monthlyStats.contest.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(monthlyStats.contest / (monthlyStats.total || 1)) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Sales Figure</th>
                <th className="px-8 py-5">Base</th>
                <th className="px-8 py-5">Overriding</th>
                <th className="px-8 py-5 text-indigo-600">Contest</th>
                <th className="px-8 py-5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {monthlySales.map((sale) => {
                const comms = calculateSaleCommissions(sale);
                return (
                  <tr key={sale.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-900">{sale.customerName}</td>
                    <td className="px-8 py-5 text-sm font-medium">{format(new Date(sale.saleDate), 'dd MMM')}</td>
                    <td className="px-8 py-5 text-sm font-bold">RM {sale.salesFigure.toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm text-slate-400 font-medium">RM {comms.base.toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm text-slate-400 font-medium">RM {comms.overriding.toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm font-black text-indigo-500">RM {comms.contest.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right font-black text-slate-900 italic">RM {comms.total.toLocaleString()}</td>
                  </tr>
                );
              })}
              {monthlySales.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center text-slate-400 font-bold uppercase tracking-widest italic bg-slate-50/30">
                    No sales recorded for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CommissionReport;
