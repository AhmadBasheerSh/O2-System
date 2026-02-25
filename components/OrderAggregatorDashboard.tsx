
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { OrderStatus, Order, OrderItem } from '../types';
import { 
  Clock, CheckCircle2, ChefHat, Timer, 
  Hash, Utensils, AlertCircle, Search, Filter,
  TrendingUp, Users, CheckCircle, PlayCircle,
  ArrowLeft, Bell, Settings, LogOut, Package,
  LayoutGrid, Info, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OrderAggregatorDashboard: React.FC = () => {
  const { activeOrders, currentUser, logout, tables, assignShelfToOrder, collectOrderItemByAggregator } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [pendingCollection, setPendingCollection] = useState<{ orderId: string; itemUniqueId: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCollectItem = (orderId: string, itemUniqueId: string) => {
    const order = activeOrders.find(o => o.id === orderId);
    if (order && !order.shelfLocation) {
      // If no shelf assigned, first ask for shelf
      setPendingCollection({ orderId, itemUniqueId });
      setAssigningOrderId(orderId);
    } else {
      // Already has shelf, just collect
      collectOrderItemByAggregator(orderId, itemUniqueId);
    }
  };

  const handleShelfSelect = (shelf: string) => {
    if (assigningOrderId) {
      assignShelfToOrder(assigningOrderId, shelf);
      
      // If this was triggered by a collection, complete the collection too
      if (pendingCollection && pendingCollection.orderId === assigningOrderId) {
        collectOrderItemByAggregator(pendingCollection.orderId, pendingCollection.itemUniqueId);
      }
      
      setAssigningOrderId(null);
      setPendingCollection(null);
    }
  };

  // KPIs
  const pendingAssembly = activeOrders.filter(o => 
    o.status !== OrderStatus.DELIVERED && 
    o.status !== OrderStatus.CANCELED &&
    o.items.some(i => i.status === OrderStatus.READY) &&
    o.items.some(i => i.status !== OrderStatus.READY && i.status !== OrderStatus.COLLECTED)
  ).length;

  const readyForDelivery = activeOrders.filter(o => o.status === OrderStatus.READY).length;
  
  const dailyTotal = activeOrders.filter(o => 
    o.status === OrderStatus.DELIVERED && 
    new Date(o.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const calculateAvgAssemblyTime = () => {
    const deliveredToday = activeOrders.filter(o => 
      o.status === OrderStatus.DELIVERED && 
      new Date(o.createdAt).toDateString() === new Date().toDateString()
    );
    if (deliveredToday.length === 0) return '0.0';
    
    const totalMins = deliveredToday.reduce((acc, o) => {
      const readyTime = o.timeline.find(t => t.status === OrderStatus.READY)?.time;
      const deliveredTime = o.timeline.find(t => t.status === OrderStatus.DELIVERED)?.time;
      if (readyTime && deliveredTime) {
        return acc + (new Date(deliveredTime).getTime() - new Date(readyTime).getTime()) / 60000;
      }
      return acc;
    }, 0);
    
    return (totalMins / deliveredToday.length).toFixed(1);
  };

  // Orders that have items ready to be collected from departments
  const ordersWithReadyItems = activeOrders.filter(o => 
    o.status !== OrderStatus.DELIVERED && 
    o.status !== OrderStatus.CANCELED &&
    o.items.some(i => i.status === OrderStatus.READY)
  );

  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const rows = [1, 2, 3, 4, 5];
  const occupiedShelves = activeOrders.filter(o => o.shelfLocation).map(o => o.shelfLocation);

  return (
    <div className="h-full flex flex-col space-y-6 bg-slate-950 p-4 sm:p-6 lg:p-8 rounded-[3rem] overflow-y-auto custom-scrollbar border border-white/5 shadow-2xl" dir="rtl">
      {/* Header & KPIs */}
      <header className="flex flex-col space-y-6 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/20 rotate-3">
              <Package size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">لوحة تجميع الطلبات</h2>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs mt-1">
                <span className="flex items-center gap-1"><Users size={12} /> {currentUser?.name}</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                <span className="flex items-center gap-1"><Clock size={12} /> {currentTime.toLocaleTimeString('ar-PS')}</span>
              </div>
            </div>
          </div>
          <button onClick={logout} className="p-4 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all">
            <LogOut size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">طلبات قيد التجميع</p>
              <h3 className="text-3xl font-black text-white">{pendingAssembly}</h3>
            </div>
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500"><Timer size={24} /></div>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">جاهزة للتسليم</p>
              <h3 className="text-3xl font-black text-white">{readyForDelivery}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><CheckCircle size={24} /></div>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">إجمالي اليوم</p>
              <h3 className="text-3xl font-black text-white">{dailyTotal}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><TrendingUp size={24} /></div>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">متوسط وقت التجميع</p>
              <h3 className="text-3xl font-black text-white">{calculateAvgAssemblyTime()} د</h3>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500"><Clock size={24} /></div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col space-y-6">
        {/* Orders to Collect */}
        <div className="bg-slate-900/30 rounded-[2.5rem] border border-white/5 p-8 flex flex-col space-y-6">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <LayoutGrid className="text-red-600" size={24} /> استلام الأصناف من الأقسام
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ordersWithReadyItems.map(order => (
              <div key={order.id} className={`bg-slate-900 p-6 rounded-[2rem] border space-y-4 transition-all shadow-xl ${order.shelfLocation ? 'border-emerald-500/20' : 'border-white/5 hover:border-red-600/40'}`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">رقم الطلب</span>
                    <p className="text-lg font-black text-white">#{order.orderNumber.split('-').pop()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${
                      order.status === OrderStatus.READY 
                        ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
                        : 'text-orange-500 bg-orange-500/10 border-orange-500/20'
                    }`}>
                      {order.status === OrderStatus.READY ? 'جاهز بالكامل' : 'تجميع جزئي'}
                    </span>
                    {order.shelfLocation && (
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-3 py-1 rounded-lg shadow-lg shadow-emerald-900/20">
                        الرف: {order.shelfLocation}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-2">الموقع</p>
                  <p className="text-sm font-black text-white">طاولة {tables.find(t => t.id === order.tableId)?.number || 'سفري'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">الأصناف الجاهزة للاستلام</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {order.items.map(item => (
                      <div key={item.uniqueId} className="flex items-center justify-between bg-slate-800/30 p-3 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-300">{item.name}</span>
                          <span className="text-[8px] text-slate-500">الكمية: {item.quantity}</span>
                        </div>
                        {item.status === OrderStatus.COLLECTED ? (
                          <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                            <CheckCircle size={12} /> تم الاستلام
                          </span>
                        ) : item.status === OrderStatus.READY ? (
                          <button 
                            onClick={() => handleCollectItem(order.id, item.uniqueId)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black transition-all active:scale-90"
                          >
                            استلام
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Timer size={12} className="animate-pulse" />
                            <span className="text-[10px] font-bold">تحضير</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {!order.shelfLocation && (
                  <button 
                    onClick={() => setAssigningOrderId(order.id)}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <LayoutGrid size={18} /> تخصيص رف يدوي
                  </button>
                )}
              </div>
            ))}
            {ordersWithReadyItems.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-600 font-bold text-lg italic opacity-50">
                لا توجد أصناف جاهزة للاستلام حالياً
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Shelf Assignment Modal */}
      <AnimatePresence>
        {assigningOrderId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 w-full max-w-4xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/20 rotate-3">
                    <LayoutGrid size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">اختر رفاً للطلب</h3>
                    <p className="text-sm font-bold text-slate-500">تخصيص رف للطلب #{activeOrders.find(o => o.id === assigningOrderId)?.orderNumber.split('-').pop()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAssigningOrderId(null)}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-8 gap-3 min-w-[700px]">
                  <div className="h-10"></div>
                  {columns.map(col => (
                    <div key={col} className="h-10 flex items-center justify-center font-black text-slate-500">{col}</div>
                  ))}
                  
                  {rows.map(row => (
                    <React.Fragment key={row}>
                      <div className="h-16 flex items-center justify-center font-black text-slate-500">{row}</div>
                      {columns.map(col => {
                        const shelf = `${col}${row}`;
                        const isOccupied = occupiedShelves.includes(shelf);
                        return (
                          <button
                            key={shelf}
                            disabled={isOccupied}
                            onClick={() => handleShelfSelect(shelf)}
                            className={`h-16 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                              isOccupied 
                                ? 'bg-slate-800/50 border-white/5 opacity-20 cursor-not-allowed' 
                                : 'bg-slate-900 border-white/10 hover:border-red-600 hover:bg-red-600/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase">{shelf}</span>
                            {!isOccupied && <span className="text-[8px] font-bold">متاح</span>}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-slate-800/30 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setAssigningOrderId(null)}
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
