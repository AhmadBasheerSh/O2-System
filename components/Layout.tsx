
import React, { useState } from 'react';
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
  LayoutDashboard,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Menu,
  Receipt,
  HeartHandshake,
  MessageSquare,
  ListTodo,
  Activity,
  Plus,
  Utensils,
  ChefHat
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, collapsed, onClick }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    } ${collapsed ? 'justify-center px-0' : ''}`}
  >
    <Icon size={20} />
    {!collapsed && <span className="font-semibold text-sm whitespace-nowrap overflow-hidden">{label}</span>}
  </button>
);

export const AppLayout: React.FC<{ 
  children: React.ReactNode; 
  activeView: string; 
  setActiveView: (view: string) => void;
}> = ({ children, activeView, setActiveView }) => {
  const { currentUser, logout, currentShift, userRole, branches } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = userRole === 'ADMIN';
  const isBranchManager = userRole === 'BRANCH_MANAGER';
  const isHospitality = userRole === 'HOSPITALITY';
  const isDeptStaff = userRole === 'DEPARTMENT_STAFF';
  const isAggregator = userRole === 'ORDER_AGGREGATOR';

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100" dir="rtl">
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 border-l border-white/5 flex flex-col p-4 shadow-2xl transition-all duration-300 relative`}>
        <div className={`mb-8 flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-4'}`}>
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-red-900/20 shrink-0">R</div>
          {!isCollapsed && <h1 className="text-xl font-black text-white tracking-tight">RestoMaster</h1>}
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-3 top-20 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50"
        >
          {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
          {isAdmin ? (
            <SidebarItem 
              icon={Building2} label="الهيكل التنظيمي" 
              active={activeView === 'org'} collapsed={isCollapsed} onClick={() => setActiveView('org')} 
            />
          ) : isBranchManager ? (
            <>
              <SidebarItem 
                icon={LayoutDashboard} label="لوحة التحكم" 
                active={activeView === 'branch_dashboard'} collapsed={isCollapsed} onClick={() => setActiveView('branch_dashboard')} 
              />
              <SidebarItem 
                icon={MonitorPlay} label="المراقبة الحية" 
                active={activeView === 'branch_live'} collapsed={isCollapsed} onClick={() => setActiveView('branch_live')} 
              />
              <SidebarItem 
                icon={ShoppingCart} label="طلبات الفرع" 
                active={activeView === 'branch_orders'} collapsed={isCollapsed} onClick={() => setActiveView('branch_orders')} 
              />
            </>
          ) : isHospitality ? (
            <>
              <SidebarItem 
                icon={Grid2X2} label="إدارة الطاولات" 
                active={activeView === 'hospitality_tables'} collapsed={isCollapsed} onClick={() => setActiveView('hospitality_tables')} 
              />
              <SidebarItem 
                icon={Plus} label="إنشاء طلب" 
                active={activeView === 'hospitality_pos'} collapsed={isCollapsed} onClick={() => setActiveView('hospitality_pos')} 
              />
              <SidebarItem 
                icon={Activity} label="طلبات جديدة" 
                active={activeView === 'hospitality_new_orders'} collapsed={isCollapsed} onClick={() => setActiveView('hospitality_new_orders')} 
              />
              <SidebarItem 
                icon={Utensils} label="تتبع الطلبات" 
                active={activeView === 'hospitality_tracking'} collapsed={isCollapsed} onClick={() => setActiveView('hospitality_tracking')} 
              />
              <SidebarItem 
                icon={MessageSquare} label="الشكاوي والملاحظات" 
                active={activeView === 'hospitality_feedback'} collapsed={isCollapsed} onClick={() => setActiveView('hospitality_feedback')} 
              />
              <SidebarItem 
                icon={ListTodo} label="المهام والجداول" 
                active={activeView === 'hospitality_tasks'} collapsed={isCollapsed} onClick={() => setActiveView('hospitality_tasks')} 
              />
              <SidebarItem 
                icon={ChefHat} label="شاشة الأقسام" 
                active={activeView === 'departments'} collapsed={isCollapsed} onClick={() => setActiveView('departments')} 
              />
            </>
          ) : isDeptStaff ? (
            <>
              <SidebarItem 
                icon={ChefHat} label="لوحة تحكم القسم" 
                active={activeView === 'departments'} collapsed={isCollapsed} onClick={() => setActiveView('departments')} 
              />
            </>
          ) : isAggregator ? (
            <>
              <SidebarItem 
                icon={Grid2X2} label="لوحة التجميع" 
                active={activeView === 'aggregator_dashboard'} collapsed={isCollapsed} onClick={() => setActiveView('aggregator_dashboard')} 
              />
              <SidebarItem 
                icon={LayoutGrid} label="شبكة الرفوف" 
                active={activeView === 'aggregator_shelves'} collapsed={isCollapsed} onClick={() => setActiveView('aggregator_shelves')} 
              />
            </>
          ) : (
            <>
              <SidebarItem 
                icon={ShoppingCart} label="نقطة البيع (POS)" 
                active={activeView === 'pos'} collapsed={isCollapsed} onClick={() => setActiveView('pos')} 
              />
              <SidebarItem 
                icon={ClipboardList} label="الطلبات النشطة" 
                active={activeView === 'orders'} collapsed={isCollapsed} onClick={() => setActiveView('orders')} 
              />
              <SidebarItem 
                icon={Grid2X2} label="إدارة الطاولات" 
                active={activeView === 'tables'} collapsed={isCollapsed} onClick={() => setActiveView('tables')} 
              />
              <SidebarItem 
                icon={Receipt} label="التقارير المالية" 
                active={activeView === 'finance'} collapsed={isCollapsed} onClick={() => setActiveView('finance')} 
              />
              <SidebarItem 
                icon={PieChart} label="التقارير" 
                active={activeView === 'reports'} collapsed={isCollapsed} onClick={() => setActiveView('reports')} 
              />
              <SidebarItem 
                icon={Clock} label="إدارة الشفت" 
                active={activeView === 'shift'} collapsed={isCollapsed} onClick={() => setActiveView('shift')} 
              />
            </>
          )}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-4 space-y-2">
          {!isCollapsed && (
            <div className="px-4 py-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
                {isAdmin ? 'الإدارة العامة' : isBranchManager ? `مدير: ${branches.find(b => b.id === currentUser?.branchId)?.name}` : isHospitality ? 'قسم الضيافة' : isDeptStaff ? 'موظف قسم' : isAggregator ? 'مجمع طلبات' : 'الكاشير'}
              </p>
              <p className="text-sm font-black text-slate-100 truncate">{currentUser?.name}</p>
            </div>
          )}
          <button 
            onClick={logout}
            title={isCollapsed ? "تسجيل الخروج" : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <Power size={20} />
            {!isCollapsed && <span className="font-semibold text-sm">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-hidden">
        <div className="h-full p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
