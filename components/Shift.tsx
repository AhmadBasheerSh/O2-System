
import React, { useState } from 'react';
import { useApp } from '../store';
import { Clock, Wallet, LogOut, ArrowRightCircle } from 'lucide-react';

export const ShiftView: React.FC = () => {
  const { currentShift, openShift, closeShift, currentUser } = useApp();
  const [balance, setBalance] = useState('');

  if (!currentShift) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wallet size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">بدء شفت جديد</h2>
          <p className="text-slate-500 mb-8">يرجى إدخال المبلغ الافتتاحي في الصندوق لبدء العمل</p>
          
          <div className="space-y-4">
            <div className="text-right">
              <label className="text-sm font-bold text-slate-700 block mb-2">الرصيد الابتدائي (₪)</label>
              <input 
                type="number" 
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-center text-xl font-bold"
              />
            </div>
            <button 
              onClick={() => openShift(Number(balance))}
              className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
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
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200">
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <p className="text-sm text-slate-500">الرصيد الافتتاحي</p>
          <p className="text-2xl font-bold text-slate-800">{currentShift.openingBalance.toFixed(2)} ₪</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <p className="text-sm text-slate-500">إجمالي المبيعات (كاش)</p>
          <p className="text-2xl font-bold text-green-600">0.00 ₪</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <p className="text-sm text-slate-500">إجمالي المصاريف</p>
          <p className="text-2xl font-bold text-red-600">0.00 ₪</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">تقرير الشفت الحالي</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-slate-600">
            <span>الكاشير</span>
            <span className="font-bold">{currentUser?.name}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>عدد الطلبات</span>
            <span className="font-bold">0 طلب</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>مبيعات الشبكة</span>
            <span className="font-bold">0.00 ₪</span>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-between text-slate-800 font-bold">
            <span>الرصيد المتوقع بالدرج</span>
            <span className="text-xl text-orange-600">{(currentShift.openingBalance).toFixed(2)} ₪</span>
          </div>
        </div>
      </div>
    </div>
  );
};
