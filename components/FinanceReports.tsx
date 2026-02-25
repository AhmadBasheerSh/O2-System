import React, { useState } from 'react';
import { useApp } from '../store';
import { FinancialTransactionType } from '../types';
import { 
  ArrowUpRight, ArrowDownRight, Receipt, 
  Wallet, Banknote, History, Plus, 
  AlertCircle, CheckCircle, Clock, Search,
  Filter, FileText, Camera, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FinanceReports: React.FC = () => {
  const { financialTransactions, addFinancialTransaction, currentShift, currentUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FinancialTransactionType | 'ALL'>('ALL');

  const [newTx, setNewTx] = useState({
    type: FinancialTransactionType.WITHDRAWAL,
    amount: '',
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShift || !currentUser) return;

    addFinancialTransaction({
      shiftId: currentShift.id,
      cashierId: currentUser.id,
      type: newTx.type,
      amount: parseFloat(newTx.amount),
      reason: newTx.reason,
    });

    setNewTx({ type: FinancialTransactionType.WITHDRAWAL, amount: '', reason: '' });
    setShowAddModal(false);
  };

  const filteredTxs = financialTransactions.filter(tx => 
    (filterType === 'ALL' || tx.type === filterType) &&
    (tx.reason.toLowerCase().includes(searchQuery.toLowerCase()) || tx.amount.toString().includes(searchQuery))
  );

  const getTypeLabel = (type: FinancialTransactionType) => {
    switch(type) {
      case FinancialTransactionType.WITHDRAWAL: return 'سحوبات (مصاريف)';
      case FinancialTransactionType.DEPOSIT: return 'توريد (زيادة)';
      case FinancialTransactionType.REFUND: return 'مرتجع';
      case FinancialTransactionType.CASH_DROP: return 'توريد للإدارة';
      case FinancialTransactionType.VOID: return 'إلغاء فاتورة';
      default: return type;
    }
  };

  const getTypeColor = (type: FinancialTransactionType) => {
    switch(type) {
      case FinancialTransactionType.WITHDRAWAL: return 'text-red-500 bg-red-500/10';
      case FinancialTransactionType.DEPOSIT: return 'text-emerald-500 bg-emerald-500/10';
      case FinancialTransactionType.REFUND: return 'text-orange-500 bg-orange-500/10';
      case FinancialTransactionType.CASH_DROP: return 'text-blue-500 bg-blue-500/10';
      case FinancialTransactionType.VOID: return 'text-slate-500 bg-slate-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 bg-slate-950 p-4 sm:p-6 lg:p-8 rounded-[3rem] overflow-hidden">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-white tracking-tight">التقارير المالية</h2>
          <p className="text-slate-500 font-bold text-sm">إدارة السحوبات، التوريدات، والمرتجعات</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="ابحث في العمليات..."
              className="w-full pr-12 pl-4 py-3 bg-slate-900 border border-white/5 rounded-2xl focus:ring-2 focus:ring-red-600 outline-none text-sm font-bold text-white placeholder-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-red-900/20 flex items-center gap-2 hover:bg-red-700 transition-all active:scale-95"
          >
            <Plus size={18} /> إضافة عملية
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600">
              <ArrowUpRight size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إجمالي السحوبات</span>
          </div>
          <p className="text-2xl font-black text-white">
            {financialTransactions.filter(t => t.type === FinancialTransactionType.WITHDRAWAL).reduce((s, t) => s + t.amount, 0).toFixed(2)} ₪
          </p>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-600">
              <ArrowDownRight size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إجمالي التوريدات</span>
          </div>
          <p className="text-2xl font-black text-white">
            {financialTransactions.filter(t => t.type === FinancialTransactionType.DEPOSIT).reduce((s, t) => s + t.amount, 0).toFixed(2)} ₪
          </p>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-orange-600/10 rounded-xl flex items-center justify-center text-orange-600">
              <Receipt size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إجمالي المرتجعات</span>
          </div>
          <p className="text-2xl font-black text-white">
            {financialTransactions.filter(t => t.type === FinancialTransactionType.REFUND).reduce((s, t) => s + t.amount, 0).toFixed(2)} ₪
          </p>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
              <Wallet size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">توريد للإدارة</span>
          </div>
          <p className="text-2xl font-black text-white">
            {financialTransactions.filter(t => t.type === FinancialTransactionType.CASH_DROP).reduce((s, t) => s + t.amount, 0).toFixed(2)} ₪
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        <button 
          onClick={() => setFilterType('ALL')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap border ${filterType === 'ALL' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/20' : 'bg-slate-900 text-slate-500 border-white/5 hover:text-slate-300'}`}
        >
          الكل
        </button>
        {Object.values(FinancialTransactionType).map(type => (
          <button 
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap border ${filterType === type ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/20' : 'bg-slate-900 text-slate-500 border-white/5 hover:text-slate-300'}`}
          >
            {getTypeLabel(type)}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="flex-1 bg-slate-900/50 rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1 custom-scrollbar p-4">
          <table className="w-full text-right">
            <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
              <tr className="border-b border-white/5">
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">النوع</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">السبب / البيان</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">المبلغ</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">الوقت</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTxs.map(tx => (
                <tr key={tx.id} className="group hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black ${getTypeColor(tx.type)}`}>
                      {getTypeLabel(tx.type)}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-black text-white">{tx.reason}</p>
                    <p className="text-[10px] font-bold text-slate-500">ID: {tx.id.toUpperCase()}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-black text-white">{tx.amount.toFixed(2)} ₪</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-slate-300">{tx.timestamp.toLocaleTimeString('ar-PS', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-[10px] font-bold text-slate-500">{tx.timestamp.toLocaleDateString('ar-PS')}</span>
                    </div>
                  </td>
                  <td className="p-4 text-left">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${
                      tx.status === 'APPROVED' ? 'text-emerald-500 bg-emerald-500/10' :
                      tx.status === 'REJECTED' ? 'text-red-500 bg-red-500/10' :
                      'text-orange-500 bg-orange-500/10'
                    }`}>
                      {tx.status === 'PENDING' && <Clock size={12} />}
                      {tx.status === 'APPROVED' && <CheckCircle size={12} />}
                      {tx.status === 'REJECTED' && <AlertCircle size={12} />}
                      {tx.status === 'PENDING' ? 'قيد الانتظار' : tx.status === 'APPROVED' ? 'تم الاعتماد' : 'مرفوض'}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTxs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <History size={64} />
                      <p className="font-black text-lg">لا يوجد عمليات مالية مسجلة</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5">
                <h3 className="text-2xl font-black text-white">إضافة عملية مالية</h3>
                <p className="text-slate-500 font-bold text-sm mt-1">سيتم إرسال العملية للمراجعة والاعتماد المالي</p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">نوع العملية</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(FinancialTransactionType).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewTx({ ...newTx, type })}
                        className={`p-3 rounded-2xl border text-[10px] font-black transition-all ${
                          newTx.type === type 
                            ? 'bg-red-600 border-red-600 text-white shadow-lg' 
                            : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        {getTypeLabel(type)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">المبلغ (₪)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">السبب / البيان</label>
                  <textarea 
                    required
                    value={newTx.reason}
                    onChange={(e) => setNewTx({ ...newTx, reason: e.target.value })}
                    placeholder="اكتب سبب العملية بالتفصيل..."
                    className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-white h-32 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-red-900/20 hover:bg-red-700 transition-all active:scale-95"
                  >
                    تأكيد العملية
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black text-sm border border-white/5 hover:bg-slate-700 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
