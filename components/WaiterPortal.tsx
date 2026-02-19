
import React, { useState } from 'react';
import { useApp } from '../store';
import { OrderStatus, Table } from '../types';
import { 
  Users, 
  LayoutGrid, 
  Wallet, 
  Plus, 
  Bell, 
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export const WaiterPortal: React.FC = () => {
  const { 
    currentUser, tables, activeOrders, setSelectedTable, logout 
  } = useApp();
  const [activeTab, setActiveTab] = useState<'tables' | 'finance' | 'notifications'>('tables');

  // Waiter stats
  const waiterOrders = activeOrders.filter(o => o.waiterId === currentUser?.id);
  const totalSales = waiterOrders.filter(o => o.status === OrderStatus.DELIVERED).reduce((acc, o) => acc + o.total, 0);
  const totalCommission = totalSales * (currentUser?.commissionRate || 0);

  const renderTables = () => (
    <div className="p-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800">إدارة الطاولات</h2>
          <p className="text-slate-500">اختر طاولة لفتح طلب جديد أو تعديل طلب نشط</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold border border-green-100">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             متاح للخدمة
           </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => setSelectedTable(table)}
            className={`aspect-square rounded-[2rem] p-6 border-2 flex flex-col items-center justify-center gap-3 transition-all group relative overflow-hidden ${
              table.status === 'OCCUPIED' 
                ? 'bg-slate-800 border-slate-800 text-white shadow-xl' 
                : 'bg-white border-slate-100 hover:border-orange-500 text-slate-700 shadow-sm'
            }`}
          >
            <span className="text-3xl font-black">#{table.number}</span>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
              table.status === 'OCCUPIED' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {table.status === 'OCCUPIED' ? 'مشغولة' : `${table.capacity} مقاعد`}
            </span>
            {table.status === 'OCCUPIED' && (
              <div className="absolute top-2 left-2">
                <Clock size={12} className="text-orange-300" />
              </div>
            )}
            <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform ${table.status === 'OCCUPIED' ? 'text-white' : 'text-slate-200'}`}>
              <Users size={80} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-800">السجل المالي</h2>
        <p className="text-slate-500">تتبع مبيعاتك وعمولاتك لليوم</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <TrendingUp className="text-blue-500 mb-6" size={32} />
          <div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">مبيعاتي اليوم</p>
            <p className="text-3xl font-black text-slate-800">{totalSales.toFixed(2)} ₪</p>
          </div>
        </div>
        <div className="bg-orange-500 text-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-100 flex flex-col justify-between">
          <Wallet className="opacity-80 mb-6" size={32} />
          <div>
            <p className="opacity-70 text-sm font-bold uppercase tracking-wider mb-1">إجمالي العمولات</p>
            <p className="text-3xl font-black">{totalCommission.toFixed(2)} ₪</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between">
          <Clock className="opacity-80 mb-6" size={32} />
          <div>
            <p className="opacity-70 text-sm font-bold uppercase tracking-wider mb-1">ساعات العمل</p>
            <p className="text-3xl font-black">06:45</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800">تفاصيل المبيعات</h3>
          <button className="text-sm font-bold text-orange-500">تحميل التقرير</button>
        </div>
        <div className="divide-y divide-slate-50">
          {waiterOrders.map(order => (
            <div key={order.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                   <LayoutGrid size={24} />
                </div>
                <div>
                   <p className="font-bold text-slate-800">طاولة #{order.tableId?.replace('t-', '')}</p>
                   <p className="text-xs text-slate-400">طلب #{order.orderNumber} • {new Date(order.createdAt).toLocaleTimeString('ar-EG')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-slate-800">{order.total} ₪</p>
                <p className="text-[10px] font-bold text-green-500 flex items-center gap-1 justify-end">
                  <ArrowUpRight size={10} /> عمولة: {(order.total * (currentUser?.commissionRate || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          {waiterOrders.length === 0 && <p className="p-10 text-center text-slate-400 font-medium">لم يتم تسجيل مبيعات بعد</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
       {/* Sidebar */}
       <aside className="w-72 bg-white border-l border-slate-100 flex flex-col p-8">
          <div className="mb-12 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">W</div>
            <h1 className="text-2xl font-black text-slate-800">Smart Waiter</h1>
          </div>

          <nav className="flex-1 space-y-3">
             <button 
                onClick={() => setActiveTab('tables')}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === 'tables' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
                }`}
             >
                <div className="flex items-center gap-3"><LayoutGrid size={20} /> الطاولات</div>
                <ChevronRight size={16} className={activeTab === 'tables' ? 'rotate-90' : ''} />
             </button>
             <button 
                onClick={() => setActiveTab('finance')}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === 'finance' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
                }`}
             >
                <div className="flex items-center gap-3"><Wallet size={20} /> السجل المالي</div>
                <ChevronRight size={16} className={activeTab === 'finance' ? 'rotate-90' : ''} />
             </button>
             <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === 'notifications' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
                }`}
             >
                <div className="flex items-center gap-3"><Bell size={20} /> التنبيهات</div>
                <div className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">3</div>
             </button>
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-100">
             <div className="flex items-center gap-3 px-4 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold">
                  {currentUser?.name.charAt(0)}
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-800">{currentUser?.name}</p>
                   <p className="text-[10px] text-slate-400 uppercase font-black">قرصون ذكي</p>
                </div>
             </div>
             <button 
               onClick={logout}
               className="w-full py-4 text-red-500 bg-red-50 rounded-2xl font-bold hover:bg-red-100 transition-colors"
             >
               تسجيل الخروج
             </button>
          </div>
       </aside>

       {/* Content */}
       <main className="flex-1 overflow-auto bg-slate-50">
          {activeTab === 'tables' && renderTables()}
          {activeTab === 'finance' && renderFinance()}
          {activeTab === 'notifications' && <div className="p-10 text-center text-slate-400">لا يوجد تنبيهات جديدة</div>}
       </main>
    </div>
  );
};
