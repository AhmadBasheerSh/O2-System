
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { OrderStatus, Order, OrderItem } from '../types';
import { 
  Clock, CheckCircle2, ChefHat, Timer, 
  Hash, Utensils, AlertCircle, Search, Filter,
  TrendingUp, Users, CheckCircle, PlayCircle,
  ArrowLeft, Bell, Settings, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DepartmentView: React.FC<{ initialView?: 'DASHBOARD' | 'ORDERS' }> = ({ initialView = 'DASHBOARD' }) => {
  const { activeOrders, updateOrderItemStatus, currentUser, userRole, logout, tables, departments } = useApp();
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'ORDERS'>(initialView);

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser?.departmentId) {
      setSelectedDeptId(currentUser.departmentId);
    } else if (departments.length > 0) {
      setSelectedDeptId(departments[0].id);
    }
  }, [currentUser, departments]);

  const isDeptStaff = userRole === 'DEPARTMENT_STAFF';
  const isHospitality = userRole === 'HOSPITALITY' || userRole === 'WAITER';

  // If hospitality, force 'ORDERS' view and hide dashboard
  useEffect(() => {
    if (isHospitality) {
      setActiveView('ORDERS');
    }
  }, [isHospitality]);

  // Filter items for the selected department
  const getDepartmentItems = (order: Order) => {
    return order.items.filter(item => item.departmentId === selectedDeptId && item.status !== OrderStatus.COLLECTED);
  };

  const departmentOrders = activeOrders.filter(order => 
    order.status !== OrderStatus.DELIVERED && 
    order.status !== OrderStatus.CANCELED &&
    order.items.some(item => item.departmentId === selectedDeptId && item.status !== OrderStatus.COLLECTED)
  );

  const filteredOrders = departmentOrders.filter(order => {
    if (statusFilter === 'ALL') return true;
    const items = getDepartmentItems(order);
    return items.some(item => item.status === statusFilter);
  });

  // Calculate Item Statistics
  const itemStats = activeOrders.reduce((acc: any, order) => {
    const deptItems = getDepartmentItems(order);
    deptItems.forEach(item => {
      if (!acc[item.itemId]) {
        acc[item.itemId] = { name: item.name, preparing: 0, ready: 0, delivered: 0 };
      }
      if (order.status === OrderStatus.DELIVERED) {
        acc[item.itemId].delivered += item.quantity;
      } else if (item.status === OrderStatus.READY) {
        acc[item.itemId].ready += item.quantity;
      } else {
        acc[item.itemId].preparing += item.quantity;
      }
    });
    return acc;
  }, {});

  // Calculate Average Preparation Time
  const calculateAvgPrepTime = () => {
    let totalMins = 0;
    let count = 0;
    activeOrders.forEach(order => {
      const deptItems = getDepartmentItems(order);
      deptItems.forEach(item => {
        if (item.preparedAt) {
          const diff = new Date(item.preparedAt).getTime() - new Date(order.createdAt).getTime();
          totalMins += diff / 60000;
          count++;
        }
      });
    });
    if (count === 0) return '0:00';
    const avg = totalMins / count;
    const mins = Math.floor(avg);
    const secs = Math.floor((avg % 1) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = {
    pending: activeOrders.reduce((acc, order) => acc + getDepartmentItems(order).filter(i => i.status !== OrderStatus.READY).length, 0),
    ready: activeOrders.reduce((acc, order) => acc + getDepartmentItems(order).filter(i => i.status === OrderStatus.READY).length, 0),
    avgTime: calculateAvgPrepTime()
  };

  const getElapsedTime = (createdAt: Date, preparedAt?: Date) => {
    const end = preparedAt ? new Date(preparedAt) : currentTime;
    const diff = end.getTime() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (createdAt: Date) => {
    const diff = currentTime.getTime() - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins > 20) return 'text-red-500';
    if (mins > 10) return 'text-orange-500';
    return 'text-emerald-500';
  };

  return (
    <div className="h-full flex flex-col space-y-6 bg-slate-950 p-4 sm:p-6 lg:p-8 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/20 rotate-3">
              <ChefHat size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                لوحة تحكم {departments.find(d => d.id === selectedDeptId)?.name || 'القسم'}
              </h2>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs mt-1">
                <span className="flex items-center gap-1"><Users size={12} /> {currentUser?.name}</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                <span className="flex items-center gap-1"><Clock size={12} /> {currentTime.toLocaleTimeString('ar-PS')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            {!isDeptStaff && (
              <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/5 shadow-xl overflow-x-auto scrollbar-hide max-w-md">
                {departments.map(dept => (
                  <button 
                    key={dept.id}
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] transition-all whitespace-nowrap ${selectedDeptId === dept.id ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    <span>{dept.id === 'd-italian' ? '🇮🇹' : dept.id === 'd-bar' ? '🍹' : dept.id === 'd-grills' ? '🔥' : dept.id === 'd-fastfood' ? '⚡' : '🍰'}</span> {dept.name}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <button className="p-3 rounded-2xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all"><Bell size={20} /></button>
              <button className="p-3 rounded-2xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all"><Settings size={20} /></button>
              {isDeptStaff && (
                <button onClick={logout} className="p-3 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all"><LogOut size={20} /></button>
              )}
            </div>
          </div>
        </header>

      {/* Navigation Tabs - Removed as they are now in the sidebar */}

      {activeView === 'DASHBOARD' && !isHospitality ? (
        <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-red-600/30 transition-all">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">قيد التحضير</p>
                <h3 className="text-3xl font-black text-white">{stats.pending}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><PlayCircle size={24} /></div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-red-600/30 transition-all">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">جاهز للتسليم</p>
                <h3 className="text-3xl font-black text-white">{stats.ready}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><CheckCircle size={24} /></div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-red-600/30 transition-all">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">متوسط وقت التحضير</p>
                <h3 className="text-3xl font-black text-white">{stats.avgTime}</h3>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500"><TrendingUp size={24} /></div>
            </div>
          </div>

          {/* Item Statistics Section */}
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <TrendingUp className="text-red-600" size={20} /> إحصائيات الأصناف لهذا اليوم
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Object.entries(itemStats).map(([id, data]: [string, any]) => (
                  <div key={id} className="bg-slate-900/50 p-5 rounded-[2rem] border border-white/5 space-y-4">
                    <div className="flex justify-between items-start">
                      <h5 className="text-sm font-black text-white">{data.name}</h5>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-500/5 p-2 rounded-xl border border-blue-500/10 text-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">تحضير</p>
                        <p className="text-sm font-black text-blue-500">{data.preparing}</p>
                      </div>
                      <div className="bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10 text-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">جاهز</p>
                        <p className="text-sm font-black text-emerald-500">{data.ready}</p>
                      </div>
                      <div className="bg-slate-500/5 p-2 rounded-xl border border-slate-500/10 text-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">تم التسليم</p>
                        <p className="text-sm font-black text-slate-400">{data.delivered}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(itemStats).length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20">
                    <Utensils size={40} />
                    <p className="text-xs font-black mt-2">لا توجد بيانات متاحة حالياً</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/5 shadow-xl w-full sm:w-auto">
              <button 
                onClick={() => setStatusFilter('ALL')}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black transition-all ${statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                الكل
              </button>
              <button 
                onClick={() => setStatusFilter(OrderStatus.PREPARING)}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black transition-all ${statusFilter === OrderStatus.PREPARING ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                قيد التحضير
              </button>
              <button 
                onClick={() => setStatusFilter(OrderStatus.READY)}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black transition-all ${statusFilter === OrderStatus.READY ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                جاهز
              </button>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="بحث عن طلب..." 
                className="w-full pr-12 pl-4 py-3 bg-slate-900 border border-white/5 rounded-2xl outline-none font-black text-xs text-white focus:ring-2 focus:ring-red-600 transition-all"
              />
            </div>
          </div>

          {/* Active Orders Section */}
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <PlayCircle className="text-red-600" size={20} /> الطلبات النشطة
              </h3>
              <span className="text-[10px] font-black text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                {filteredOrders.length} طلب
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map(order => {
                    const deptItems = getDepartmentItems(order);
                    const allDeptItemsReady = deptItems.every(i => i.status === OrderStatus.READY);
                    const latestPreparedAt = allDeptItemsReady 
                      ? deptItems.reduce((latest, item) => {
                          if (!item.preparedAt) return latest;
                          return !latest || new Date(item.preparedAt) > new Date(latest) ? item.preparedAt : latest;
                        }, undefined as Date | undefined)
                      : undefined;

                    return (
                      <motion.div 
                        key={`${order.id}-${selectedDeptId}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col shadow-2xl group hover:border-red-600/30 transition-all"
                      >
                        <div className="p-6 flex-1 space-y-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Hash size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">طلب #{order.orderNumber.split('-').pop()}</span>
                              </div>
                              <h4 className="text-xl font-black text-white">طاولة {tables.find(t => t.id === order.tableId)?.number || 'سفري'}</h4>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className={`flex items-center gap-1.5 text-xs font-black ${getTimeColor(order.createdAt)}`}>
                                <Timer size={14} />
                                <span>{getElapsedTime(order.createdAt, latestPreparedAt)}</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">{new Date(order.createdAt).toLocaleTimeString('ar-PS', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {deptItems.map(item => (
                              <div key={item.uniqueId} className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex justify-between items-center group/item hover:bg-slate-800 transition-all">
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-white">{item.name}</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-500">الكمية: {item.quantity}</span>
                                    {item.note && (
                                      <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <AlertCircle size={10} /> {item.note}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button 
                                  onClick={() => updateOrderItemStatus(order.id, item.uniqueId, item.status === OrderStatus.READY ? OrderStatus.PREPARING : OrderStatus.READY)}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                                    item.status === OrderStatus.READY 
                                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                                      : 'bg-slate-700 text-slate-400 hover:bg-blue-600 hover:text-white'
                                  }`}
                                >
                                  <CheckCircle2 size={20} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-800/30 border-t border-white/5 flex items-center justify-between">
                          <div className="flex -space-x-2 rtl:space-x-reverse">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">
                                {String.fromCharCode(64 + i)}
                              </div>
                            ))}
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                            deptItems.every(i => i.status === OrderStatus.READY) 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {deptItems.filter(i => i.status === OrderStatus.READY).length} / {deptItems.length} جاهز
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredOrders.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-32 flex flex-col items-center justify-center opacity-20"
                  >
                    <ChefHat size={80} strokeWidth={1} />
                    <p className="text-xl font-black mt-4 tracking-tight">لا توجد طلبات نشطة حالياً</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
