
import React, { useState } from 'react';
import { useApp } from '../store';
import { Clock, Wallet, LogOut, ArrowRightCircle } from 'lucide-react';

export const ShiftView: React.FC = () => {
  const { currentShift, openShift, closeShift, currentUser } = useApp();
  const [balance, setBalance] = useState('');

  if (!currentShift) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-white/5 shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-600/10 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wallet size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">بدء شفت جديد</h2>
          <p className="text-slate-500 mb-8">يرجى إدخال المبلغ الافتتاحي في الصندوق لبدء العمل</p>
          
          <div className="space-y-4">
            <div className="text-right">
              <label className="text-sm font-bold text-slate-400 block mb-2">الرصيد الابتدائي (₪)</label>
              <input 
                type="number" 
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-center text-xl font-bold text-white"
              />
            </div>
            <button 
              onClick={() => openShift(Number(balance))}
              className="w-full py-4 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
            >
              فتح الشفت الآن
              <ArrowRightCircle size={20} className="rotate-180" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950 rounded-[3rem] custom-scrollbar">
      <header className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">الشفت نشط</h2>
            <p className="text-sm text-slate-500">بدأ منذ: {new Date(currentShift.startTime).toLocaleTimeString('ar-EG')}</p>
          </div>
        </div>
        <button 
          onClick={() => {
            const final = prompt('أدخل المبلغ النهائي في الصندوق');
            if (final) closeShift(Number(final));
          }}
          className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold flex items-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          إغلاق الشفت
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 space-y-2 shadow-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الرصيد الافتتاحي</p>
          <p className="text-2xl font-black text-white">{currentShift.openingBalance.toFixed(2)} ₪</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 space-y-2 shadow-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إجمالي المبيعات (كاش)</p>
          <p className="text-2xl font-black text-emerald-500">0.00 ₪</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 space-y-2 shadow-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إجمالي المصاريف</p>
          <p className="text-2xl font-black text-red-500">0.00 ₪</p>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <h3 className="text-lg font-black text-white mb-6 border-b border-white/5 pb-4 uppercase tracking-widest">تقرير الشفت الحالي</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-slate-400">
            <span className="text-xs font-bold">الكاشير</span>
            <span className="text-xs font-black text-white">{currentUser?.name}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span className="text-xs font-bold">عدد الطلبات</span>
            <span className="text-xs font-black text-white">0 طلب</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span className="text-xs font-bold">مبيعات الشبكة</span>
            <span className="text-xs font-black text-white">0.00 ₪</span>
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-between text-white font-black">
            <span className="text-sm">الرصيد المتوقع بالدرج</span>
            <span className="text-2xl text-red-600">{(currentShift.openingBalance).toFixed(2)} ₪</span>
          </div>
        </div>
      </div>
    </div>
  );
};
