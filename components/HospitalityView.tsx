import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { TableStatus, OrderStatus, CustomerFeedback, StaffTask } from '../types';
import { DEPARTMENTS } from '../constants';
import { 
  Users, Utensils, MessageSquare, ClipboardList, 
  Map as MapIcon, CheckCircle2, AlertCircle, 
  Star, Plus, Search, Filter, UserPlus, Hash, FileText, Trash2, Edit3,
  Calendar, Clock, LayoutGrid, List, Bell, HeartHandshake, PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TablesView } from './Tables';

export const HospitalityView: React.FC<{ 
  initialTab?: 'tables' | 'new_orders' | 'tracking' | 'feedback' | 'tasks',
  setActiveView?: (view: string) => void
}> = ({ initialTab = 'tables', setActiveView }) => {
  const { 
    tables, activeOrders, employees, feedbacks, addFeedback, 
    staffTasks, addTask, updateTask, tableAssignments, assignTable,
    confirmOrder, voidOrder, deliverOrder, updateOrderStatus, loadOrderToPOS,
    notifications, markNotificationRead
  } = useApp();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [trackingFilter, setTrackingFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Filter employees for hospitality roles
  const hospitalityStaff = employees.filter(e => e.role === 'WAITER' || e.role === 'MANAGER');

  const [newFeedback, setNewFeedback] = useState({
    customerName: '',
    type: 'COMPLAINT' as const,
    category: 'SERVICE' as const,
    rating: 5,
    comment: ''
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'MEDIUM' as const,
    dueDate: new Date().toISOString().split('T')[0]
  });

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    addFeedback(newFeedback);
    setNewFeedback({ customerName: '', type: 'COMPLAINT', category: 'SERVICE', rating: 5, comment: '' });
    setShowFeedbackModal(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      ...newTask,
      dueDate: new Date(newTask.dueDate)
    });
    setNewTask({ title: '', description: '', assignedTo: '', priority: 'MEDIUM', dueDate: new Date().toISOString().split('T')[0] });
    setShowTaskModal(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6 bg-slate-950 p-4 sm:p-6 lg:p-8 rounded-[3rem] overflow-hidden">
      {/* Header with Notifications */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/20 rotate-3">
            <HeartHandshake size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">قسم الضيافة</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إدارة الخدمة والزبائن</p>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-4 rounded-2xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all relative"
          >
            <Bell size={24} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-3 right-3 w-3 h-3 bg-red-600 rounded-full border-2 border-slate-950 animate-bounce" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 mt-4 w-80 bg-slate-900 rounded-[2rem] border border-white/10 shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                  <h4 className="text-sm font-black text-white">التنبيهات</h4>
                  <span className="text-[10px] font-black text-slate-500">{notifications.length} تنبيه</span>
                </div>
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-slate-800/50 ${!n.read ? 'bg-red-600/5' : ''}`}
                      >
                        <p className={`text-xs font-bold ${!n.read ? 'text-white' : 'text-slate-400'}`}>{n.message}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{n.time.toLocaleTimeString('ar-PS')}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center opacity-20">
                      <Bell size={32} className="mx-auto mb-2" />
                      <p className="text-xs font-black">لا توجد تنبيهات</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'tables' && (
            <motion.div 
              key="tables"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <TablesView onSelect={() => setActiveView?.('hospitality_pos')} />
            </motion.div>
          )}

          {activeTab === 'new_orders' && (
            <motion.div 
              key="new_orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-white">طلبات الزبائن الجديدة (QR)</h3>
                <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                  <span className="text-xs font-black text-orange-500">بانتظار المراجعة والتأكيد</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeOrders.filter(o => o.status === OrderStatus.PENDING_CONFIRMATION).map(order => (
                    <div key={order.id} className="bg-slate-900 rounded-[2.5rem] border border-white/5 shadow-2xl hover:border-orange-500/30 transition-all group overflow-hidden flex flex-col">
                      <div className="p-6 flex-1 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Hash size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">طلب QR</span>
                            </div>
                            <p className="text-xl font-black text-white">#{order.orderNumber.split('-').pop()}</p>
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-black">
                            بانتظار التأكيد
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-slate-500 mb-2">
                            <ClipboardList size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">الأصناف</span>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                            {order.items.map(item => (
                              <div key={item.uniqueId} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-2xl border border-white/5">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-200">{item.name}</span>
                                    {item.departmentId && (
                                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 border border-white/5">
                                        {DEPARTMENTS.find(d => d.id === item.departmentId)?.name}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500">الكمية: {item.quantity}</span>
                                </div>
                                <span className="text-xs font-black text-white">{(item.price * item.quantity).toFixed(2)} ₪</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Clock size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">الوقت</span>
                            </div>
                            <p className="text-xs font-black text-slate-300">{new Date(order.createdAt).toLocaleTimeString('ar-PS')}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <MapIcon size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">الموقع</span>
                            </div>
                            <p className="text-xs font-black text-slate-300">طاولة {tables.find(t => t.id === order.tableId)?.number || 'سفري'}</p>
                          </div>
                        </div>

                        {order.note && (
                          <div className="pt-4 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                              <FileText size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">الملاحظة</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 bg-slate-800/30 p-3 rounded-xl border border-white/5 italic">
                              "{order.note}"
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-6 border-t border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الإجمالي</span>
                          <p className="text-2xl font-black text-red-600">{order.total.toFixed(2)} <span className="text-sm">₪</span></p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-800/30 border-t border-white/5 flex gap-2">
                        <button 
                          onClick={() => voidOrder(order.id)}
                          className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                          title="رفض الطلب"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            loadOrderToPOS(order);
                            setActiveView?.('hospitality_pos');
                          }}
                          className="flex-1 bg-slate-800 border border-white/5 text-slate-300 py-3 rounded-xl font-black text-xs hover:bg-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <Edit3 size={16} /> تعديل
                        </button>
                        <button 
                          onClick={() => confirmOrder(order.id)}
                          className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 active:scale-95"
                        >
                          <CheckCircle2 size={16} /> تأكيد
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {activeOrders.filter(o => o.status === OrderStatus.PENDING_CONFIRMATION).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-20">
                    <ClipboardList size={64} />
                    <p className="text-lg font-black mt-4">لا توجد طلبات جديدة بانتظار التأكيد</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'tracking' && (
            <motion.div 
              key="tracking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-white">تتبع الطلبات النشطة</h3>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 shadow-xl">
                  <button 
                    onClick={() => setTrackingFilter('ALL')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${trackingFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    الكل
                  </button>
                  <button 
                    onClick={() => setTrackingFilter(OrderStatus.CONFIRMED)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${trackingFilter === OrderStatus.CONFIRMED ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    تم التأكيد
                  </button>
                  <button 
                    onClick={() => setTrackingFilter(OrderStatus.PREPARING)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${trackingFilter === OrderStatus.PREPARING ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    قيد التجهيز
                  </button>
                  <button 
                    onClick={() => setTrackingFilter(OrderStatus.READY)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${trackingFilter === OrderStatus.READY ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    جاهز
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeOrders
                    .filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELED && o.status !== OrderStatus.PENDING_CONFIRMATION)
                    .filter(o => trackingFilter === 'ALL' || o.status === trackingFilter)
                    .map(order => (
                    <div key={order.id} className="bg-slate-900 rounded-[2.5rem] border border-white/5 shadow-2xl hover:border-red-600/30 transition-all group overflow-hidden flex flex-col">
                      <div className="p-6 flex-1 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Hash size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">رقم الطلب</span>
                            </div>
                            <p className="text-xl font-black text-white">#{order.orderNumber.split('-').pop()}</p>
                          </div>
                          <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black flex items-center gap-2 ${
                            order.status === OrderStatus.READY ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            order.status === OrderStatus.PREPARING ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            order.status === OrderStatus.CONFIRMED ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-slate-500/10 text-slate-500 border-white/5'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              order.status === OrderStatus.READY || order.status === OrderStatus.PREPARING ? 'animate-pulse' : ''
                            } ${
                              order.status === OrderStatus.READY ? 'bg-emerald-500' :
                              order.status === OrderStatus.PREPARING ? 'bg-blue-500' :
                              order.status === OrderStatus.CONFIRMED ? 'bg-orange-500' : 'bg-slate-500'
                            }`} />
                            {order.status === OrderStatus.READY ? 'جاهز للتسليم' : 
                             order.status === OrderStatus.PREPARING ? 'قيد التجهيز' : 
                             order.status === OrderStatus.CONFIRMED ? 'تم التأكيد' : 'معلق'}
                          </div>
                          {order.shelfLocation && (
                            <div className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg shadow-emerald-900/20">
                              <LayoutGrid size={12} />
                              الرف: {order.shelfLocation}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-slate-500 mb-2">
                            <ClipboardList size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">الأصناف</span>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                            {order.items.map(item => (
                              <div key={item.uniqueId} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-2xl border border-white/5">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-200">{item.name}</span>
                                    {item.departmentId && (
                                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 border border-white/5">
                                        {DEPARTMENTS.find(d => d.id === item.departmentId)?.name}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500">الكمية: {item.quantity}</span>
                                </div>
                                <span className="text-xs font-black text-white">{(item.price * item.quantity).toFixed(2)} ₪</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Clock size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">الوقت</span>
                            </div>
                            <p className="text-xs font-black text-slate-300">{new Date(order.createdAt).toLocaleTimeString('ar-PS')}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <MapIcon size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">الموقع</span>
                            </div>
                            <p className="text-xs font-black text-slate-300">طاولة {tables.find(t => t.id === order.tableId)?.number || 'سفري'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-800/30 border-t border-white/5 flex gap-2">
                        {order.status === OrderStatus.READY && (
                          <button 
                            onClick={() => deliverOrder(order.id)}
                            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 active:scale-95"
                          >
                            <CheckCircle2 size={16} /> تسليم الطلب
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            loadOrderToPOS(order);
                            setActiveView?.('hospitality_pos');
                          }}
                          className="flex-1 bg-slate-800 border border-white/5 text-slate-300 py-3 rounded-xl font-black text-xs hover:bg-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <Edit3 size={16} /> تعديل الطلب
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {activeOrders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELED && o.status !== OrderStatus.PENDING_CONFIRMATION).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-20">
                    <Utensils size={64} />
                    <p className="text-lg font-black mt-4">لا توجد طلبات نشطة حالياً</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'feedback' && (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col space-y-6"
            >
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black text-white">سجل الشكاوي والملاحظات</h3>
                 <button 
                  onClick={() => setShowFeedbackModal(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-red-900/20 flex items-center gap-2 hover:bg-red-700 transition-all active:scale-95"
                 >
                   <Plus size={18} /> تسجيل ملاحظة جديدة
                 </button>
              </div>

              <div className="flex-1 bg-slate-900/50 rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1 custom-scrollbar p-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {feedbacks.map(fb => (
                        <div key={fb.id} className="bg-slate-900 p-6 rounded-3xl border border-white/5 space-y-4">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                   fb.type === 'COMPLAINT' ? 'bg-red-500/10 text-red-500' :
                                   fb.type === 'SUGGESTION' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                                 }`}>
                                    {fb.type === 'COMPLAINT' ? <AlertCircle size={20} /> : <Star size={20} />}
                                 </div>
                                 <div>
                                    <h5 className="font-black text-white">{fb.customerName}</h5>
                                    <p className="text-[10px] font-bold text-slate-500">{fb.timestamp.toLocaleString('ar-PS')}</p>
                                 </div>
                              </div>
                              <div className="flex gap-0.5">
                                 {[1,2,3,4,5].map(s => (
                                   <Star key={s} size={12} className={s <= fb.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'} />
                                 ))}
                              </div>
                           </div>
                           <p className="text-sm font-bold text-slate-300 leading-relaxed">"{fb.comment}"</p>
                           <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{fb.category}</span>
                              <div className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                fb.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                              }`}>
                                {fb.status === 'NEW' ? 'جديد' : fb.status === 'REVIEWED' ? 'تمت المراجعة' : 'تم الحل'}
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col space-y-6"
            >
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black text-white">توزيع المهام والجداول</h3>
                 <button 
                  onClick={() => setShowTaskModal(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-red-900/20 flex items-center gap-2 hover:bg-red-700 transition-all active:scale-95"
                 >
                   <Plus size={18} /> إضافة مهمة
                 </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                 {/* Staff List */}
                 <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-white/5 space-y-6 overflow-y-auto custom-scrollbar">
                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">طاقم الضيافة</h4>
                    <div className="space-y-3">
                       {hospitalityStaff.map(staff => (
                         <div key={staff.id} className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600 font-black">
                               {staff.name.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-black text-white">{staff.name}</p>
                               <p className="text-[10px] font-bold text-slate-500">{staff.role === 'WAITER' ? 'جرسون' : 'مدير صالة'}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                  {/* Tasks & Schedule List */}
                  <div className="lg:col-span-2 bg-slate-900/50 rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col">
                     <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900">
                        <div>
                          <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">المهام والجداول اليومية</h4>
                          <p className="text-[10px] font-bold text-slate-600 mt-1">تنظيم وتوزيع العمل لليوم</p>
                        </div>
                        <div className="flex gap-2">
                           <div className="flex bg-slate-800 p-1 rounded-xl">
                              <button className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-black shadow-lg">المهام</button>
                              <button className="px-4 py-1.5 text-slate-500 rounded-lg text-[10px] font-black hover:text-slate-300">الجدول</button>
                           </div>
                        </div>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <div className="space-y-4">
                           {staffTasks.map(task => (
                             <div key={task.id} className="bg-slate-900 p-5 rounded-3xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-red-600/20 transition-all">
                                <div className="flex items-start gap-4">
                                   <div className={`mt-1 w-2 h-2 rounded-full ${
                                     task.priority === 'URGENT' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                     task.priority === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'
                                   }`} />
                                   <div>
                                      <h5 className="font-black text-white group-hover:text-red-500 transition-colors">{task.title}</h5>
                                      <p className="text-xs font-bold text-slate-500">{task.description}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                                   <div className="flex flex-col items-end">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-black text-slate-300">{hospitalityStaff.find(s => s.id === task.assignedTo)?.name}</span>
                                        <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-500">{new Date(task.dueDate).toLocaleDateString('ar-PS')}</span>
                                   </div>
                                   <button 
                                     onClick={() => updateTask(task.id, { status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' })}
                                     className={`p-2.5 rounded-xl transition-all ${
                                       task.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-white border border-white/5'
                                     }`}
                                   >
                                     <CheckCircle2 size={20} />
                                   </button>
                                </div>
                             </div>
                           ))}
                           {staffTasks.length === 0 && (
                             <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                <ClipboardList size={48} />
                                <p className="text-sm font-black mt-4">لا توجد مهام حالية</p>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFeedbackModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/5">
                <h3 className="text-2xl font-black text-white">تسجيل ملاحظة زبون</h3>
              </div>
              <form onSubmit={handleAddFeedback} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">اسم الزبون</label>
                  <input type="text" required value={newFeedback.customerName} onChange={e => setNewFeedback({...newFeedback, customerName: e.target.value})} className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">النوع</label>
                    <select value={newFeedback.type} onChange={e => setNewFeedback({...newFeedback, type: e.target.value as any})} className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-white">
                      <option value="COMPLAINT">شكوى</option>
                      <option value="SUGGESTION">اقتراح</option>
                      <option value="COMPLIMENT">ثناء</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">التقييم</label>
                    <select value={newFeedback.rating} onChange={e => setNewFeedback({...newFeedback, rating: parseInt(e.target.value)})} className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-white">
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} نجوم</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">الملاحظة</label>
                  <textarea required value={newFeedback.comment} onChange={e => setNewFeedback({...newFeedback, comment: e.target.value})} className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-white h-32 resize-none" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-red-900/20 hover:bg-red-700 transition-all active:scale-95">حفظ الملاحظة</button>
                  <button type="button" onClick={() => setShowFeedbackModal(false)} className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black text-sm border border-white/5 hover:bg-slate-700 transition-all">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTaskModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/5">
                <h3 className="text-2xl font-black text-white">إضافة مهمة جديدة</h3>
              </div>
              <form onSubmit={handleAddTask} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">عنوان المهمة</label>
                  <input type="text" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">المسؤول</label>
                  <select required value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})} className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-white">
                    <option value="">اختر موظفاً...</option>
                    {hospitalityStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">الأولوية</label>
                    <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})} className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-white">
                      <option value="LOW">منخفضة</option>
                      <option value="MEDIUM">متوسطة</option>
                      <option value="HIGH">عالية</option>
                      <option value="URGENT">عاجلة</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">تاريخ الاستحقاق</label>
                    <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">الوصف</label>
                  <textarea required value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-white h-24 resize-none" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-red-900/20 hover:bg-red-700 transition-all active:scale-95">حفظ المهمة</button>
                  <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black text-sm border border-white/5 hover:bg-slate-700 transition-all">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
