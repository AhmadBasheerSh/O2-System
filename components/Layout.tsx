
import React from 'react';
import { useApp } from '../store';
import { 
  ShoppingCart, 
  ClipboardList, 
  Grid2X2, 
  Users, 
  PieChart, 
  Power,
  Clock,
  Building2,
  MonitorPlay,
  LayoutDashboard
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

export const AppLayout: React.FC<{ 
  children: React.ReactNode; 
  activeView: string; 
  setActiveView: (view: string) => void;
}> = ({ children, activeView, setActiveView }) => {
  const { currentUser, logout, currentShift, userRole, branches } = useApp();

  const isAdmin = userRole === 'ADMIN';
  const isBranchManager = userRole === 'BRANCH_MANAGER';

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100" dir="rtl">
      <aside className="w-64 bg-slate-900 border-l border-white/5 flex flex-col p-4 shadow-2xl">
        <div className="mb-8 px-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-red-900/20">R</div>
          <h1 className="text-xl font-black text-white tracking-tight">RestoMaster</h1>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
          {isAdmin ? (
            <SidebarItem 
              icon={Building2} label="الهيكل التنظيمي" 
              active={activeView === 'org'} onClick={() => setActiveView('org')} 
            />
          ) : isBranchManager ? (
            <>
              <SidebarItem 
                icon={LayoutDashboard} label="لوحة التحكم" 
                active={activeView === 'branch_dashboard'} onClick={() => setActiveView('branch_dashboard')} 
              />
              <SidebarItem 
                icon={MonitorPlay} label="المراقبة الحية" 
                active={activeView === 'branch_live'} onClick={() => setActiveView('branch_live')} 
              />
              <SidebarItem 
                icon={ShoppingCart} label="طلبات الفرع" 
                active={activeView === 'branch_orders'} onClick={() => setActiveView('branch_orders')} 
              />
            </>
          ) : (
            <>
              <SidebarItem 
                icon={ShoppingCart} label="نقطة البيع (POS)" 
                active={activeView === 'pos'} onClick={() => setActiveView('pos')} 
              />
              <SidebarItem 
                icon={ClipboardList} label="الطلبات النشطة" 
                active={activeView === 'orders'} onClick={() => setActiveView('orders')} 
              />
              <SidebarItem 
                icon={Grid2X2} label="إدارة الطاولات" 
                active={activeView === 'tables'} onClick={() => setActiveView('tables')} 
              />
              <SidebarItem 
                icon={Users} label="العملاء" 
                active={activeView === 'customers'} onClick={() => setActiveView('customers')} 
              />
              <SidebarItem 
                icon={PieChart} label="التقارير" 
                active={activeView === 'reports'} onClick={() => setActiveView('reports')} 
              />
              <SidebarItem 
                icon={Clock} label="إدارة الشفت" 
                active={activeView === 'shift'} onClick={() => setActiveView('shift')} 
              />
            </>
          )}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-4 space-y-2">
          <div className="px-4 py-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {isAdmin ? 'الإدارة العامة' : isBranchManager ? `مدير: ${branches.find(b => b.id === currentUser?.branchId)?.name}` : 'الكاشير'}
            </p>
            <p className="text-sm font-black text-slate-100">{currentUser?.name}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <Power size={20} />
            <span className="font-semibold text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
};
