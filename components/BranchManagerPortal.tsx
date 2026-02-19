
import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { 
  BarChart3, 
  Users2, 
  MonitorPlay, 
  ClipboardList, 
  TrendingUp, 
  Users, 
  Clock, 
  Store,
  MapPin,
  Smartphone,
  CheckCircle2,
  XCircle,
  MoreVertical,
  LayoutDashboard,
  Search
} from 'lucide-react';
import { OrderStatus, OrderType } from '../types';

export const BranchManagerPortal: React.FC = () => {
  const { currentUser, employees, activeOrders, branches, departments, jobTitles } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'live'>('dashboard');

  const myBranch = useMemo(() => branches.find(b => b.id === currentUser?.branchId), [branches, currentUser]);
  const branchEmployees = useMemo(() => employees.filter(e => e.branchId === currentUser?.branchId), [employees, currentUser]);
  const branchOrders = useMemo(() => activeOrders.filter(o => o.branchId === currentUser?.branchId), [activeOrders, currentUser]);

  const stats = useMemo(() => {
    const todayOrders = branchOrders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
    const totalSales = todayOrders.filter(o => o.status === OrderStatus.DELIVERED).reduce((acc, o) => acc + o.total, 0);
    const activeCount = todayOrders.filter(o => ![OrderStatus.DELIVERED, OrderStatus.CANCELED].includes(o.status)).length;
    
    return {
      sales: totalSales,
      ordersCount: todayOrders.length,
      activeOrders: activeCount,
      staffCount: branchEmployees.length
    };
  }, [branchOrders, branchEmployees]);

  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'مبيعات اليوم', value: `${stats.sales.toFixed(2)} ₪`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'إجمالي الطلبات', value: stats.ordersCount, icon: ClipboardList, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'طلبات نشطة', value: stats.activeOrders, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'طاقم العمل', value: stats.staffCount, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' }
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col justify-between group hover:border-red-600/30 transition-all">
            <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-[1.4rem] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
              <s.icon size={28} />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-4xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl overflow-hidden relative">
          <div className="flex justify-between items-center mb-8 relative z-10">
             <h3 className="text-2xl font-black text-white">آخر نشاطات الفرع</h3>
             <button onClick={() => setActiveTab('live')} className="text-xs font-black text-red-500 border-b-2 border-red-500 pb-1">عرض جميع الطلبات</button>
          </div>
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-right">
              <thead>
                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                  <th className="pb-5">رقم الطلب</th>
                  <th className="pb-5">نوع الخدمة</th>
                  <th className="pb-5 text-center">حالة الطلب</th>
                  <th className="pb-5 text-left">القيمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {branchOrders.slice(0, 6).map(order => (
                  <tr key={order.id} className="group hover:bg-white/5 transition-all">
                    <td className="py-5 font-black text-white text-base">#{order.orderNumber.slice(-4)}</td>
                    <td className="py-5 text-xs font-bold text-slate-400">
                      {order.type === OrderType.DELIVERY ? 'توصيل منزلي' : 'خدمة صالة'}
                    </td>
                    <td className="py-5 flex justify-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                        order.status === OrderStatus.DELIVERED ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>{order.status}</span>
                    </td>
                    <td className="py-5 text-left font-black text-slate-100">{order.total.toFixed(2)} ₪</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-red-600/5 rounded-full -z-0"></div>
        </div>

        <div className="bg-red-600 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black mb-8 relative z-10">بيانات الفرع</h3>
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/20 rounded-[1.5rem] flex items-center justify-center shadow-lg"><Store size={28} /></div>
                <div><p className="text-[10px] opacity-60 font-black uppercase tracking-widest mb-1">الفرع المخصص</p><p className="font-black text-lg">{myBranch?.name}</p></div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/20 rounded-[1.5rem] flex items-center justify-center shadow-lg"><MapPin size={28} /></div>
                <div><p className="text-[10px] opacity-60 font-black uppercase tracking-widest mb-1">الموقع الميداني</p><p className="font-bold text-sm leading-relaxed">{myBranch?.address}</p></div>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-white/20 relative z-10">
             <p className="text-[10px] opacity-60 font-black uppercase tracking-widest mb-2">رقم التواصل المباشر</p>
             <p className="text-2xl font-black">{myBranch?.phone}</p>
          </div>
          <MonitorPlay className="absolute -right-16 -bottom-16 w-64 h-64 text-white/10 -rotate-12" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-24 text-slate-100">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">إدارة فرع: {myBranch?.name}</h2>
          <p className="text-slate-500 font-bold mt-2">متابعة العمليات اليومية وإحصائيات الأداء الميداني</p>
        </div>
        <div className="flex bg-slate-900 p-2 rounded-[2rem] shadow-2xl border border-white/5">
           <button onClick={() => setActiveTab('dashboard')} className={`px-8 py-3.5 rounded-[1.5rem] font-black text-sm flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-xl shadow-red-900/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-100'}`}><LayoutDashboard size={20}/> الرئيسية</button>
           <button onClick={() => setActiveTab('employees')} className={`px-8 py-3.5 rounded-[1.5rem] font-black text-sm flex items-center gap-3 transition-all ${activeTab === 'employees' ? 'bg-red-600 text-white shadow-xl shadow-red-900/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-100'}`}><Users2 size={20}/> طاقم العمل</button>
           <button onClick={() => setActiveTab('live')} className={`px-8 py-3.5 rounded-[1.5rem] font-black text-sm flex items-center gap-3 transition-all ${activeTab === 'live' ? 'bg-red-600 text-white shadow-xl shadow-red-900/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-100'}`}><MonitorPlay size={20}/> المراقبة</button>
        </div>
      </header>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700">
          {branchEmployees.map(emp => (
            <div key={emp.id} className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 shadow-2xl group hover:border-red-600/40 transition-all">
               <div className="flex gap-5 items-center mb-8">
                 <div className="w-18 h-18 bg-slate-800 rounded-[1.8rem] flex items-center justify-center text-slate-600 font-black text-2xl group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner">{emp.name.charAt(0)}</div>
                 <div>
                    <h4 className="font-black text-white text-lg">{emp.name}</h4>
                    <p className="text-xs font-black text-red-500 uppercase tracking-widest">{jobTitles.find(jt => jt.id === emp.jobTitleId)?.name}</p>
                 </div>
               </div>
               <div className="space-y-4 pt-6 border-t border-white/5">
                 <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">القسم الوظيفي:</span><span className="font-black text-slate-300">{departments.find(d => d.id === emp.departmentId)?.name}</span></div>
                 <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">حالة الدوام:</span><span className="font-black text-green-500">نشط الآن</span></div>
               </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'live' && (
        <div className="bg-slate-900 p-32 rounded-[4rem] text-center border border-white/5 shadow-2xl animate-in fade-in duration-500">
           <MonitorPlay size={80} className="text-slate-800 mx-auto mb-8 animate-pulse" />
           <h3 className="text-3xl font-black text-white mb-4">نظام المراقبة الحية</h3>
           <p className="text-slate-500 font-bold max-w-md mx-auto">بث حي لكافة طلبات الفرع قيد التنفيذ بالمطبخ والصالة.</p>
        </div>
      )}
    </div>
  );
};
