
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
import { FinancePortal } from './components/FinancePortal';
import { EmployeeDashboard } from './components/EmployeeDashboard';

const Main: React.FC = () => {
  const { currentUser, currentShift, userRole, editingOrderId } = useApp();
  const [activeView, setActiveView] = useState('pos');

  useEffect(() => {
    if (userRole === 'ADMIN' || userRole === 'FINANCE') {
      setActiveView('finance_dashboard');
    } else if (userRole === 'BRANCH_MANAGER') {
      setActiveView('branch_dashboard');
    } else if (userRole === 'HOSPITALITY') {
      setActiveView('hospitality_tables');
    } else if (userRole === 'DEPARTMENT_STAFF') {
      setActiveView('dept_dashboard');
    } else if (userRole === 'ORDER_AGGREGATOR') {
      setActiveView('aggregator_dashboard');
    } else if (userRole === 'EMPLOYEE') {
      setActiveView('employee_dashboard');
    } else if (userRole === 'CUSTOMER') {
      setActiveView('customer_home');
    } else if (editingOrderId) {
      setActiveView('pos');
    }
  }, [userRole, editingOrderId]);

  if (!currentUser) return <Login />;

  const showContent = () => {
    const isAdmin = userRole === 'ADMIN';
    const isBranchManager = userRole === 'BRANCH_MANAGER';
    const isHospitality = userRole === 'HOSPITALITY';
    const isDeptStaff = userRole === 'DEPARTMENT_STAFF';
    const isAggregator = userRole === 'ORDER_AGGREGATOR';

    // Branch Managers, Super Admins, Hospitality, and Dept Staff bypass shift check
    if (!currentShift && !isAdmin && !isBranchManager && !isHospitality && !isDeptStaff && !isAggregator && activeView !== 'shift' && userRole !== 'CUSTOMER' && userRole !== 'EMPLOYEE') {
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
      case 'hospitality_tables': return <HospitalityView key="h_tables" initialTab="tables" setActiveView={setActiveView} />;
      case 'hospitality_pos': return <POS onViewTables={() => setActiveView('hospitality_tables')} />;
      case 'hospitality_new_orders': return <HospitalityView key="h_new" initialTab="new_orders" setActiveView={setActiveView} />;
      case 'hospitality_tracking': return <HospitalityView key="h_track" initialTab="tracking" setActiveView={setActiveView} />;
      case 'hospitality_feedback': return <HospitalityView key="h_feed" initialTab="feedback" setActiveView={setActiveView} />;
      case 'hospitality_tasks': return <HospitalityView key="h_tasks" initialTab="tasks" setActiveView={setActiveView} />;
      case 'dept_dashboard': return <DepartmentView key="d_dash" />;
      case 'dept_orders': return <DepartmentView key="d_orders" initialView="ORDERS" />;
      case 'departments': return <DepartmentView key="d_main" />;
      case 'aggregator_dashboard': return <OrderAggregatorDashboard />;
      case 'aggregator_shelves': return <ShelfGridView />;
      case 'finance_dashboard': return <FinancePortal key="f_dash" initialView="DASHBOARD" />;
      case 'finance_departments': return <FinancePortal key="f_depts" initialView="DEPARTMENTS" />;
      case 'finance_menu': return <FinancePortal key="f_menu" initialView="MENU" />;
      case 'finance_orders': return <FinancePortal key="f_orders" initialView="ORDERS" />;
      case 'finance_customers': return <FinancePortal key="f_cust" initialView="CUSTOMERS" />;
      case 'finance_suppliers': return <FinancePortal key="f_supp" initialView="SUPPLIERS" />;
      case 'finance_employees': return <FinancePortal key="f_emp" initialView="EMPLOYEES" />;
      case 'finance_accounting': return <FinancePortal key="f_acc" initialView="ACCOUNTING" />;
      case 'finance_reports': return <FinancePortal key="f_rep" initialView="REPORTS" />;
      case 'finance_audit': return <FinancePortal key="f_audit" initialView="AUDIT_LOG" />;
      case 'finance_archive': return <FinancePortal key="f_arch" initialView="ARCHIVE" />;
      case 'finance_settings': return <FinancePortal key="f_sett" initialView="SETTINGS" />;
      case 'finance': return <FinanceReports />;
      case 'shift': return <ShiftView />;
      case 'org': return <OrgStructure />;
      case 'branch_dashboard': return <BranchManagerPortal />;
      case 'branch_live': return <BranchManagerPortal />; // Shared for now
      case 'branch_orders': return <OrdersView />; // Reusable component
      case 'customer_home': return <CustomerPortal key="c_home" initialTab="home" />;
      case 'customer_menu': return <CustomerPortal key="c_menu" initialTab="menu" />;
      case 'customer_orders': return <CustomerPortal key="c_orders" initialTab="orders" />;
      case 'customer_wallet': return <CustomerPortal key="c_wallet" initialTab="wallet" />;
      case 'customer_profile': return <CustomerPortal key="c_profile" initialTab="profile" />;
      case 'employee_dashboard': return <EmployeeDashboard key="e_dash" initialTab="DASHBOARD" />;
      case 'employee_personal': return <EmployeeDashboard key="e_pers" initialTab="PERSONAL" />;
      case 'employee_shift': return <EmployeeDashboard key="e_shift" initialTab="SHIFT" />;
      case 'employee_timesheet': return <EmployeeDashboard key="e_time" initialTab="TIMESHEET" />;
      case 'employee_finance': return <EmployeeDashboard key="e_fin" initialTab="FINANCE" />;
      case 'employee_policies': return <EmployeeDashboard key="e_pol" initialTab="POLICIES" />;
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
