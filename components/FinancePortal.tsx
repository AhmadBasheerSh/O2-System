
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Package, 
  Layers, 
  Wallet, 
  FileText, 
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  Printer,
  History,
  UserPlus,
  X,
  Building2,
  Users2,
  Map,
  Monitor,
  Bell,
  Zap,
  BarChart3,
  LayoutGrid,
  Shield,
  Info,
  Smartphone,
  Volume2,
  EyeOff,
  Activity,
  ChefHat,
  DollarSign,
  CreditCard,
  Star,
  Flame,
  Leaf,
  Tag,
  Barcode,
  Check,
  Minus,
  Scissors,
  UtensilsCrossed,
  Sparkles,
  Archive,
  XCircle as XCircleIcon,
  Lock
} from 'lucide-react';
import { OrderStatus, OrderType, MenuItem, Customer, Employee, Department, Order, TableStatus, PaymentMethod, FinancialTransactionType, CustomerType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import EmployeeManagement from './EmployeeManagement';
import CustomerManagement from './CustomerManagement';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface FinancePortalProps {
  initialView?: 'DASHBOARD' | 'DEPARTMENTS' | 'MENU' | 'ORDERS' | 'CUSTOMERS' | 'SUPPLIERS' | 'EMPLOYEES' | 'ACCOUNTING' | 'REPORTS' | 'SETTINGS' | 'AUDIT_LOG' | 'ARCHIVE';
}

export const FinancePortal: React.FC<FinancePortalProps> = ({ initialView = 'DASHBOARD' }) => {
  const { 
    activeOrders, 
    menuItems, 
    customers, 
    employees, 
    departments, 
    branches,
    addDepartment, updateDepartment, deleteDepartment,
    addMenuItem, updateMenuItem, deleteMenuItem,
    addEmployee, updateEmployee, deleteEmployee,
    addCustomer, updateCustomer,
    financialTransactions,
    currentShift, openShift, closeShift,
    addFinancialTransaction,
    activityLogs,
    currentUser,
    cancelOrder, transferOrder, mergeOrders, splitOrder, refundOrder,
    updateOrderItemStatus,
    tables
  } = useApp();

  const [view, setView] = useState(initialView);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManageFinance = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER' || currentUser?.role === 'FINANCE' || currentUser?.role === 'BRANCH_MANAGER';
  const canAudit = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER' || currentUser?.role === 'BRANCH_MANAGER';
  const canEditSettings = currentUser?.role === 'ADMIN';
  const [modalType, setModalType] = useState<'DEPARTMENT' | 'MENU_ITEM' | 'EMPLOYEE' | 'CUSTOMER' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deptSubView, setDeptSubView] = useState<'LIST' | 'MAP'>('LIST');

  // Menu Search & Filter State
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuFilters, setMenuFilters] = useState({
    departmentId: 'all',
    status: 'all',
    popular: false,
    chefRecommended: false,
    seasonal: false
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Order Management State
  const [orderTab, setOrderTab] = useState<'ACTIVE' | 'PREPARING' | 'READY' | 'CLOSED' | 'CANCELED'>('ACTIVE');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilters, setOrderFilters] = useState({
    type: 'all',
    cashierId: 'all',
    dateRange: 'today'
  });
  const [showOrderFilters, setShowOrderFilters] = useState(false);
  
  // Order Sub-Modals
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitItems, setSplitItems] = useState<{ uniqueId: string, quantity: number }[]>([]);

  const filteredOrders = useMemo(() => {
    return activeOrders.filter(order => {
      // Tab filtering
      const matchesTab = 
        orderTab === 'ACTIVE' ? (order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELED) :
        orderTab === 'PREPARING' ? order.status === OrderStatus.PREPARING :
        orderTab === 'READY' ? order.status === OrderStatus.READY :
        orderTab === 'CLOSED' ? order.status === OrderStatus.COMPLETED :
        order.status === OrderStatus.CANCELED;

      // Search filtering
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        (order.customerName || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        (order.customerPhone || '').includes(orderSearchQuery);

      // Advanced filters
      const matchesType = orderFilters.type === 'all' || order.type === orderFilters.type;
      
      return matchesTab && matchesSearch && matchesType;
    });
  }, [activeOrders, orderTab, orderSearchQuery, orderFilters]);

  // --- Dashboard Data ---
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<FinancialTransactionType>(FinancialTransactionType.EXPENSE);
  const [closingCash, setClosingCash] = useState<number>(0);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = activeOrders.filter(o => new Date(o.createdAt) >= today);
    const totalSales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const invoiceCount = todayOrders.length;
    const avgInvoice = invoiceCount > 0 ? totalSales / invoiceCount : 0;
    
    const todayTransactions = financialTransactions.filter(tx => new Date(tx.timestamp) >= today);
    
    const expenses = todayTransactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const withdrawals = todayTransactions
      .filter(tx => tx.type === 'WITHDRAWAL')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const deposits = todayTransactions
      .filter(tx => tx.type === 'DEPOSIT')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const refunds = todayTransactions
      .filter(tx => tx.type === 'REFUND')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const cashSales = todayOrders
      .filter(o => o.paymentMethod === PaymentMethod.CASH)
      .reduce((sum, o) => sum + o.total, 0);
      
    const cardSales = todayOrders
      .filter(o => o.paymentMethod === PaymentMethod.CREDIT_CARD)
      .reduce((sum, o) => sum + o.total, 0);
      
    const walletSales = todayOrders
      .filter(o => o.paymentMethod === PaymentMethod.WALLET)
      .reduce((sum, o) => sum + o.total, 0);

    const openingCash = currentShift?.openingBalance || 0;
    const netCash = openingCash + cashSales + deposits - expenses - withdrawals - refunds;

    return {
      totalSales,
      invoiceCount,
      avgInvoice,
      expenses,
      withdrawals,
      netCash,
      cashSales,
      cardSales,
      walletSales,
      activeCount: activeOrders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELED).length,
      cancelledCount: activeOrders.filter(o => o.status === OrderStatus.CANCELED).length
    };
  }, [activeOrders, financialTransactions, currentShift]);

  const hourlySalesData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, sales: 0 }));
    activeOrders.forEach(o => {
      const hour = new Date(o.createdAt).getHours();
      hours[hour].sales += o.total;
    });
    return hours;
  }, [activeOrders]);

  const deptSalesData = useMemo(() => {
    const deptSales: Record<string, number> = {};
    activeOrders.forEach(o => {
      o.items.forEach(item => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        if (menuItem) {
          deptSales[menuItem.categoryId] = (deptSales[menuItem.categoryId] || 0) + (item.price * item.quantity);
        }
      });
    });
    return Object.entries(deptSales).map(([id, sales]) => ({ name: id, value: sales }));
  }, [activeOrders, menuItems]);

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];

  const openModal = (type: 'DEPARTMENT' | 'MENU_ITEM' | 'EMPLOYEE' | 'CUSTOMER', item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
  };

  const renderModal = () => {
    if (!isModalOpen || !modalType) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());

      if (modalType === 'DEPARTMENT') {
        const deptData = {
          ...data,
          hasKds: data.hasKds === 'on',
          autoPrintTicket: data.autoPrintTicket === 'on',
          requiresAssembly: data.requiresAssembly === 'on',
          defaultPrepTime: parseInt(data.defaultPrepTime as string) || 0,
          displayOrder: parseInt(data.displayOrder as string) || 0,
          maxConcurrentOrders: parseInt(data.maxConcurrentOrders as string) || 0,
          priority: parseInt(data.priority as string) || 0,
          notifications: {
            sound: data['notifications.sound'] === 'on',
            flash: data['notifications.flash'] === 'on',
            push: data['notifications.push'] === 'on',
          },
          orderTypeVisibility: [
            ...(data['orderType.DINE_IN'] === 'on' ? [OrderType.DINE_IN] : []),
            ...(data['orderType.TAKEAWAY'] === 'on' ? [OrderType.TAKEAWAY] : []),
            ...(data['orderType.DELIVERY'] === 'on' ? [OrderType.DELIVERY] : []),
          ]
        };
        if (editingItem) {
          updateDepartment(editingItem.id, deptData as any);
        } else {
          addDepartment({ ...deptData, branchId: 'b1' } as any);
        }
      } else if (modalType === 'MENU_ITEM') {
        let sizes = [];
        try { sizes = data.sizes ? JSON.parse(data.sizes as string) : []; } catch(e) { console.error('Invalid sizes JSON'); }
        let addons = [];
        try { addons = data.addons ? JSON.parse(data.addons as string) : []; } catch(e) { console.error('Invalid addons JSON'); }
        let removals = [];
        try { removals = data.removals ? JSON.parse(data.removals as string) : []; } catch(e) { console.error('Invalid removals JSON'); }
        let comboItems = [];
        try { comboItems = data.comboItems ? JSON.parse(data.comboItems as string) : []; } catch(e) { console.error('Invalid comboItems JSON'); }

        const itemData = {
          ...data,
          price: parseFloat(data.price as string) || 0,
          dineInPrice: parseFloat(data.dineInPrice as string) || parseFloat(data.price as string) || 0,
          takeawayPrice: parseFloat(data.takeawayPrice as string) || parseFloat(data.price as string) || 0,
          deliveryPrice: parseFloat(data.deliveryPrice as string) || parseFloat(data.price as string) || 0,
          offerPrice: data.offerPrice ? parseFloat(data.offerPrice as string) : undefined,
          prepTime: parseInt(data.prepTime as string) || 0,
          displayOrder: parseInt(data.displayOrder as string) || 0,
          requiresKitchen: data.requiresKitchen === 'on',
          popular: data.popular === 'on',
          chefRecommended: data.chefRecommended === 'on',
          seasonal: data.seasonal === 'on',
          isCombo: data.isCombo === 'on',
          status: data.status || 'AVAILABLE',
          visibility: {
            pos: data['visibility.pos'] === 'on',
            qrMenu: data['visibility.qrMenu'] === 'on',
            delivery: data['visibility.delivery'] === 'on',
          },
          sizes,
          addons,
          removals,
          comboItems,
          image: data.image || editingItem?.image || 'https://picsum.photos/seed/food/400/400'
        };
        if (editingItem) {
          updateMenuItem(editingItem.id, itemData as any);
        } else {
          addMenuItem({ ...itemData, id: Math.random().toString(36).substr(2, 9) } as any);
        }
      } else if (modalType === 'EMPLOYEE') {
        if (editingItem) {
          updateEmployee(editingItem.id, data as any);
        } else {
          addEmployee({ ...data, status: 'ACTIVE', branchId: 'b1', hireDate: new Date() } as any);
        }
      } else if (modalType === 'CUSTOMER') {
        if (editingItem) {
          updateCustomer(editingItem.id, data as any);
        } else {
          addCustomer(data as any);
        }
      }

      closeModal();
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
            <h3 className="text-xl font-bold text-white">
              {editingItem ? 'تعديل' : 'إضافة'} {
                modalType === 'DEPARTMENT' ? 'قسم' :
                modalType === 'MENU_ITEM' ? 'صنف' :
                modalType === 'EMPLOYEE' ? 'موظف' : 'عميل'
              }
            </h3>
            <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {modalType === 'DEPARTMENT' && (
              <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Info size={16} className="text-blue-500" />
                    المعلومات الأساسية
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">اسم القسم (EN)</label>
                      <input name="name" defaultValue={editingItem?.name} required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">اسم القسم (عربي)</label>
                      <input name="nameAr" defaultValue={editingItem?.nameAr} required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">اسم مختصر</label>
                      <input name="shortName" defaultValue={editingItem?.shortName} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">نوع القسم</label>
                      <select name="type" defaultValue={editingItem?.type || 'MAIN_KITCHEN'} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
                        <option value="MAIN_KITCHEN">مطبخ رئيسي</option>
                        <option value="FAST_FOOD">وجبات سريعة</option>
                        <option value="BAR">بار / مشروبات</option>
                        <option value="COLD_PREP">تحضير بارد</option>
                        <option value="BAKERY">مخبوزات</option>
                        <option value="DESSERT">حلويات</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">أيقونة (Emoji)</label>
                      <input name="icon" defaultValue={editingItem?.icon} placeholder="🍕" className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">لون القسم</label>
                      <input name="color" type="color" defaultValue={editingItem?.color || '#ef4444'} className="w-full h-10 bg-slate-800 border border-white/5 rounded-xl px-1 py-1 text-sm text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">الوصف</label>
                    <textarea name="description" defaultValue={editingItem?.description} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50 h-20" />
                  </div>
                </div>

                {/* Location & KDS */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Map size={16} className="text-emerald-500" />
                    الموقع ونظام KDS
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">رقم المحطة</label>
                      <input name="stationNumber" defaultValue={editingItem?.stationNumber} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">الموقع الوصفي</label>
                      <input name="location" defaultValue={editingItem?.location} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input name="hasKds" type="checkbox" defaultChecked={editingItem?.hasKds} className="w-4 h-4 accent-red-600" />
                      <span className="text-sm text-white font-bold">تفعيل شاشة KDS</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">معرف الشاشة</label>
                        <input name="kdsScreenId" defaultValue={editingItem?.kdsScreenId} className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">اسم الجهاز</label>
                        <input name="kdsDeviceName" defaultValue={editingItem?.kdsDeviceName} className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operational Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Settings size={16} className="text-orange-500" />
                    الإعدادات التشغيلية
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">وقت التحضير الافتراضي (د)</label>
                      <input name="defaultPrepTime" type="number" defaultValue={editingItem?.defaultPrepTime || 15} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">ترتيب العرض</label>
                      <input name="displayOrder" type="number" defaultValue={editingItem?.displayOrder || 0} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">أقصى عدد طلبات متزامنة</label>
                      <input name="maxConcurrentOrders" type="number" defaultValue={editingItem?.maxConcurrentOrders || 10} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">الأولوية</label>
                      <input name="priority" type="number" defaultValue={editingItem?.priority || 1} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">الحالة</label>
                      <select name="status" defaultValue={editingItem?.status || 'ACTIVE'} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
                        <option value="ACTIVE">نشط</option>
                        <option value="BUSY">مزدحم</option>
                        <option value="INACTIVE">غير نشط</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input name="requiresAssembly" type="checkbox" defaultChecked={editingItem?.requiresAssembly} className="w-4 h-4 accent-red-600" />
                        <span className="text-sm text-white font-bold">يتطلب تجميع</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notifications & Printing */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Bell size={16} className="text-yellow-500" />
                    التنبيهات والطباعة
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-white/5 cursor-pointer">
                      <input name="notifications.sound" type="checkbox" defaultChecked={editingItem?.notifications?.sound ?? true} className="w-3 h-3 accent-red-600" />
                      <span className="text-[10px] text-slate-300">صوت</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-white/5 cursor-pointer">
                      <input name="notifications.flash" type="checkbox" defaultChecked={editingItem?.notifications?.flash ?? true} className="w-3 h-3 accent-red-600" />
                      <span className="text-[10px] text-slate-300">وميض</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-white/5 cursor-pointer">
                      <input name="notifications.push" type="checkbox" defaultChecked={editingItem?.notifications?.push ?? true} className="w-3 h-3 accent-red-600" />
                      <span className="text-[10px] text-slate-300">Push</span>
                    </label>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-800/50 border border-white/5">
                    <input name="autoPrintTicket" type="checkbox" defaultChecked={editingItem?.autoPrintTicket} className="w-4 h-4 accent-red-600" />
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-bold">طباعة تلقائية للتذاكر</span>
                      <span className="text-[10px] text-slate-500">طباعة تذكرة المطبخ فور وصول الطلب</span>
                    </div>
                  </label>
                </div>

                {/* Order Type Visibility */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Eye size={16} className="text-purple-500" />
                    ظهور أنواع الطلبات
                  </h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input name="orderType.DINE_IN" type="checkbox" defaultChecked={editingItem?.orderTypeVisibility?.includes(OrderType.DINE_IN) ?? true} className="w-4 h-4 accent-red-600" />
                      <span className="text-xs text-slate-300">محلي</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input name="orderType.TAKEAWAY" type="checkbox" defaultChecked={editingItem?.orderTypeVisibility?.includes(OrderType.TAKEAWAY) ?? true} className="w-4 h-4 accent-red-600" />
                      <span className="text-xs text-slate-300">سفري</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input name="orderType.DELIVERY" type="checkbox" defaultChecked={editingItem?.orderTypeVisibility?.includes(OrderType.DELIVERY) ?? true} className="w-4 h-4 accent-red-600" />
                      <span className="text-xs text-slate-300">توصيل</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'MENU_ITEM' && (
              <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Info size={16} className="text-blue-500" />
                    المعلومات الأساسية
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">اسم الصنف (عربي)</label>
                      <input name="nameAr" defaultValue={editingItem?.nameAr} required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">اسم الصنف (EN)</label>
                      <input name="name" defaultValue={editingItem?.name} required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">اسم مختصر (للمطبخ)</label>
                      <input name="shortName" defaultValue={editingItem?.shortName} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">كود الصنف (SKU)</label>
                      <input name="code" defaultValue={editingItem?.code} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">رابط الصورة</label>
                    <input name="image" defaultValue={editingItem?.image} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">وصف الصنف</label>
                    <textarea name="descriptionAr" defaultValue={editingItem?.descriptionAr} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50 h-20" />
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <DollarSign size={16} className="text-emerald-500" />
                    إدارة التسعير
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">السعر الأساسي</label>
                      <input name="price" type="number" step="0.01" defaultValue={editingItem?.price} required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">سعر العرض (اختياري)</label>
                      <input name="offerPrice" type="number" step="0.01" defaultValue={editingItem?.offerPrice} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-500 uppercase">سعر المحلي</label>
                      <input name="dineInPrice" type="number" step="0.01" defaultValue={editingItem?.dineInPrice} className="w-full bg-slate-800 border border-white/5 rounded-lg px-2 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-500 uppercase">سعر السفري</label>
                      <input name="takeawayPrice" type="number" step="0.01" defaultValue={editingItem?.takeawayPrice} className="w-full bg-slate-800 border border-white/5 rounded-lg px-2 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-500 uppercase">سعر التوصيل</label>
                      <input name="deliveryPrice" type="number" step="0.01" defaultValue={editingItem?.deliveryPrice} className="w-full bg-slate-800 border border-white/5 rounded-lg px-2 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Settings size={16} className="text-orange-500" />
                    الإعدادات التشغيلية
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">القسم المرتبط</label>
                      <select name="departmentId" defaultValue={editingItem?.departmentId} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
                        {departments.map(d => <option key={d.id} value={d.id}>{d.nameAr || d.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">وقت التحضير (د)</label>
                      <input name="prepTime" type="number" defaultValue={editingItem?.prepTime || 10} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">الحالة</label>
                      <select name="status" defaultValue={editingItem?.status || 'AVAILABLE'} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
                        <option value="AVAILABLE">متوفر</option>
                        <option value="UNAVAILABLE">غير متوفر</option>
                        <option value="OUT_OF_STOCK">نفذت الكمية</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">ترتيب العرض</label>
                      <input name="displayOrder" type="number" defaultValue={editingItem?.displayOrder || 0} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input name="requiresKitchen" type="checkbox" defaultChecked={editingItem?.requiresKitchen ?? true} className="w-4 h-4 accent-red-600" />
                      <span className="text-sm text-white font-bold">يتطلب تحضير في المطبخ</span>
                    </label>
                  </div>
                </div>

                {/* Visibility & Flags */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Eye size={16} className="text-purple-500" />
                    الظهور والخيارات الإضافية
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-white/5 cursor-pointer">
                      <input name="popular" type="checkbox" defaultChecked={editingItem?.popular} className="w-3 h-3 accent-red-600" />
                      <span className="text-[10px] text-slate-300">الأكثر مبيعاً</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-white/5 cursor-pointer">
                      <input name="chefRecommended" type="checkbox" defaultChecked={editingItem?.chefRecommended} className="w-3 h-3 accent-red-600" />
                      <span className="text-[10px] text-slate-300">توصية الشيف</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-white/5 cursor-pointer">
                      <input name="seasonal" type="checkbox" defaultChecked={editingItem?.seasonal} className="w-3 h-3 accent-red-600" />
                      <span className="text-[10px] text-slate-300">موسمي</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input name="isCombo" type="checkbox" defaultChecked={editingItem?.isCombo} className="w-4 h-4 accent-red-600" />
                      <span className="text-xs text-white font-bold">وجبة كومبو (Combo)</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">أماكن الظهور</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input name="visibility.pos" type="checkbox" defaultChecked={editingItem?.visibility?.pos ?? true} className="w-4 h-4 accent-red-600" />
                        <span className="text-xs text-slate-300">شاشة الكاشير</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input name="visibility.qrMenu" type="checkbox" defaultChecked={editingItem?.visibility?.qrMenu ?? true} className="w-4 h-4 accent-red-600" />
                        <span className="text-xs text-slate-300">منيو QR</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input name="visibility.delivery" type="checkbox" defaultChecked={editingItem?.visibility?.delivery ?? true} className="w-4 h-4 accent-red-600" />
                        <span className="text-xs text-slate-300">تطبيقات التوصيل</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">ملاحظات المطبخ</label>
                    <textarea name="kitchenNotes" defaultValue={editingItem?.kitchenNotes} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none h-16" />
                  </div>
                </div>

                {/* Options & Customization */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                    <Settings size={16} className="text-indigo-500" />
                    الخيارات والإضافات (Advanced JSON)
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">الأحجام (Sizes)</label>
                      <textarea 
                        name="sizes" 
                        placeholder='[{"name": "صغير", "price": 10}, {"name": "كبير", "price": 15}]'
                        defaultValue={editingItem?.sizes ? JSON.stringify(editingItem.sizes) : ''} 
                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-mono text-white focus:outline-none h-20" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">الإضافات (Add-ons)</label>
                      <textarea 
                        name="addons" 
                        placeholder='[{"name": "جبنة إضافية", "price": 2, "maxQty": 2}]'
                        defaultValue={editingItem?.addons ? JSON.stringify(editingItem.addons) : ''} 
                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-mono text-white focus:outline-none h-20" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">مكونات قابلة للإزالة (Removals)</label>
                      <textarea 
                        name="removals" 
                        placeholder='[{"name": "بصل"}, {"name": "مخلل"}]'
                        defaultValue={editingItem?.removals ? JSON.stringify(editingItem.removals) : ''} 
                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-mono text-white focus:outline-none h-20" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">أصناف الكومبو (Combo Item IDs)</label>
                      <textarea 
                        name="comboItems" 
                        placeholder='["item-id-1", "item-id-2"]'
                        defaultValue={editingItem?.comboItems ? JSON.stringify(editingItem.comboItems) : ''} 
                        className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-mono text-white focus:outline-none h-20" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'EMPLOYEE' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">اسم الموظف</label>
                  <input name="name" defaultValue={editingItem?.name} required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">رقم الهاتف</label>
                    <input name="phone" defaultValue={editingItem?.phone} required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">الدور الوظيفي</label>
                    <select name="role" defaultValue={editingItem?.role} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                      <option value="ADMIN">مدير نظام</option>
                      <option value="BRANCH_MANAGER">مدير فرع</option>
                      <option value="HEAD_CHEF">رئيس طهاة</option>
                      <option value="COOK">طباخ</option>
                      <option value="CASHIER">كاشير</option>
                      <option value="WAITER">ويتر</option>
                      <option value="DEPARTMENT_STAFF">موظف قسم</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">القسم</label>
                  <select name="departmentId" defaultValue={editingItem?.departmentId} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </>
            )}

            {modalType === 'CUSTOMER' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">اسم العميل</label>
                  <input name="name" defaultValue={editingItem?.name} required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">رقم الهاتف</label>
                  <input name="phone" defaultValue={editingItem?.phone} required className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">ملاحظات</label>
                  <textarea name="notes" defaultValue={editingItem?.notes} className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 h-24" />
                </div>
              </>
            )}

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={closeModal} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-sm transition-all">
                إلغاء
              </button>
              <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/20">
                {editingItem ? 'حفظ التعديلات' : 'إضافة'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- Render Helpers ---
  const renderAuditLog = () => {
    const [searchQuery, setSearchQuery] = useState('');
    
    const filteredLogs = activityLogs.filter(log => 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employees.find(e => e.id === log.employeeId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="البحث في سجل التدقيق..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl pr-12 pl-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2 text-sm font-bold text-slate-300 flex items-center gap-2 hover:bg-slate-800 transition-all">
              <Filter size={16} />
              تصفية
            </button>
            <button className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2 text-sm font-bold text-slate-300 flex items-center gap-2 hover:bg-slate-800 transition-all">
              <Download size={16} />
              تصدير
            </button>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="text-slate-500 text-sm border-b border-white/5">
                <th className="p-4 font-medium">الوقت</th>
                <th className="p-4 font-medium">الموظف</th>
                <th className="p-4 font-medium">الإجراء</th>
                <th className="p-4 font-medium">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map(log => {
                const employee = employees.find(e => e.id === log.employeeId);
                return (
                  <tr key={log.id} className="text-sm hover:bg-white/5 transition-colors">
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('ar-SA')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                          {employee?.name.charAt(0)}
                        </div>
                        <span className="font-bold text-white">{employee?.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-500 font-bold">
                    لا توجد سجلات تطابق البحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
          <Building2 size={24} className="text-red-500" />
          معلومات المطعم الأساسية
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">اسم المطعم</label>
            <input type="text" defaultValue="RestoMaster Pro" className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">الرقم الضريبي</label>
            <input type="text" defaultValue="TR-987654321" className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">العملة الافتراضية</label>
            <select className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none">
              <option>USD ($)</option>
              <option>SAR (ر.س)</option>
              <option>AED (د.إ)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">نسبة الضريبة (%)</label>
            <input type="number" defaultValue="15" className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50" />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
          <h4 className="text-sm font-bold text-white mb-4">خيارات الدفع المتاحة</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['نقدي', 'مدى / بطاقة', 'Apple Pay', 'محفظة إلكترونية'].map(method => (
              <label key={method} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-white/5 cursor-pointer hover:bg-slate-800 transition-all">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-red-600" />
                <span className="text-sm text-slate-300">{method}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/20">
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Printer size={24} className="text-blue-500" />
          إعدادات الطباعة
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5">
            <div>
              <p className="text-sm font-bold text-white">طباعة الفاتورة تلقائياً</p>
              <p className="text-xs text-slate-500">طباعة الفاتورة فور إتمام عملية الدفع</p>
            </div>
            <div className="w-12 h-6 bg-red-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5">
            <div>
              <p className="text-sm font-bold text-white">طباعة طلبات المطبخ</p>
              <p className="text-xs text-slate-500">إرسال بنود الطلب إلى طابعات الأقسام</p>
            </div>
            <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const renderReports = () => {
    const [reportData, setReportData] = useState<any[]>([]);
    
    useEffect(() => {
      if (generatingReport) {
        // Simulate data fetching based on report type
        if (generatingReport === 'تقرير المبيعات اليومي') {
          setReportData(activeOrders.map(o => ({
            id: o.id,
            customer: o.customerName || 'نقدي',
            total: o.total,
            method: o.paymentMethod,
            time: new Date(o.createdAt).toLocaleTimeString('ar-SA')
          })));
        } else if (generatingReport === 'التقرير المالي الختامي') {
          setReportData(financialTransactions.slice(0, 20).map(tx => ({
            id: tx.id,
            type: tx.type,
            amount: tx.amount,
            reason: tx.reason,
            date: new Date(tx.timestamp).toLocaleDateString('ar-SA')
          })));
        } else {
          setReportData([]);
        }
      }
    }, [generatingReport, activeOrders, financialTransactions]);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {generatingReport ? (
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white">{generatingReport}</h2>
                <p className="text-slate-500 text-sm">تم التوليد في {new Date().toLocaleString('ar-SA')}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => window.print()}
                  className="bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-sm font-bold text-white flex items-center gap-2 hover:bg-slate-700 transition-all"
                >
                  <Printer size={18} />
                  طباعة
                </button>
                <button 
                  onClick={() => setGeneratingReport(null)}
                  className="bg-red-500 rounded-xl px-4 py-2 text-sm font-bold text-white hover:bg-red-600 transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
            
            {reportData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="text-slate-500 text-xs font-bold uppercase border-b border-white/5">
                      {Object.keys(reportData[0]).map(key => (
                        <th key={key} className="px-4 py-3">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reportData.map((row, idx) => (
                      <tr key={idx} className="text-sm text-slate-300 hover:bg-white/5 transition-colors">
                        {Object.values(row).map((val: any, i) => (
                          <td key={i} className="px-4 py-3">
                            {typeof val === 'number' ? `₪${val.toLocaleString()}` : val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-8 flex justify-end gap-4">
                  <button className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl px-6 py-3 text-sm font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-2">
                    <Download size={18} />
                    تصدير Excel
                  </button>
                  <button className="bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl px-6 py-3 text-sm font-bold hover:bg-blue-500/20 transition-all flex items-center gap-2">
                    <Download size={18} />
                    تصدير PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-bold text-white">تم تجهيز التقرير بنجاح</h3>
                <p className="text-slate-500 max-w-sm mx-auto">لا توجد بيانات كافية لعرضها في الجدول حالياً، ولكن يمكنك تصدير التقرير الفارغ.</p>
                <button className="mt-4 bg-slate-800 border border-white/5 rounded-xl px-6 py-3 text-sm font-bold text-white hover:bg-slate-700 transition-all flex items-center gap-2 mx-auto">
                  <Download size={18} />
                  تنزيل بصيغة PDF
                </button>
              </div>
            )}
          </div>
        ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReportCard 
              title="تقرير المبيعات اليومي" 
              description="ملخص كامل للمبيعات، الضرائب، وطرق الدفع لليوم الحالي."
              icon={TrendingUp}
              color="text-red-500"
              onClick={() => setGeneratingReport('تقرير المبيعات اليومي')}
            />
            <ReportCard 
              title="تقرير أداء الموظفين" 
              description="تحليل لإنتاجية الموظفين، ساعات العمل، والمبيعات المحققة."
              icon={Users2}
              color="text-blue-500"
              onClick={() => setGeneratingReport('تقرير أداء الموظفين')}
            />
            <ReportCard 
              title="تقرير المخزون والمنيو" 
              description="الأصناف الأكثر مبيعاً، الأصناف الراكدة، وتحليل التكاليف."
              icon={Package}
              color="text-orange-500"
              onClick={() => setGeneratingReport('تقرير المخزون والمنيو')}
            />
            <ReportCard 
              title="تقرير العملاء والولاء" 
              description="تحليل سلوك العملاء، نقاط الولاء، والعملاء الأكثر تردداً."
              icon={Users}
              color="text-purple-500"
              onClick={() => setGeneratingReport('تقرير العملاء والولاء')}
            />
            <ReportCard 
              title="التقرير المالي الختامي" 
              description="الأرباح والخسائر، التدفقات النقدية، والميزانية العمومية."
              icon={Wallet}
              color="text-emerald-500"
              onClick={() => setGeneratingReport('التقرير المالي الختامي')}
            />
            <ReportCard 
              title="تقرير الأقسام والمطبخ" 
              description="أداء الأقسام، أوقات التحضير، ونسبة الهالك."
              icon={Layers}
              color="text-amber-500"
              onClick={() => setGeneratingReport('تقرير الأقسام والمطبخ')}
            />
          </div>

          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">تخصيص تقرير جديد</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">نوع التقرير</label>
                <select className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none">
                  <option>مبيعات</option>
                  <option>مصروفات</option>
                  <option>موظفين</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">من تاريخ</label>
                <input type="date" className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">إلى تاريخ</label>
                <input type="date" className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none" />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => setGeneratingReport('تقرير مخصص')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-900/20"
                >
                  توليد التقرير
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

  const renderAccounting = () => {
    const shiftTransactions = financialTransactions.filter(tx => tx.shiftId === currentShift?.id);
    const totalSales = shiftTransactions.filter(tx => tx.type === FinancialTransactionType.SALE).reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpenses = shiftTransactions.filter(tx => tx.type === FinancialTransactionType.EXPENSE).reduce((sum, tx) => sum + tx.amount, 0);
    const totalWithdrawals = shiftTransactions.filter(tx => tx.type === FinancialTransactionType.WITHDRAWAL).reduce((sum, tx) => sum + tx.amount, 0);
    const totalDeposits = shiftTransactions.filter(tx => tx.type === FinancialTransactionType.DEPOSIT).reduce((sum, tx) => sum + tx.amount, 0);
    const totalRefunds = shiftTransactions.filter(tx => tx.type === FinancialTransactionType.REFUND).reduce((sum, tx) => sum + tx.amount, 0);
    
    const currentBalance = (currentShift?.openingBalance || 0) + totalSales + totalDeposits - totalExpenses - totalWithdrawals - totalRefunds;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Daily Financial Summary (Requested by user) */}
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white">ملخص اليوم المالي (Daily Summary)</h2>
              <p className="text-xs text-slate-500">نظرة سريعة على أداء اليوم المالي</p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-xs font-bold">
              {new Date().toLocaleDateString('ar-SA')}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/30 border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">إجمالي المبيعات (Sales Today)</p>
              <p className="text-2xl font-black text-white">₪{stats.totalSales.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-slate-400">عدد الفواتير: <span className="text-white font-bold">{stats.invoiceCount}</span></span>
              </div>
            </div>
            <div className="bg-slate-800/30 border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">المصروفات (Expenses)</p>
              <p className="text-2xl font-black text-red-500">₪{stats.expenses.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/30 border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">السحوبات (Withdrawals)</p>
              <p className="text-2xl font-black text-orange-500">₪{stats.withdrawals.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/30 border border-white/5 p-4 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">صافي الصندوق (Net Cash)</p>
              <p className="text-2xl font-black text-emerald-500">₪{stats.netCash.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/20 border border-white/5">
              <span className="text-xs text-slate-400">نقدي (Cash)</span>
              <span className="text-sm font-bold text-white">₪{stats.cashSales.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/20 border border-white/5">
              <span className="text-xs text-slate-400">بطاقة (Card)</span>
              <span className="text-sm font-bold text-white">₪{stats.cardSales.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/20 border border-white/5">
              <span className="text-xs text-slate-400">تطبيقات (Apps)</span>
              <span className="text-sm font-bold text-white">₪{stats.walletSales.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">حركة الصندوق (Cashbox Movements)</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setTransactionType(FinancialTransactionType.EXPENSE); setShowTransactionModal(true); }}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all"
                  >
                    <ArrowDownRight size={14} />
                    مصروف
                  </button>
                  <button 
                    onClick={() => { setTransactionType(FinancialTransactionType.WITHDRAWAL); setShowTransactionModal(true); }}
                    className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all"
                  >
                    <Wallet size={14} />
                    سحب
                  </button>
                  <button 
                    onClick={() => { setTransactionType(FinancialTransactionType.DEPOSIT); setShowTransactionModal(true); }}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all"
                  >
                    <Plus size={14} />
                    إيداع
                  </button>
                </div>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {financialTransactions.slice().reverse().map(tx => (
                  <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-white/5 hover:border-white/10 transition-all">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === FinancialTransactionType.SALE || tx.type === FinancialTransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500' : 
                      tx.type === FinancialTransactionType.REFUND || tx.type === FinancialTransactionType.VOID ? 'bg-red-500/10 text-red-500' :
                      'bg-orange-500/10 text-orange-500'
                    }`}>
                      {tx.type === FinancialTransactionType.SALE || tx.type === FinancialTransactionType.DEPOSIT ? <TrendingUp size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{tx.reason}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(tx.timestamp).toLocaleString('ar-SA')} • {tx.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        tx.type === FinancialTransactionType.SALE || tx.type === FinancialTransactionType.DEPOSIT ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {tx.type === FinancialTransactionType.SALE || tx.type === FinancialTransactionType.DEPOSIT ? '+' : '-'}₪{tx.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500">بواسطة: {employees.find(e => e.id === tx.cashierId)?.name || 'النظام'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">حالة الشفت الحالي</h3>
              
              {!currentShift ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Lock size={32} />
                  </div>
                  <div>
                    <p className="text-white font-bold">لا يوجد شفت مفتوح</p>
                    <p className="text-xs text-slate-500">يجب فتح شفت لبدء العمليات المالية</p>
                  </div>
                  <button 
                    onClick={() => setShowShiftModal(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20"
                  >
                    فتح شفت جديد
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-500 font-bold uppercase">الرصيد المتوقع في الصندوق</p>
                      <div className="flex items-center gap-1 text-emerald-500">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold">متوازن</span>
                      </div>
                    </div>
                    <p className="text-3xl font-black text-white">₪{currentBalance.toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">رصيد البداية</p>
                      <p className="text-sm font-bold text-white">₪{currentShift.openingBalance.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">إجمالي المبيعات</p>
                      <p className="text-sm font-bold text-emerald-500">₪{totalSales.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">المصروفات</p>
                      <p className="text-sm font-bold text-red-500">₪{totalExpenses.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">السحوبات</p>
                      <p className="text-sm font-bold text-orange-500">₪{totalWithdrawals.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">الكاشير المسئول:</span>
                      <span className="text-white font-bold">{employees.find(e => e.id === currentShift.cashierId)?.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">وقت البدء:</span>
                      <span className="text-white font-bold">{new Date(currentShift.startTime).toLocaleTimeString('ar-SA')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">نوع الشفت:</span>
                      <span className="text-white font-bold">{currentShift.type}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setClosingCash(currentBalance); setShowShiftModal(true); }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all border border-white/5"
                  >
                    إغلاق الشفت (Close Shift)
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">توزيع طرق الدفع</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'كاش', value: stats.cashSales },
                        { name: 'بطاقة', value: stats.cardSales },
                        { name: 'محفظة', value: stats.walletSales },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Shift Modal */}
        <AnimatePresence>
          {showShiftModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowShiftModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
              >
                <h3 className="text-2xl font-black text-white mb-6">
                  {currentShift ? 'إغلاق الشفت' : 'فتح شفت جديد'}
                </h3>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  if (currentShift) {
                    closeShift(parseFloat(formData.get('closingBalance') as string));
                  } else {
                    openShift(
                      parseFloat(formData.get('openingBalance') as string),
                      formData.get('type') as any
                    );
                  }
                  setShowShiftModal(false);
                }} className="space-y-6">
                  {currentShift ? (
                    <>
                      <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">الرصيد المتوقع:</span>
                          <span className="text-white font-bold">₪{currentBalance.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">الرصيد الفعلي في الصندوق</label>
                        <input 
                          name="closingBalance"
                          type="number" 
                          defaultValue={currentBalance}
                          className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">رصيد البداية (Opening Cash)</label>
                        <input 
                          name="openingBalance"
                          type="number" 
                          placeholder="0.00"
                          className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">فترة العمل</label>
                        <select 
                          name="type"
                          className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none"
                        >
                          <option value="MORNING">صباحي (Morning)</option>
                          <option value="EVENING">مسائي (Evening)</option>
                          <option value="NIGHT">ليلي (Night)</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowShiftModal(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-900/20"
                    >
                      {currentShift ? 'تأكيد الإغلاق' : 'بدء الشفت'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Transaction Modal */}
        <AnimatePresence>
          {showTransactionModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTransactionModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl"
              >
                <h3 className="text-2xl font-black text-white mb-6">
                  إضافة {transactionType === FinancialTransactionType.EXPENSE ? 'مصروف' : transactionType === FinancialTransactionType.WITHDRAWAL ? 'سحب' : 'إيداع'}
                </h3>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addFinancialTransaction({
                    shiftId: currentShift?.id || 's1',
                    cashierId: currentUser?.id || 'e1',
                    type: transactionType,
                    amount: parseFloat(formData.get('amount') as string),
                    reason: formData.get('reason') as string,
                  });
                  setShowTransactionModal(false);
                }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">المبلغ</label>
                    <input 
                      name="amount"
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">السبب / التفاصيل</label>
                    <textarea 
                      name="reason"
                      rows={3}
                      className="w-full bg-slate-800 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none"
                      required
                    ></textarea>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowTransactionModal(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-900/20"
                    >
                      حفظ العملية
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderEmployees = () => <EmployeeManagement />;

  const renderCustomers = () => <CustomerManagement initialType={CustomerType.REGULAR} />;

  const renderSuppliers = () => <CustomerManagement initialType={CustomerType.SUPPLIER} />;

  const renderArchive = () => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<FinancialTransactionType | 'ALL'>('ALL');
    const [dateFilter, setDateFilter] = useState('');

    const filtered = financialTransactions.filter(tx => {
      const matchesSearch = tx.reason.toLowerCase().includes(search.toLowerCase()) || 
                           tx.id.toLowerCase().includes(search.toLowerCase()) ||
                           tx.cashierId.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
      const matchesDate = !dateFilter || new Date(tx.timestamp).toISOString().split('T')[0] === dateFilter;
      return matchesSearch && matchesType && matchesDate;
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white">أرشيف العمليات المالية (Financial Archive)</h2>
            <p className="text-xs text-slate-500 font-medium">البحث في جميع العمليات المالية السابقة</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-slate-900 border border-white/5 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Download size={16} />
              تصدير (Export)
            </button>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="بحث بالسبب، المعرف، أو الموظف..." 
              className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="bg-slate-800/50 border border-white/5 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-red-500/50"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="ALL">جميع الأنواع</option>
            {Object.values(FinancialTransactionType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input 
            type="date" 
            className="bg-slate-800/50 border border-white/5 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-red-500/50"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-right">
            <thead>
              <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4">المعرف</th>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">السبب</th>
                <th className="px-6 py-4">الموظف</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">#{tx.id.slice(-6)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      tx.type === FinancialTransactionType.SALE ? 'bg-emerald-500/10 text-emerald-500' :
                      tx.type === FinancialTransactionType.EXPENSE ? 'bg-red-500/10 text-red-500' :
                      tx.type === FinancialTransactionType.WITHDRAWAL ? 'bg-orange-500/10 text-orange-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">₪{tx.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{tx.reason}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{tx.cashierId}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(tx.timestamp).toLocaleString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-slate-500 hover:text-white transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    لا توجد عمليات تطابق البحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOrderDetails = (order: Order) => {
    const table = tables.find(t => t.id === order.tableId);
    
    return (
      <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-in fade-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-slate-900 border-b border-white/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedOrderId(null)}
              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <X size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">طلب #{order.orderNumber}</h2>
              <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString('ar-SA')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all">
              <Printer size={18} />
              طباعة الفاتورة
            </button>
            <button 
              onClick={() => setShowCancelPrompt(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all"
            >
              <XCircle size={18} />
              إلغاء الطلب
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Sub-Modals */}
          <AnimatePresence>
            {showCancelPrompt && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl"
                >
                  <h3 className="text-xl font-bold text-white mb-4">إلغاء الطلب</h3>
                  <p className="text-slate-400 text-sm mb-4">يرجى تحديد سبب إلغاء الطلب #{order.orderNumber}:</p>
                  <textarea 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="مثال: خطأ من الكاشير، الزبون ألغى الطلب..."
                    className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 min-h-[100px] mb-6"
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowCancelPrompt(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      تراجع
                    </button>
                    <button 
                      onClick={() => {
                        cancelOrder(order.id, cancelReason);
                        setShowCancelPrompt(false);
                        setSelectedOrderId(null);
                      }}
                      disabled={!cancelReason.trim()}
                      className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      تأكيد الإلغاء
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {showTransferModal && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl"
                >
                  <h3 className="text-xl font-bold text-white mb-4">تحويل الطاولة</h3>
                  <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto p-2">
                    {tables.filter(t => t.status === 'AVAILABLE').map(t => (
                      <button 
                        key={t.id}
                        onClick={() => {
                          transferOrder(order.id, t.id);
                          setShowTransferModal(false);
                        }}
                        className="aspect-square bg-slate-800 hover:bg-emerald-500/20 border border-white/5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group"
                      >
                        <span className="text-xs font-bold text-white group-hover:text-emerald-500">{t.name}</span>
                        <span className="text-[8px] text-slate-500">متاحة</span>
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowTransferModal(false)}
                    className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    إغلاق
                  </button>
                </motion.div>
              </div>
            )}

            {showMergeModal && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl"
                >
                  <h3 className="text-xl font-bold text-white mb-4">دمج الطلبات</h3>
                  <p className="text-slate-400 text-sm mb-4">اختر الطلب الذي تريد دمج الطلب الحالي معه:</p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {activeOrders.filter(o => o.id !== order.id && o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELED).map(o => (
                      <button 
                        key={o.id}
                        onClick={() => {
                          mergeOrders(order.id, o.id);
                          setShowMergeModal(false);
                          setSelectedOrderId(null);
                        }}
                        className="w-full bg-slate-800 hover:bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between transition-all"
                      >
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">#{o.orderNumber}</p>
                          <p className="text-[10px] text-slate-500">{o.customerName || 'عميل نقدي'}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-500">${o.total.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowMergeModal(false)}
                    className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all"
                  >
                    إغلاق
                  </button>
                </motion.div>
              </div>
            )}

            {showSplitModal && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-2xl w-full shadow-2xl"
                >
                  <h3 className="text-xl font-bold text-white mb-4">تقسيم الفاتورة</h3>
                  <p className="text-slate-400 text-sm mb-4">اختر الأصناف التي تريد نقلها إلى فاتورة جديدة:</p>
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {order.items.map((item) => {
                      const selected = splitItems.find(si => si.uniqueId === item.uniqueId);
                      return (
                        <div key={item.uniqueId} className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => {
                                if (selected) {
                                  setSplitItems(splitItems.filter(si => si.uniqueId !== item.uniqueId));
                                } else {
                                  setSplitItems([...splitItems, { uniqueId: item.uniqueId, quantity: 1 }]);
                                }
                              }}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                                selected ? 'bg-red-500 border-red-500 text-white' : 'border-white/20'
                              }`}
                            >
                              {selected && <Check size={14} />}
                            </button>
                            <div>
                              <p className="text-sm font-bold text-white">{item.name}</p>
                              <p className="text-[10px] text-slate-500">${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          {selected && (
                            <div className="flex items-center gap-3 bg-slate-900 px-3 py-1 rounded-lg border border-white/5">
                              <button 
                                onClick={() => {
                                  if (selected.quantity > 1) {
                                    setSplitItems(splitItems.map(si => si.uniqueId === item.uniqueId ? { ...si, quantity: si.quantity - 1 } : si));
                                  }
                                }}
                                className="text-slate-400 hover:text-white"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-bold text-white min-w-[20px] text-center">{selected.quantity}</span>
                              <button 
                                onClick={() => {
                                  if (selected.quantity < item.quantity) {
                                    setSplitItems(splitItems.map(si => si.uniqueId === item.uniqueId ? { ...si, quantity: si.quantity + 1 } : si));
                                  }
                                }}
                                className="text-slate-400 hover:text-white"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => {
                        setShowSplitModal(false);
                        setSplitItems([]);
                      }}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={() => {
                        splitOrder(order.id, splitItems);
                        setShowSplitModal(false);
                        setSplitItems([]);
                        setSelectedOrderId(null);
                      }}
                      disabled={splitItems.length === 0}
                      className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      تأكيد التقسيم
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Info & Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">النوع</p>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      order.type === OrderType.DINE_IN ? 'bg-blue-500/10 text-blue-500' :
                      order.type === OrderType.TAKEAWAY ? 'bg-orange-500/10 text-orange-500' :
                      'bg-purple-500/10 text-purple-500'
                    }`}>
                      <UtensilsCrossed size={16} />
                    </div>
                    <span className="font-bold text-white">{order.type}</span>
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">الطاولة</p>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                      <LayoutGrid size={16} />
                    </div>
                    <span className="font-bold text-white">{table?.name || '---'}</span>
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">الحالة</p>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      order.status === OrderStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-500' :
                      order.status === OrderStatus.CANCELED ? 'bg-red-500/10 text-red-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      <Clock size={16} />
                    </div>
                    <span className="font-bold text-white">{order.status}</span>
                  </div>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">العميل</p>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                      <Users size={16} />
                    </div>
                    <span className="font-bold text-white truncate">{order.customerName || 'عميل نقدي'}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <ShoppingCart size={18} className="text-red-500" />
                    الأصناف المطلوبة
                  </h3>
                  <span className="text-xs text-slate-500">{order.items.length} أصناف</span>
                </div>
                <table className="w-full text-right">
                  <thead>
                    <tr className="text-slate-500 text-xs border-b border-white/5">
                      <th className="p-4 font-medium">الصنف</th>
                      <th className="p-4 font-medium text-center">الكمية</th>
                      <th className="p-4 font-medium">السعر</th>
                      <th className="p-4 font-medium">الإجمالي</th>
                      <th className="p-4 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="text-sm hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <p className="text-white font-medium">{item.name}</p>
                          {item.note && <p className="text-[10px] text-red-400 mt-1">*{item.note}</p>}
                        </td>
                        <td className="p-4 text-center font-bold text-white">{item.quantity}</td>
                        <td className="p-4 text-slate-400">${item.price.toFixed(2)}</td>
                        <td className="p-4 font-bold text-white">${(item.price * item.quantity).toFixed(2)}</td>
                        <td className="p-4">
                          <select 
                            value={item.status || OrderStatus.PREPARING}
                            onChange={(e) => updateOrderItemStatus(order.id, item.uniqueId, e.target.value as OrderStatus)}
                            className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none"
                          >
                            <option value={OrderStatus.PREPARING}>قيد التحضير</option>
                            <option value={OrderStatus.READY}>جاهز</option>
                            <option value={OrderStatus.DELIVERED}>تم التسليم</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => setShowTransferModal(true)}
                  className="bg-slate-900 border border-white/5 p-4 rounded-2xl hover:bg-slate-800 transition-all text-center group"
                >
                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform">
                    <Building2 size={20} />
                  </div>
                  <p className="text-sm font-bold text-white">تحويل</p>
                  <p className="text-[10px] text-slate-500">نقل الطاولة</p>
                </button>
                <button 
                  onClick={() => setShowMergeModal(true)}
                  className="bg-slate-900 border border-white/5 p-4 rounded-2xl hover:bg-slate-800 transition-all text-center group"
                >
                  <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-500 group-hover:scale-110 transition-transform">
                    <Layers size={20} />
                  </div>
                  <p className="text-sm font-bold text-white">دمج</p>
                  <p className="text-[10px] text-slate-500">دمج الطلبات</p>
                </button>
                <button 
                  onClick={() => setShowSplitModal(true)}
                  className="bg-slate-900 border border-white/5 p-4 rounded-2xl hover:bg-slate-800 transition-all text-center group"
                >
                  <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-red-500 group-hover:scale-110 transition-transform">
                    <Scissors size={20} />
                  </div>
                  <p className="text-sm font-bold text-white">تقسيم</p>
                  <p className="text-[10px] text-slate-500">فصل الفاتورة</p>
                </button>
                <button 
                  onClick={() => {
                    const amount = prompt('أدخل مبلغ المرتجع:');
                    if (amount) refundOrder(order.id, parseFloat(amount));
                  }}
                  className="bg-slate-900 border border-white/5 p-4 rounded-2xl hover:bg-slate-800 transition-all text-center group"
                >
                  <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-orange-500 group-hover:scale-110 transition-transform">
                    <DollarSign size={20} />
                  </div>
                  <p className="text-sm font-bold text-white">مرتجع</p>
                  <p className="text-[10px] text-slate-500">إرجاع مبلغ</p>
                </button>
              </div>
            </div>

            {/* Right Column: Summary & Timeline */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-red-500" />
                  ملخص الفاتورة
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">المجموع الفرعي</span>
                    <span className="text-white font-medium">${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">الضريبة (0%)</span>
                    <span className="text-white font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">الخصم</span>
                    <span className="text-red-500 font-medium">-${order.discount.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-lg font-bold text-white">الإجمالي</span>
                    <span className="text-2xl font-black text-emerald-500">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">طريقة الدفع</span>
                    <span className="text-xs font-bold text-white">{order.paymentMethod || 'لم يتم الدفع'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-500">
                      <Wallet size={14} />
                    </div>
                    <span className="text-[10px] text-slate-500">تم الدفع بواسطة الكاشير: أحمد</span>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                  <History size={18} className="text-red-500" />
                  تتبع الطلب
                </h3>
                <div className="space-y-6 relative before:absolute before:right-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                  {order.timeline.map((event, idx) => (
                    <div key={idx} className="relative pr-8">
                      <div className={`absolute right-0 top-1 w-6 h-6 rounded-full border-4 border-slate-900 flex items-center justify-center z-10 ${
                        idx === 0 ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{event.status}</p>
                        <p className="text-[10px] text-slate-500">{new Date(event.time).toLocaleTimeString('ar-SA')}</p>
                        {event.note && <p className="text-[10px] text-red-400 mt-1">{event.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    const selectedOrder = activeOrders.find(o => o.id === selectedOrderId);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {selectedOrder && renderOrderDetails(selectedOrder)}

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'ACTIVE', label: 'الطلبات النشطة', icon: Activity, color: 'blue' },
            { id: 'PREPARING', label: 'قيد التحضير', icon: Flame, color: 'orange' },
            { id: 'READY', label: 'جاهزة للاستلام', icon: CheckCircle2, color: 'emerald' },
            { id: 'CLOSED', label: 'طلبات مغلقة', icon: Archive, color: 'slate' },
            { id: 'CANCELED', label: 'طلبات ملغاة', icon: XCircleIcon, color: 'red' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setOrderTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                orderTab === tab.id 
                  ? `bg-${tab.color}-500/10 border-${tab.color}-500/50 text-${tab.color}-500 shadow-lg shadow-${tab.color}-500/10` 
                  : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
                orderTab === tab.id ? `bg-${tab.color}-500/20` : 'bg-slate-800'
              }`}>
                {activeOrders.filter(o => {
                  if (tab.id === 'ACTIVE') return o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELED;
                  if (tab.id === 'PREPARING') return o.status === OrderStatus.PREPARING;
                  if (tab.id === 'READY') return o.status === OrderStatus.READY;
                  if (tab.id === 'CLOSED') return o.status === OrderStatus.COMPLETED;
                  return o.status === OrderStatus.CANCELED;
                }).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              placeholder="البحث برقم الطلب، اسم العميل، أو رقم الهاتف..." 
              className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => setShowOrderFilters(!showOrderFilters)}
              className={`flex-1 md:flex-none border px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                showOrderFilters ? 'bg-red-500 border-red-500 text-white' : 'bg-slate-900 border-white/5 text-white hover:bg-slate-800'
              }`}
            >
              <Filter size={18} />
              تصفية
            </button>
            <button className="flex-1 md:flex-none bg-slate-900 border border-white/5 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-slate-800 transition-all">
              <Download size={18} />
              تصدير
            </button>
          </div>
        </div>

        {/* Advanced Order Filters */}
        <AnimatePresence>
          {showOrderFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase mb-1 block">نوع الطلب</label>
                  <select 
                    value={orderFilters.type}
                    onChange={(e) => setOrderFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="all">الكل</option>
                    <option value={OrderType.DINE_IN}>محلي</option>
                    <option value={OrderType.TAKEAWAY}>سفري</option>
                    <option value={OrderType.DELIVERY}>توصيل</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase mb-1 block">التاريخ</label>
                  <select 
                    value={orderFilters.dateRange}
                    onChange={(e) => setOrderFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="today">اليوم</option>
                    <option value="yesterday">أمس</option>
                    <option value="week">هذا الأسبوع</option>
                    <option value="month">هذا الشهر</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={() => {
                      setOrderSearchQuery('');
                      setOrderFilters({ type: 'all', cashierId: 'all', dateRange: 'today' });
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  >
                    إعادة تعيين
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-slate-500 text-sm border-b border-white/5">
                  <th className="p-4 font-medium">رقم الطلب</th>
                  <th className="p-4 font-medium">العميل</th>
                  <th className="p-4 font-medium">النوع</th>
                  <th className="p-4 font-medium">الحالة</th>
                  <th className="p-4 font-medium">الإجمالي</th>
                  <th className="p-4 font-medium">التاريخ والوقت</th>
                  <th className="p-4 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map(order => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrderId(order.id)}
                    className="text-sm hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          order.status === OrderStatus.PREPARING ? 'bg-orange-500 animate-pulse' :
                          order.status === OrderStatus.READY ? 'bg-emerald-500' :
                          order.status === OrderStatus.DELIVERED ? 'bg-blue-500' :
                          'bg-slate-500'
                        }`} />
                        <span className="font-bold text-white">#{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-medium">{order.customerName || 'عميل نقدي'}</p>
                      <p className="text-[10px] text-slate-500">{order.customerPhone || '---'}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        order.type === OrderType.DINE_IN ? 'bg-blue-500/10 text-blue-500' :
                        order.type === OrderType.TAKEAWAY ? 'bg-orange-500/10 text-orange-500' :
                        'bg-purple-500/10 text-purple-500'
                      }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${
                        order.status === OrderStatus.COMPLETED ? 'text-emerald-500' :
                        order.status === OrderStatus.CANCELED ? 'text-red-500' :
                        order.status === OrderStatus.READY ? 'text-emerald-500' :
                        order.status === OrderStatus.PREPARING ? 'text-orange-500' :
                        'text-blue-500'
                      }`}>
                        {order.status === OrderStatus.COMPLETED ? <CheckCircle2 size={12} /> :
                         order.status === OrderStatus.CANCELED ? <XCircle size={12} /> :
                         order.status === OrderStatus.READY ? <CheckCircle2 size={12} /> :
                         order.status === OrderStatus.PREPARING ? <Flame size={12} /> :
                         <Clock size={12} />}
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">${order.total.toFixed(2)}</td>
                    <td className="p-4">
                      <p className="text-slate-300">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                      <p className="text-[10px] text-slate-500">{new Date(order.createdAt).toLocaleTimeString('ar-SA')}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order.id); }}
                          className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); }}
                          className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderMenu = () => {
    const stats = {
      total: menuItems.length,
      available: menuItems.filter(i => i.status === 'AVAILABLE').length,
      outOfStock: menuItems.filter(i => i.status === 'OUT_OF_STOCK').length,
      popular: menuItems.filter(i => i.popular).length,
    };

    const filteredMenuItems = menuItems.filter(item => {
      const matchesSearch = 
        item.nameAr.toLowerCase().includes(menuSearchQuery.toLowerCase()) || 
        item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
        item.code?.toLowerCase().includes(menuSearchQuery.toLowerCase());
      
      const matchesDept = menuFilters.departmentId === 'all' || item.departmentId === menuFilters.departmentId;
      const matchesStatus = menuFilters.status === 'all' || item.status === menuFilters.status;
      const matchesPopular = !menuFilters.popular || item.popular;
      const matchesChef = !menuFilters.chefRecommended || item.chefRecommended;
      const matchesSeasonal = !menuFilters.seasonal || item.seasonal;

      return matchesSearch && matchesDept && matchesStatus && matchesPopular && matchesChef && matchesSeasonal;
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Package size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">إجمالي الأصناف</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">متوفر حالياً</p>
                <p className="text-xl font-bold text-white">{stats.available}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">نفذت الكمية</p>
                <p className="text-xl font-bold text-white">{stats.outOfStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <Star size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">الأكثر مبيعاً</p>
                <p className="text-xl font-bold text-white">{stats.popular}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="البحث عن صنف بالاسم أو الكود..." 
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="hidden md:block px-3 py-1 bg-slate-800 rounded-full border border-white/5">
                <span className="text-[10px] font-bold text-slate-400">نتائج البحث: {filteredMenuItems.length}</span>
              </div>
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex-1 md:flex-none border px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  showAdvancedFilters 
                    ? 'bg-red-600/10 border-red-600/50 text-red-500' 
                    : 'bg-slate-900 border-white/5 text-white hover:bg-slate-800'
                }`}
              >
                <Filter size={18} />
                تصفية متقدمة
              </button>
              <button 
                onClick={() => openModal('MENU_ITEM')}
                className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg shadow-red-900/20"
              >
                <Plus size={18} />
                إضافة صنف جديد
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">القسم</label>
                    <select 
                      value={menuFilters.departmentId}
                      onChange={(e) => setMenuFilters(prev => ({ ...prev, departmentId: e.target.value }))}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="all">الكل</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.nameAr || d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">الحالة</label>
                    <select 
                      value={menuFilters.status}
                      onChange={(e) => setMenuFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="all">الكل</option>
                      <option value="AVAILABLE">متوفر</option>
                      <option value="UNAVAILABLE">غير متوفر</option>
                      <option value="OUT_OF_STOCK">نفذت الكمية</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                      menuFilters.popular ? 'bg-orange-500/10 border-orange-500/50 text-orange-500' : 'bg-slate-800 border-white/5 text-slate-400'
                    }`}>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={menuFilters.popular}
                        onChange={(e) => setMenuFilters(prev => ({ ...prev, popular: e.target.checked }))}
                      />
                      <Star size={14} />
                      <span className="text-[10px] font-bold">الأكثر مبيعاً</span>
                    </label>
                  </div>
                  <div className="flex items-end gap-2">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                      menuFilters.chefRecommended ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-800 border-white/5 text-slate-400'
                    }`}>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={menuFilters.chefRecommended}
                        onChange={(e) => setMenuFilters(prev => ({ ...prev, chefRecommended: e.target.checked }))}
                      />
                      <ChefHat size={14} />
                      <span className="text-[10px] font-bold">توصية الشيف</span>
                    </label>
                  </div>
                  <div className="flex items-end gap-2">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                      menuFilters.seasonal ? 'bg-blue-500/10 border-blue-500/50 text-blue-500' : 'bg-slate-800 border-white/5 text-slate-400'
                    }`}>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={menuFilters.seasonal}
                        onChange={(e) => setMenuFilters(prev => ({ ...prev, seasonal: e.target.checked }))}
                      />
                      <Leaf size={14} />
                      <span className="text-[10px] font-bold">موسمي</span>
                    </label>
                  </div>
                  <div className="flex items-end gap-2">
                    <button 
                      onClick={() => {
                        setMenuSearchQuery('');
                        setMenuFilters({
                          departmentId: 'all',
                          status: 'all',
                          popular: false,
                          chefRecommended: false,
                          seasonal: false
                        });
                      }}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-[10px] font-bold transition-all"
                    >
                      إعادة تعيين
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase tracking-wider border-b border-white/5">
                  <th className="p-4 font-bold">الصنف والمعلومات</th>
                  <th className="p-4 font-bold">القسم</th>
                  <th className="p-4 font-bold">التسعير</th>
                  <th className="p-4 font-bold">العمليات</th>
                  <th className="p-4 font-bold">الأداء</th>
                  <th className="p-4 font-bold">الحالة</th>
                  <th className="p-4 font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMenuItems.map(item => (
                  <tr key={item.id} className="text-sm hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/5 relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          {item.popular && (
                            <div className="absolute top-0 right-0 p-0.5 bg-orange-500 text-white rounded-bl-lg">
                              <Star size={8} fill="currentColor" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{item.nameAr || item.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Tag size={10} />
                              {item.code || `IT-${item.id.slice(-4)}`}
                            </span>
                            {item.chefRecommended && (
                              <span className="text-[8px] bg-red-500/10 text-red-500 px-1 rounded flex items-center gap-0.5">
                                <ChefHat size={8} />
                                توصية
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-slate-300 font-medium">
                          {departments.find(d => d.id === item.departmentId)?.nameAr || 'غير محدد'}
                        </span>
                        <span className="text-[10px] text-slate-500">{item.category}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">${item.price.toFixed(2)}</span>
                        {item.offerPrice && (
                          <span className="text-[10px] text-emerald-500 line-through opacity-50">${item.offerPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock size={12} />
                          {item.prepTime} دقيقة
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Monitor size={12} />
                          {item.requiresKitchen ? 'مطبخ' : 'مباشر'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{item.stats?.salesCount || 0} مبيعات</span>
                        <span className="text-[10px] text-slate-500">${(item.stats?.totalRevenue || 0).toLocaleString()} إيراد</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        item.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-500' : 
                        item.status === 'OUT_OF_STOCK' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {item.status === 'AVAILABLE' ? 'متوفر' : 
                         item.status === 'OUT_OF_STOCK' ? 'نفذ' : 'غير متاح'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openModal('MENU_ITEM', item)}
                          className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="تعديل"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteMenuItem(item.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDepartments = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900 border border-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setDeptSubView('LIST')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${deptSubView === 'LIST' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white'}`}
          >
            <LayoutGrid size={18} />
            قائمة الأقسام
          </button>
          <button 
            onClick={() => setDeptSubView('MAP')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${deptSubView === 'MAP' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Map size={18} />
            خريطة المطبخ
          </button>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="البحث عن قسم..." 
              className="w-full bg-slate-900 border border-white/5 rounded-xl py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all"
            />
          </div>
          <button 
            onClick={() => openModal('DEPARTMENT')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all shadow-lg shadow-red-900/20 whitespace-nowrap"
          >
            <Plus size={18} />
            إضافة قسم
          </button>
        </div>
      </div>

      <div>
        {deptSubView === 'LIST' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => {
            const deptItems = menuItems.filter(item => item.departmentId === dept.id);
            const activeDeptOrders = activeOrders.filter(o => o.items.some(i => i.departmentId === dept.id) && o.status !== OrderStatus.COMPLETED);
            
            return (
              <div key={dept.id} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-red-500/30 transition-all group relative overflow-hidden">
                {/* Status Indicator */}
                <div className="absolute top-0 right-0 w-1.5 h-full" style={{ backgroundColor: dept.color || '#ef4444' }}></div>
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner"
                      style={{ backgroundColor: `${dept.color || '#ef4444'}15`, color: dept.color || '#ef4444' }}
                    >
                      {dept.icon || <Layers size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{dept.nameAr || dept.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{dept.shortName || dept.id.slice(0, 3).toUpperCase()}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{dept.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => openModal('DEPARTMENT', dept)}
                      className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteDepartment(dept.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-slate-500 mb-1">الموقع / المحطة</p>
                    <div className="flex items-center gap-2">
                      <Map size={14} className="text-red-500" />
                      <span className="text-sm font-bold text-white">{dept.location || `Station ${dept.stationNumber || '?'}`}</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-slate-500 mb-1">وقت التحضير</p>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-emerald-500" />
                      <span className="text-sm font-bold text-white">{dept.defaultPrepTime || 0} دقيقة</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Package size={12} />
                      الأصناف
                    </span>
                    <span className="text-white font-bold">{deptItems.length} صنف</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Activity size={12} />
                      طلبات نشطة
                    </span>
                    <span className="text-blue-500 font-bold">{activeDeptOrders.length} طلب</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users2 size={12} />
                      الموظفين
                    </span>
                    <span className="text-white font-bold">{employees.filter(e => e.departmentId === dept.id).length} موظف</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <TrendingUp size={12} />
                      الأكثر مبيعاً
                    </span>
                    <span className="text-emerald-500 font-bold">بيتزا مارغريتا</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Zap size={12} />
                      الطاقة الاستيعابية
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            (activeDeptOrders.length / (dept.maxConcurrentOrders || 10)) > 0.8 ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (activeDeptOrders.length / (dept.maxConcurrentOrders || 10)) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-400">{activeDeptOrders.length}/{dept.maxConcurrentOrders || 10}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {dept.hasKds ? (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                        <Monitor size={10} />
                        KDS نشط
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-500/10 px-2 py-1 rounded-lg">
                        <EyeOff size={10} />
                        بدون شاشة
                      </div>
                    )}
                    {dept.autoPrintTicket && (
                      <div className="p-1 bg-blue-500/10 text-blue-500 rounded-lg" title="طباعة تلقائية">
                        <Printer size={12} />
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    dept.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 
                    dept.status === 'BUSY' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-slate-500/10 text-slate-500'
                  }`}>
                    {dept.status === 'ACTIVE' ? 'نشط' : dept.status === 'BUSY' ? 'مزدحم' : 'معطل'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 min-h-[600px] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">تخطيط محطات العمل (Kitchen Map)</h3>
                <p className="text-sm text-slate-500">توزيع الأقسام داخل المطبخ الرئيسي ومراقبة الحالة</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-400">نشط</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-slate-400">مزدحم</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                  <span className="text-slate-400">معطل</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">إجمالي الأقسام</p>
                <p className="text-2xl font-black text-white">{departments.length}</p>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">أقسام نشطة</p>
                <p className="text-2xl font-black text-white">{departments.filter(d => d.status === 'ACTIVE').length}</p>
              </div>
              <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4">
                <p className="text-[10px] text-orange-500 uppercase font-bold mb-1">أقسام مزدحمة</p>
                <p className="text-2xl font-black text-white">{departments.filter(d => d.status === 'BUSY').length}</p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4">
                <p className="text-[10px] text-blue-500 uppercase font-bold mb-1">إجمالي الطلبات</p>
                <p className="text-2xl font-black text-white">{activeOrders.length}</p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Kitchen Entrance / Aggregator Area */}
              <div className="sm:col-span-2 lg:col-span-4 bg-slate-800/40 border border-dashed border-white/10 rounded-2xl flex items-center justify-center p-8 relative group">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-2">
                    <ChefHat size={24} />
                  </div>
                  <p className="text-sm font-bold text-white uppercase tracking-widest">منطقة تجميع الطلبات (Aggregator Area)</p>
                  <p className="text-[10px] text-slate-500">نقطة خروج الطلبات النهائية وتجميع الوجبات</p>
                </div>
              </div>

              {/* Stations */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map(stationNum => {
                const dept = departments.find(d => d.stationNumber === stationNum.toString());
                const activeDeptOrders = dept ? activeOrders.filter(o => o.items.some(i => i.departmentId === dept.id) && o.status !== OrderStatus.COMPLETED) : [];
                
                return (
                  <div 
                    key={stationNum}
                    className={`relative rounded-3xl border-2 transition-all flex flex-col items-center justify-center p-6 min-h-[200px] cursor-pointer group ${
                      dept 
                        ? (dept.status === 'ACTIVE' ? 'bg-slate-800/80 border-white/10 hover:border-red-500/50' : 
                           dept.status === 'BUSY' ? 'bg-orange-500/5 border-orange-500/30 hover:border-orange-500/50' : 
                           'bg-slate-900/80 border-white/5 opacity-50')
                        : 'bg-slate-900/40 border-dashed border-white/5 hover:bg-slate-800/40'
                    }`}
                    onClick={() => dept && openModal('DEPARTMENT', dept)}
                  >
                    <div className="absolute top-3 left-3 text-[10px] font-bold text-slate-600 tracking-widest">STATION {stationNum}</div>
                    
                    {dept ? (
                      <>
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-lg group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${dept.color || '#ef4444'}20`, color: dept.color || '#ef4444' }}
                        >
                          {dept.icon || <Layers size={32} />}
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm font-bold text-white">{dept.nameAr || dept.name}</h4>
                          <div className="mt-2 flex items-center justify-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              dept.status === 'ACTIVE' ? 'bg-emerald-500' : 
                              dept.status === 'BUSY' ? 'bg-orange-500' : 'bg-slate-600'
                            }`}></span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{dept.status}</span>
                          </div>
                        </div>

                        {dept.status === 'BUSY' && (
                          <div className="absolute -top-2 -right-2 bg-orange-500 text-white p-1.5 rounded-full animate-pulse shadow-lg shadow-orange-900/20">
                            <AlertCircle size={14} />
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-900/95 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                          <p className="text-xs font-bold text-white mb-3">{dept.name}</p>
                          <div className="flex flex-col gap-2 w-full max-w-[140px]">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-500">وقت التحضير:</span>
                              <span className="text-white">{dept.defaultPrepTime}د</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-500">طلبات نشطة:</span>
                              <span className="text-blue-500 font-bold">{activeDeptOrders.length}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-500">KDS:</span>
                              <span className={dept.hasKds ? 'text-emerald-500' : 'text-slate-500'}>{dept.hasKds ? 'متصل' : 'غير متصل'}</span>
                            </div>
                          </div>
                          <button className="mt-4 text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors">تعديل الإعدادات</button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center opacity-20 group-hover:opacity-100 transition-opacity">
                        <Plus size={24} className="text-slate-500 mx-auto mb-2" />
                        <p className="text-[10px] text-slate-500 font-bold">محطة فارغة</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="إجمالي المبيعات اليوم" 
          value={`₪${stats.totalSales.toLocaleString()}`} 
          icon={TrendingUp} 
          trend="+12.5%" 
          trendUp={true} 
        />
        <StatCard 
          title="المصروفات" 
          value={`₪${stats.expenses.toLocaleString()}`} 
          icon={ArrowDownRight} 
          color="text-red-500"
        />
        <StatCard 
          title="السحوبات" 
          value={`₪${stats.withdrawals.toLocaleString()}`} 
          icon={Wallet} 
          color="text-orange-500"
        />
        <StatCard 
          title="صافي الصندوق" 
          value={`₪${stats.netCash.toLocaleString()}`} 
          icon={DollarSign} 
          color="text-emerald-500"
        />
      </div>

      {/* Payment Methods Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">نقدي (Cash)</p>
            <p className="text-xl font-black text-white">₪{stats.cashSales.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <DollarSign size={20} />
          </div>
        </div>
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">بطاقة (Card)</p>
            <p className="text-xl font-black text-white">₪{stats.cardSales.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <CreditCard size={20} />
          </div>
        </div>
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">تطبيقات (Apps/Wallet)</p>
            <p className="text-xl font-black text-white">₪{stats.walletSales.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Smartphone size={20} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-red-500" />
            مبيعات اليوم حسب الساعة
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlySalesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Layers size={20} className="text-orange-500" />
            مبيعات الأقسام
          </h3>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptSalesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptSalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/3 space-y-2">
              {deptSalesData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-slate-400 truncate">{entry.name}</span>
                  <span className="text-xs font-bold text-white ml-auto">${entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">آخر الطلبات</h3>
            <button className="text-sm text-red-500 font-bold hover:underline">عرض الكل</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-slate-500 text-sm border-b border-white/5">
                  <th className="pb-4 font-medium">رقم الطلب</th>
                  <th className="pb-4 font-medium">العميل</th>
                  <th className="pb-4 font-medium">النوع</th>
                  <th className="pb-4 font-medium">الحالة</th>
                  <th className="pb-4 font-medium">الإجمالي</th>
                  <th className="pb-4 font-medium">الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeOrders.slice(0, 5).map(order => (
                  <tr key={order.id} className="text-sm hover:bg-white/5 transition-colors">
                    <td className="py-4 font-bold text-white">#{order.id.slice(-4)}</td>
                    <td className="py-4 text-slate-300">{order.customerName || 'عميل نقدي'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        order.type === OrderType.DINE_IN ? 'bg-blue-500/10 text-blue-500' :
                        order.type === OrderType.TAKEAWAY ? 'bg-orange-500/10 text-orange-500' :
                        'bg-purple-500/10 text-purple-500'
                      }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${
                        order.status === OrderStatus.COMPLETED ? 'text-emerald-500' :
                        order.status === OrderStatus.CANCELED ? 'text-red-500' :
                        'text-blue-500'
                      }`}>
                        {order.status === OrderStatus.COMPLETED ? <CheckCircle2 size={12} /> :
                         order.status === OrderStatus.CANCELED ? <XCircle size={12} /> :
                         <Clock size={12} />}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-white">${order.total.toFixed(2)}</td>
                    <td className="py-4 text-slate-500 text-xs">{new Date(order.createdAt).toLocaleTimeString('ar-SA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">الأكثر مبيعاً</h3>
          <div className="space-y-4">
            {menuItems.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.categoryId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">124</p>
                  <p className="text-[10px] text-emerald-500 font-bold">+12%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">بوابة الإدارة المالية</h1>
          <p className="text-slate-500 text-sm font-medium">إدارة العمليات، الموظفين، والتقارير المالية</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3">
            <Calendar size={18} className="text-red-500" />
            <span className="text-sm font-bold text-white">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {view === 'DASHBOARD' && renderDashboard()}
        {view === 'DEPARTMENTS' && renderDepartments()}
        {view === 'MENU' && renderMenu()}
        {view === 'ORDERS' && renderOrders()}
        {view === 'CUSTOMERS' && renderCustomers()}
        {view === 'SUPPLIERS' && renderSuppliers()}
        {view === 'EMPLOYEES' && renderEmployees()}
        {view === 'ACCOUNTING' && renderAccounting()}
        {view === 'REPORTS' && renderReports()}
        {view === 'AUDIT_LOG' && (canAudit ? renderAuditLog() : <div className="p-20 text-center text-slate-500">ليس لديك صلاحية للوصول إلى سجل التدقيق</div>)}
        {view === 'ARCHIVE' && (canManageFinance ? renderArchive() : <div className="p-20 text-center text-slate-500">ليس لديك صلاحية للوصول إلى الأرشيف</div>)}
        {view === 'SETTINGS' && (canEditSettings ? renderSettings() : <div className="p-20 text-center text-slate-500">ليس لديك صلاحية للوصول إلى الإعدادات</div>)}
      </div>

      {renderModal()}
    </div>
  );
};

// --- Sub-components ---

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendUp, color = "text-red-500" }) => (
  <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 hover:border-red-500/30 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      )}
    </div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
    <h4 className="text-2xl font-black text-white">{value}</h4>
  </div>
);

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon: Icon, color }) => (
  <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-red-500/30 transition-all group cursor-pointer">
    <div className={`w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center ${color} mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-500 mb-6">{description}</p>
    <div className="flex items-center justify-between text-red-500 font-bold text-sm">
      <span>توليد الآن</span>
      <ChevronRight size={18} />
    </div>
  </div>
);
