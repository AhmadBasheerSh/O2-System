
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store';
import { AppLayout } from './components/Layout';
import { Login } from './components/Login';
import { POS } from './components/POS';
import { TablesView } from './components/Tables';
import { OrdersView } from './components/Orders';
import { HospitalityView } from './components/HospitalityView';
import { FinanceReports } from './components/FinanceReports';
import { ShiftView } from './components/Shift';
import { CustomerPortal } from './components/CustomerPortal';
import { OrgStructure } from './components/OrgStructure';
import { BranchManagerPortal } from './components/BranchManagerPortal';
import { DepartmentView } from './components/DepartmentView';
import { OrderAggregatorDashboard } from './components/OrderAggregatorDashboard';
import { ShelfGridView } from './components/ShelfGridView';

const Main: React.FC = () => {
  const { currentUser, currentShift, userRole, editingOrderId } = useApp();
  const [activeView, setActiveView] = useState('pos');

  useEffect(() => {
    if (userRole === 'ADMIN') {
      setActiveView('org');
    } else if (userRole === 'BRANCH_MANAGER') {
      setActiveView('branch_dashboard');
    } else if (userRole === 'HOSPITALITY') {
      setActiveView('hospitality_tables');
    } else if (userRole === 'DEPARTMENT_STAFF') {
      setActiveView('departments');
    } else if (userRole === 'ORDER_AGGREGATOR') {
      setActiveView('aggregator_dashboard');
    } else if (editingOrderId) {
      setActiveView('pos');
    }
  }, [userRole, editingOrderId]);

  if (!currentUser) return <Login />;
  if (userRole === 'CUSTOMER') return <CustomerPortal />;

  const showContent = () => {
    const isAdmin = userRole === 'ADMIN';
    const isBranchManager = userRole === 'BRANCH_MANAGER';
    const isHospitality = userRole === 'HOSPITALITY';
    const isDeptStaff = userRole === 'DEPARTMENT_STAFF';
    const isAggregator = userRole === 'ORDER_AGGREGATOR';

    // Branch Managers, Super Admins, Hospitality, and Dept Staff bypass shift check
    if (!currentShift && !isAdmin && !isBranchManager && !isHospitality && !isDeptStaff && !isAggregator && activeView !== 'shift') {
      return (
        <div className="h-full flex flex-col items-center justify-center space-y-6 bg-white rounded-[3rem] shadow-sm">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shadow-inner">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="text-center max-w-sm px-6">
            <h3 className="text-3xl font-black text-slate-800">تنبيه: الشفت مغلق</h3>
            <p className="text-slate-500 mt-2 font-medium">يجب فتح شفت جديد وتسجيل الرصيد الافتتاحي لبدء استقبال الطلبات.</p>
          </div>
          <button 
            onClick={() => setActiveView('shift')}
            className="px-12 py-4 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-100"
          >
            فتح شفت العمل الآن
          </button>
        </div>
      );
    }

    switch(activeView) {
      case 'pos': return <POS onViewTables={() => setActiveView('tables')} />;
      case 'tables': return <TablesView onSelect={() => setActiveView('pos')} />;
      case 'orders': return <OrdersView />;
      case 'hospitality_tables': return <HospitalityView initialTab="tables" setActiveView={setActiveView} />;
      case 'hospitality_pos': return <POS onViewTables={() => setActiveView('hospitality_tables')} />;
      case 'hospitality_new_orders': return <HospitalityView initialTab="new_orders" setActiveView={setActiveView} />;
      case 'hospitality_tracking': return <HospitalityView initialTab="tracking" setActiveView={setActiveView} />;
      case 'hospitality_feedback': return <HospitalityView initialTab="feedback" setActiveView={setActiveView} />;
      case 'hospitality_tasks': return <HospitalityView initialTab="tasks" setActiveView={setActiveView} />;
      case 'departments': return <DepartmentView />;
      case 'aggregator_dashboard': return <OrderAggregatorDashboard />;
      case 'aggregator_shelves': return <ShelfGridView />;
      case 'finance': return <FinanceReports />;
      case 'shift': return <ShiftView />;
      case 'org': return <OrgStructure />;
      case 'branch_dashboard': return <BranchManagerPortal />;
      case 'branch_live': return <BranchManagerPortal />; // Shared for now
      case 'branch_orders': return <OrdersView />; // Reusable component
      default: return <div className="p-10 text-center text-slate-400 font-bold">هذه الخاصية قيد التطوير</div>;
    }
  };

  return (
    <AppLayout activeView={activeView} setActiveView={setActiveView}>
      {showContent()}
    </AppLayout>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <Main />
  </AppProvider>
);

export default App;
