
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { OrderStatus, Order } from '../types';
import { 
  Clock, Package, LayoutGrid, Info, ArrowLeft, CheckCircle, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ShelfGridView: React.FC = () => {
  const { activeOrders, deliverOrder, currentUser, logout, tables } = useApp();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedOrder = activeOrders.find(o => o.id === selectedOrderId);

  // Shelf Grid Logic
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const rows = [1, 2, 3, 4, 5];

  const getShelfOrder = (shelf: string) => {
    return activeOrders.find(o => o.shelfLocation === shelf);
  };

  const getShelfColor = (shelf: string) => {
    const order = getShelfOrder(shelf);
    if (!order) return 'bg-slate-900/20 border-white/5';
    
    if (order.status === OrderStatus.READY) {
      const readyTime = order.timeline.find(t => t.status === OrderStatus.READY)?.time;
      if (readyTime) {
        const diff = (currentTime.getTime() - new Date(readyTime).getTime()) / 60000;
        if (diff > 10) return 'bg-red-600/20 border-red-600/50 text-red-500';
      }
      return 'bg-emerald-600/20 border-emerald-600/50 text-emerald-500';
    }
    
    return 'bg-orange-500/20 border-orange-500/50 text-orange-500';
  };

  return (
    <div className="h-full flex flex-col space-y-6 bg-slate-950 p-4 sm:p-6 lg:p-8 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl" dir="rtl">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/20 rotate-3">
            <LayoutGrid size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">شبكة الرفوف الذكية</h2>
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs mt-1">
              <span className="flex items-center gap-1"><Users size={12} /> {currentUser?.name}</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full" />
              <span className="flex items-center gap-1"><Clock size={12} /> {currentTime.toLocaleTimeString('ar-PS')}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6">
        {/* Shelf Grid */}
        <div className="flex-1 bg-slate-900/30 rounded-[2.5rem] border border-white/5 p-6 flex flex-col space-y-4 overflow-hidden">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <div className="grid grid-cols-8 gap-3 min-w-[800px]">
              <div className="h-10"></div>
              {columns.map(col => (
                <div key={col} className="h-10 flex items-center justify-center font-black text-slate-500">{col}</div>
              ))}
              
              {rows.map(row => (
                <React.Fragment key={row}>
                  <div className="h-20 flex items-center justify-center font-black text-slate-500">{row}</div>
                  {columns.map(col => {
                    const shelf = `${col}${row}`;
                    const order = getShelfOrder(shelf);
                    return (
                      <button
                        key={shelf}
                        onClick={() => order && setSelectedOrderId(order.id)}
                        className={`h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${getShelfColor(shelf)} ${order ? 'shadow-lg scale-100' : 'opacity-40 hover:opacity-60'}`}
                      >
                        <span className="text-[10px] font-black opacity-50 uppercase">{shelf}</span>
                        {order && (
                          <>
                            <span className="text-sm font-black">#{order.orderNumber.split('-').pop()}</span>
                            <span className="text-[8px] font-bold">طاولة {tables.find(t => t.id === order.tableId)?.number || 'سفري'}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details Panel */}
        <div className="w-full lg:w-96 bg-slate-900 rounded-[3rem] border border-white/5 p-8 flex flex-col space-y-8 shadow-2xl">
          {selectedOrder ? (
            <>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-red-500">
                    <Package size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">تفاصيل الطلب</span>
                  </div>
                  <h3 className="text-3xl font-black text-white">#{selectedOrder.orderNumber.split('-').pop()}</h3>
                </div>
                <button onClick={() => setSelectedOrderId(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                  <ArrowLeft size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">الطاولة</p>
                  <p className="text-lg font-black text-white">{tables.find(t => t.id === selectedOrder.tableId)?.number || 'سفري'}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">الرف</p>
                  <p className="text-lg font-black text-emerald-500">{selectedOrder.shelfLocation}</p>
                </div>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-500 border-b border-white/5 pb-2">
                  <span>الصنف</span>
                  <span>الحالة</span>
                </div>
                {selectedOrder.items.map(item => (
                  <div key={item.uniqueId} className="flex items-center justify-between py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white">{item.name}</span>
                      <span className="text-[10px] text-slate-500">الكمية: {item.quantity}</span>
                    </div>
                    {item.status === OrderStatus.READY ? (
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">جاهز</span>
                    ) : (
                      <span className="text-[10px] font-black text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg">قيد التحضير</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>وقت الاكتمال:</span>
                  <span>{selectedOrder.timeline.find(t => t.status === OrderStatus.READY)?.time.toLocaleTimeString('ar-PS')}</span>
                </div>
                <button 
                  onClick={() => {
                    deliverOrder(selectedOrder.id);
                    setSelectedOrderId(null);
                  }}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <CheckCircle size={24} /> تم الاستلام من الضيافة
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
              <div className="w-24 h-24 bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600">
                <Info size={48} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white">لا يوجد طلب محدد</h4>
                <p className="text-sm font-bold text-slate-500 mt-2">اختر رفاً لعرض تفاصيل الطلب الموجود فيه</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
