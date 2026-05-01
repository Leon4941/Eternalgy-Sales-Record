import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Target, Award, Star, Calendar, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth, isWithinInterval, subMonths, format } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import { EGA_CONFIG, ESA_CONFIG } from '../constants';
import { CustomerSale } from '../types';

const Dashboard: React.FC = () => {
  const { sales, profile } = useAppContext();
  const [selectedMonthView, setSelectedMonthView] = useState(new Date());

  const calculateEPPoints = (sale: CustomerSale) => {
    const baseValue = sale.propertyType === 'Industrial' ? sale.salesFigure * 0.4 : sale.salesFigure;
    return baseValue * (sale.epMultiplier || 1);
  };

  const { totalSales, totalEP, monthlyTrendData, rollingVolume, rollingCases, maxTrendVolume, egaEP, esaEP } = useMemo(() => {
    const totalSales = sales.reduce((acc, sale) => acc + sale.salesFigure, 0);
    const totalEP = sales.reduce((acc, sale) => acc + calculateEPPoints(sale), 0);

    // Rolling 3 Months Stats
    const months = [subMonths(new Date(), 2), subMonths(new Date(), 1), new Date()];
    const monthlyTrendData = months.map(m => {
      const start = startOfMonth(m);
      const end = endOfMonth(m);
      const monthSales = sales.filter(s => isWithinInterval(new Date(s.saleDate), { start, end }));
      return {
        month: format(m, 'MMM'),
        volume: monthSales.reduce((acc, s) => acc + s.salesFigure, 0),
        cases: monthSales.length
      };
    });

    const rollingVolume = monthlyTrendData.reduce((acc, d) => acc + d.volume, 0);
    const rollingCases = monthlyTrendData.reduce((acc, d) => acc + d.cases, 0);
    const maxTrendVolume = Math.max(...monthlyTrendData.map(d => d.volume), 1);

    // EGA/ESA Filtered
    const egaSales = sales.filter(s => new Date(s.saleDate) <= new Date(EGA_CONFIG.deadline));
    const egaEP = egaSales.reduce((acc, s) => acc + calculateEPPoints(s), 0);

    const esaSales = sales.filter(s => new Date(s.saleDate) <= new Date(ESA_CONFIG.deadline));
    const esaEP = esaSales.reduce((acc, s) => acc + calculateEPPoints(s), 0);

    return { totalSales, totalEP, monthlyTrendData, rollingVolume, rollingCases, maxTrendVolume, egaEP, esaEP };
  }, [sales]);

  // View-specific Month Stats (separated from general memo to allow independent month cycling)
  const monthlyVolumeData = useMemo(() => {
    const viewMonthStart = startOfMonth(selectedMonthView);
    const viewMonthEnd = endOfMonth(selectedMonthView);
    const filteredMonthSales = sales.filter(s => isWithinInterval(new Date(s.saleDate), { start: viewMonthStart, end: viewMonthEnd }));
    return {
      volume: filteredMonthSales.reduce((acc, s) => acc + s.salesFigure, 0),
      count: filteredMonthSales.length
    };
  }, [sales, selectedMonthView]);

  const targetEP = profile?.type === 'internal' ? EGA_CONFIG.epPointsTarget.internal : EGA_CONFIG.epPointsTarget.outsource;
  const esaTargetEP = profile?.type === 'internal' ? ESA_CONFIG.epPointsTarget.internal : ESA_CONFIG.epPointsTarget.outsource;

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {profile?.name || 'Partner'}</h1>
        <p className="text-slate-500 mt-2">Here's your sales performance overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-blue-600/80 text-sm font-bold uppercase tracking-wider">Total Sales Volume</p>
          <h3 className="text-2xl font-black text-blue-900 mt-1">RM {totalSales.toLocaleString()}</h3>
        </motion.div>

        {/* Total EP Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50/50 border border-amber-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
              <Star size={24} />
            </div>
          </div>
          <p className="text-amber-700/80 text-sm font-bold uppercase tracking-wider">Total EP Points</p>
          <h3 className="text-2xl font-black text-amber-900 mt-1">{totalEP.toLocaleString()}</h3>
        </motion.div>

        {/* Monthly Sales Selector Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm">
              <Calendar size={24} />
            </div>
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-indigo-100 shadow-sm">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-1 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 hover:text-indigo-600 transition-all"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => changeMonth(1)}
                className="p-1 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 hover:text-indigo-600 transition-all"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <p className="text-indigo-600/80 text-sm font-bold uppercase tracking-wider">
            Sales: {format(selectedMonthView, 'MMM yyyy')}
          </p>
          <h3 className="text-2xl font-black text-indigo-900 mt-1">
            RM {monthlyVolumeData.volume.toLocaleString()}
            <small className="text-xs font-bold text-indigo-500/70 ml-2">({monthlyVolumeData.count} Cases)</small>
          </h3>
        </motion.div>

        {/* Rolling 3 Months Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
              <BarChart3 size={24} />
            </div>
          </div>
          <p className="text-emerald-700/80 text-sm font-bold uppercase tracking-wider">Last 3 Months Trend</p>
          <div className="mt-1 flex items-end gap-1.5 h-10">
            {monthlyTrendData.map((data, i) => (
              <div key={i} className="flex-1 group relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.volume / maxTrendVolume) * 100}%` }}
                  className="w-full bg-emerald-200 group-hover:bg-emerald-300 rounded-sm transition-colors border-t border-emerald-400 min-h-[4px]"
                />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-emerald-900 text-white text-[8px] px-1 rounded z-10">
                  RM {data.volume.toLocaleString()} ({data.cases}c)
                </div>
              </div>
            ))}
          </div>
          <h3 className="text-xl font-black text-emerald-900 mt-5">
            RM {rollingVolume.toLocaleString()}
            <small className="text-xs font-bold text-emerald-600/70 ml-2">({rollingCases} Cases)</small>
          </h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* EGA Card */}
        <section className="bg-indigo-50/30 border border-indigo-100 rounded-[32px] p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-8 text-indigo-500/10">
            <Target size={120} />
          </div>
          <h2 className="text-lg font-black text-indigo-900 mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            EGA: Glow Award
          </h2>
          
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wide mb-3">
                <span className="text-indigo-600/70">EP Points ({egaEP.toLocaleString()} / {targetEP.toLocaleString()})</span>
                <span className="text-indigo-600">{calculateProgress(egaEP, targetEP)}%</span>
              </div>
              <div className="h-3 bg-white border border-indigo-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress(egaEP, targetEP)}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full shadow-inner"
                />
              </div>
              <p className="text-[11px] text-indigo-400 font-medium mt-2.5">Balance: {Math.max(0, targetEP - egaEP).toLocaleString()} EP Points required</p>
            </div>
          </div>
        </section>

        {/* ESA Card */}
        <section className="bg-purple-50/30 border border-purple-100 rounded-[32px] p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-8 text-purple-500/10">
            <Award size={120} />
          </div>
          <h2 className="text-lg font-black text-purple-900 mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            ESA: Supreme Award
          </h2>
          
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wide mb-3">
                <span className="text-purple-600/70">EP Points ({esaEP.toLocaleString()} / {esaTargetEP.toLocaleString()})</span>
                <span className="text-purple-600">{calculateProgress(esaEP, esaTargetEP)}%</span>
              </div>
              <div className="h-3 bg-white border border-purple-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress(esaEP, esaTargetEP)}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-full shadow-inner"
                />
              </div>
              <p className="text-[11px] text-purple-400 font-medium mt-2.5">Balance: {Math.max(0, esaTargetEP - esaEP).toLocaleString()} EP Points required</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
