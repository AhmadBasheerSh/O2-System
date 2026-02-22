
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Order, OrderType, OrderStatus, MenuItem, OrderItem, User, PaymentMethod, 
  Transaction, SavedCard, Table, Shift, Branch, Department, JobTitle, JobType, Employee,
  TableStatus
} from './types';
import { TABLES } from './constants';

interface AppContextType {
  activeOrders: Order[];
  currentUser: User | null;
  currentCart: OrderItem[];
  cartOrderType: OrderType;
  userRole: 'CASHIER' | 'CUSTOMER' | 'WAITER' | 'ADMIN' | 'BRANCH_MANAGER' | null;
  
  branches: Branch[];
  departments: Department[];
  jobTitles: JobTitle[];
  jobTypes: JobType[];
  employees: Employee[];
  
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  updateBranch: (id: string, branch: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  addJobTitle: (jt: Omit<JobTitle, 'id'>) => void;
  updateJobTitle: (id: string, jt: Partial<JobTitle>) => void;
  deleteJobTitle: (id: string) => void;
  addJobType: (jt: Omit<JobType, 'id'>) => void;
  updateJobType: (id: string, jt: Partial<JobType>) => void;
  deleteJobType: (id: string) => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  login: (name: string, role: 'CASHIER' | 'CUSTOMER' | 'WAITER' | 'ADMIN' | 'BRANCH_MANAGER', phone?: string, branchId?: string) => void;
  logout: () => void;
  addToCart: (item: MenuItem, customization?: any) => void;
  removeFromCart: (uniqueId: string) => void;
  updateCartQuantity: (uniqueId: string, delta: number) => void;
  updateCartItem: (uniqueId: string, updates: Partial<OrderItem>) => void;
  submitOrder: (status: OrderStatus, paymentMethod?: PaymentMethod, discount?: number, customerDetails?: { name: string, phone: string, note?: string }) => void;
  depositToWallet: (amount: number, bonus?: number) => void;
  refundToWallet: (orderId: string) => void;
  saveNewCard: (card: Omit<SavedCard, 'id'>) => void;
  toggleFavorite: (itemId: string) => void;
  setOrderType: (type: OrderType) => void;
  reorder: (orderId: string) => void;
  
  tables: Table[];
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;
  updateTableStatus: (tableId: string, status: TableStatus, extra?: Partial<Table>) => void;
  transferTable: (fromId: string, toId: string) => void;
  mergeTables: (tableIds: string[]) => void;
  editingOrderId: string | null;
  clearCart: () => void;
  voidOrder: (orderId: string) => void;
  completeOrder: (orderId: string, payment: { method: string | PaymentMethod }) => void;
  loadOrderToPOS: (order: Order) => void;
  currentShift: Shift | null;
  openShift: (openingBalance: number) => void;
  closeShift: (closingBalance: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([
    {
      id: 'o-1',
      orderNumber: 'ORD-1001',
      type: OrderType.DINE_IN,
      status: OrderStatus.IN_PROGRESS,
      items: [
        { itemId: '1', uniqueId: 'ui-1', name: 'برجر كلاسيك', quantity: 2, price: 25, basePrice: 25 },
        { itemId: '3', uniqueId: 'ui-2', name: 'عصير برتقال', quantity: 2, price: 12, basePrice: 12 }
      ],
      tableId: 't-1',
      createdAt: new Date(Date.now() - 30 * 60000),
      subtotal: 74,
      tax: 0,
      discount: 0,
      total: 74,
      timeline: [{ status: OrderStatus.IN_PROGRESS, time: new Date() }]
    },
    {
      id: 'o-2',
      orderNumber: 'ORD-1002',
      type: OrderType.DINE_IN,
      status: OrderStatus.READY,
      items: [
        { itemId: '7', uniqueId: 'ui-3', name: 'مشاوي مشكلة', quantity: 1, price: 85, basePrice: 85 }
      ],
      tableId: 't-2',
      createdAt: new Date(Date.now() - 45 * 60000),
      subtotal: 85,
      tax: 0,
      discount: 0,
      total: 85,
      timeline: [{ status: OrderStatus.READY, time: new Date() }]
    }
  ]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'CASHIER' | 'CUSTOMER' | 'WAITER' | 'ADMIN' | 'BRANCH_MANAGER' | null>(null);
  const [currentCart, setCurrentCart] = useState<OrderItem[]>([]);
  const [cartOrderType, setCartOrderType] = useState<OrderType>(OrderType.DELIVERY);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tables, setTables] = useState<Table[]>(TABLES);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const [branches, setBranches] = useState<Branch[]>([
    { id: 'b1', name: 'فرع غزة الرئيسي', address: 'شارع الثلاثيني', phone: '0599001122', status: 'ACTIVE' },
    { id: 'b2', name: 'فرع الرمال', address: 'دوار حيدر', phone: '0599112233', status: 'ACTIVE' }
  ]);
  const [departments, setDepartments] = useState<Department[]>([
    { id: 'd1', name: 'الإدارة العامة', branchId: 'b1', description: 'المكتب الرئيسي' },
    { id: 'd2', name: 'المطبخ', branchId: 'b1', description: 'تحضير الطعام', parentId: 'd1' },
    { id: 'd3', name: 'الخدمة والصالة', branchId: 'b1', description: 'خدمة الزبائن', parentId: 'd1' },
    { id: 'd4', name: 'قسم المخبوزات', branchId: 'b1', description: 'فرعي للمطبخ', parentId: 'd2' }
  ]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([
    { id: 'jt1', name: 'مدير عام', departmentIds: ['d1'], description: 'المسؤول التنفيذي' },
    { id: 'jt2', name: 'شيف تنفيذي', departmentIds: ['d2'], description: 'إدارة المطبخ' },
    { id: 'jt3', name: 'كاشير', departmentIds: ['d3'], description: 'إدارة الصندوق' }
  ]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([
    { id: 'ty1', name: 'دوام كامل (Permanent)', description: 'تثبيت كامل' },
    { id: 'ty2', name: 'دوام جزئي (Part-time)', description: 'نظام الساعات' }
  ]);
  const [employees, setEmployees] = useState<Employee[]>([
    { 
      id: 'e1', name: 'ياسين أحمد', phone: '0599111222', email: 'admin@resto.com', 
      address: 'غزة - الرمال', nationalId: '401122334', dob: new Date(1985, 2, 15),
      jobTitleId: 'jt1', departmentId: 'd1', branchId: 'b1', typeId: 'ty1',
      hireDate: new Date(2020, 0, 1), salary: 5000, status: 'ACTIVE', role: 'ADMIN'
    },
    { 
      id: 'e2', name: 'محمد علي', phone: '0599111333', email: 'b_manager@resto.com', 
      address: 'غزة - الرمال', nationalId: '401122335', dob: new Date(1988, 5, 20),
      jobTitleId: 'jt1', departmentId: 'd1', branchId: 'b2', typeId: 'ty1',
      hireDate: new Date(2021, 0, 1), salary: 3500, status: 'ACTIVE', role: 'BRANCH_MANAGER'
    }
  ]);

  const addBranch = (b: Omit<Branch, 'id'>) => setBranches(p => [...p, { ...b, id: 'b_' + Math.random().toString(36).substr(2, 5) }]);
  const updateBranch = (id: string, b: Partial<Branch>) => setBranches(p => p.map(x => x.id === id ? { ...x, ...b } : x));
  const deleteBranch = (id: string) => setBranches(p => p.filter(x => x.id !== id));
  const addDepartment = (d: Omit<Department, 'id'>) => setDepartments(p => [...p, { ...d, id: 'd_' + Math.random().toString(36).substr(2, 5) }]);
  const updateDepartment = (id: string, d: Partial<Department>) => setDepartments(p => p.map(x => x.id === id ? { ...x, ...d } : x));
  const deleteDepartment = (id: string) => setDepartments(p => p.filter(x => x.id !== id));
  const addJobTitle = (jt: Omit<JobTitle, 'id'>) => setJobTitles(p => [...p, { ...jt, id: 'jt_' + Math.random().toString(36).substr(2, 5) }]);
  const updateJobTitle = (id: string, jt: Partial<JobTitle>) => setJobTitles(p => p.map(x => x.id === id ? { ...x, ...jt } : x));
  const deleteJobTitle = (id: string) => setJobTitles(p => p.filter(x => x.id !== id));
  const addJobType = (jt: Omit<JobType, 'id'>) => setJobTypes(p => [...p, { ...jt, id: 'ty_' + Math.random().toString(36).substr(2, 5) }]);
  const updateJobType = (id: string, jt: Partial<JobType>) => setJobTypes(p => p.map(x => x.id === id ? { ...x, ...jt } : x));
  const deleteJobType = (id: string) => setJobTypes(p => p.filter(x => x.id !== id));
  const addEmployee = (e: Omit<Employee, 'id'>) => setEmployees(p => [...p, { ...e, id: 'e_' + Math.random().toString(36).substr(2, 5) }]);
  const updateEmployee = (id: string, e: Partial<Employee>) => setEmployees(p => p.map(x => x.id === id ? { ...x, ...e } : x));
  const deleteEmployee = (id: string) => setEmployees(p => p.filter(x => x.id !== id));

  const login = (name: string, role: 'CASHIER' | 'CUSTOMER' | 'WAITER' | 'ADMIN' | 'BRANCH_MANAGER', phone: string = '', branchId: string = 'b1') => {
    setUserRole(role);
    setCurrentUser({
      id: 'u_' + Math.random().toString(36).substr(2, 5),
      name, phone, role: (role === 'ADMIN' ? 'CASHIER' : role === 'BRANCH_MANAGER' ? 'BRANCH_MANAGER' : role),
      branchId: role === 'BRANCH_MANAGER' ? branchId : undefined,
      points: 120, balance: 350.0, tier: 'GOLD', vouchers: [], favorites: ['1', '3'], addresses: [], savedCards: [], transactions: []
    });
  };

  const logout = () => { setCurrentUser(null); setUserRole(null); setCurrentShift(null); };
  const openShift = (openingBalance: number) => {
    if (!currentUser) return;
    setCurrentShift({ id: 'sh_' + Math.random().toString(36).substr(2, 5), cashierId: currentUser.id, startTime: new Date(), openingBalance, status: 'OPEN' });
  };
  const closeShift = (balance: number) => setCurrentShift(null);

  const depositToWallet = (amount: number, bonus: number = 0) => {
    if (!currentUser) return;
    const totalDeposit = amount + bonus;
    const newTransaction: Transaction = { id: 'tr_' + Math.random().toString(36).substr(2, 9), date: new Date(), amount, type: 'DEPOSIT', status: 'SUCCESS', description: `شحن محفظة` };
    setCurrentUser({ ...currentUser, balance: currentUser.balance + totalDeposit, transactions: [newTransaction, ...currentUser.transactions] });
  };

  const refundToWallet = (orderId: string) => {
    const order = activeOrders.find(o => o.id === orderId);
    if (!order || !currentUser) return;
    const refundTransaction: Transaction = { id: 'ref_' + Math.random().toString(36).substr(2, 9), date: new Date(), amount: order.total, type: 'REFUND', status: 'SUCCESS', description: `استرداد طلب #${order.orderNumber}` };
    setCurrentUser({ ...currentUser, balance: currentUser.balance + order.total, transactions: [refundTransaction, ...currentUser.transactions] });
    setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.REFUNDED } : o));
  };

  const updateTableStatus = (tableId: string, status: TableStatus, extra?: Partial<Table>) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status, ...extra } : t));
  };

  const transferTable = (fromId: string, toId: string) => {
    const fromTable = tables.find(t => t.id === fromId);
    const toTable = tables.find(t => t.id === toId);
    if (!fromTable || !toTable || fromTable.status !== TableStatus.OCCUPIED) return;

    const order = activeOrders.find(o => o.id === fromTable.currentOrderId);
    if (!order) return;

    // Move order to new table
    setActiveOrders(prev => prev.map(o => o.id === order.id ? { ...o, tableId: toId } : o));
    
    // Update tables
    setTables(prev => prev.map(t => {
      if (t.id === fromId) return { ...t, status: TableStatus.CLEANING, currentOrderId: undefined, seatedAt: undefined };
      if (t.id === toId) return { ...t, status: TableStatus.OCCUPIED, currentOrderId: order.id, seatedAt: fromTable.seatedAt };
      return t;
    }));
  };

  const mergeTables = (tableIds: string[]) => {
    if (tableIds.length < 2) return;
    const targetTableId = tableIds[0];
    const otherTableIds = tableIds.slice(1);

    const targetTable = tables.find(t => t.id === targetTableId);
    if (!targetTable) return;

    const targetOrder = activeOrders.find(o => o.id === targetTable.currentOrderId);
    if (!targetOrder) return;

    let mergedItems = [...targetOrder.items];

    otherTableIds.forEach(id => {
      const table = tables.find(t => t.id === id);
      if (table && table.currentOrderId) {
        const order = activeOrders.find(o => o.id === table.currentOrderId);
        if (order) {
          mergedItems = [...mergedItems, ...order.items];
          // Cancel the other order
          setActiveOrders(prev => prev.filter(o => o.id !== order.id));
        }
      }
    });

    // Update target order
    const subtotal = mergedItems.reduce((s, i) => s + (i.price * i.quantity), 0);
    setActiveOrders(prev => prev.map(o => o.id === targetOrder.id ? { ...o, items: mergedItems, subtotal, total: subtotal - o.discount } : o));

    // Update tables
    setTables(prev => prev.map(t => {
      if (otherTableIds.includes(t.id)) return { ...t, status: TableStatus.CLEANING, currentOrderId: undefined, seatedAt: undefined };
      return t;
    }));
  };

  const submitOrder = (status: OrderStatus, paymentMethod?: PaymentMethod, discount: number = 0, customerDetails?: { name: string, phone: string, note?: string }) => {
    if (!currentUser || currentCart.length === 0) return;
    const subtotal = currentCart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const total = subtotal - discount;
    
    if (paymentMethod === PaymentMethod.WALLET && currentUser.balance < total) return alert('الرصيد غير كافٍ');
    
    const orderId = editingOrderId || Math.random().toString(36).substr(2, 9);
    const newOrder: Order = {
      id: orderId,
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      type: cartOrderType, status, items: [...currentCart], customerId: currentUser.id, tableId: selectedTable?.id, branchId: currentUser.branchId || 'b1', createdAt: new Date(), subtotal, tax: 0, discount, total, paymentMethod, 
      customerName: customerDetails?.name,
      customerPhone: customerDetails?.phone,
      note: customerDetails?.note,
      timeline: [{ status, time: new Date() }]
    };

    if (editingOrderId) {
      setActiveOrders(p => p.map(o => o.id === editingOrderId ? newOrder : o));
    } else {
      setActiveOrders(p => [newOrder, ...p]);
    }

    // Update table status if it's a dine-in order
    if (selectedTable) {
      updateTableStatus(selectedTable.id, TableStatus.OCCUPIED, { 
        currentOrderId: orderId, 
        seatedAt: selectedTable.seatedAt || new Date() 
      });
    }

    setCurrentCart([]); setEditingOrderId(null); setSelectedTable(null);
  };

  const completeOrder = (orderId: string, payment: { method: string | PaymentMethod }) => {
    setActiveOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // If it was a dine-in order, set table to cleaning
        if (o.tableId) {
          updateTableStatus(o.tableId, TableStatus.CLEANING, { currentOrderId: undefined, seatedAt: undefined });
        }
        return { ...o, status: OrderStatus.DELIVERED, paymentMethod: payment.method as PaymentMethod };
      }
      return o;
    }));
  };

  const saveNewCard = (card: Omit<SavedCard, 'id'>) => {
    if (!currentUser) return;
    const newCard: SavedCard = { ...card, id: 'card_' + Math.random().toString(36).substr(2, 5) };
    setCurrentUser({ ...currentUser, savedCards: [...currentUser.savedCards, newCard] });
  };

  const clearCart = () => {
    setCurrentCart([]);
    setEditingOrderId(null);
    setSelectedTable(null);
  };

  const voidOrder = (orderId: string) => {
    setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.CANCELED } : o));
    const order = activeOrders.find(o => o.id === orderId);
    if (order?.tableId) {
      updateTableStatus(order.tableId, TableStatus.AVAILABLE, { currentOrderId: undefined, seatedAt: undefined });
    }
  };

  const loadOrderToPOS = (order: Order) => {
    setCurrentCart(order.items);
    setEditingOrderId(order.id);
    setCartOrderType(order.type);
    if (order.tableId) {
      const table = tables.find(t => t.id === order.tableId);
      if (table) setSelectedTable(table);
    }
  };

  const reorder = (orderId: string) => {
    const order = activeOrders.find(o => o.id === orderId);
    if (order) {
      setCurrentCart(order.items);
      setEditingOrderId(null);
      setCartOrderType(order.type);
    }
  };

  const addToCart = (item: MenuItem, customization?: any) => {
    const newOrderItem: OrderItem = { itemId: item.id, uniqueId: Math.random().toString(36).substr(2, 9), name: item.nameAr, quantity: 1, basePrice: item.price, price: item.price, ...customization };
    setCurrentCart(prev => [...prev, newOrderItem]);
  };
  const removeFromCart = (uniqueId: string) => setCurrentCart(prev => prev.filter(i => i.uniqueId !== uniqueId));
  const updateCartQuantity = (uniqueId: string, delta: number) => setCurrentCart(prev => prev.map(i => i.uniqueId === uniqueId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const updateCartItem = (uniqueId: string, updates: Partial<OrderItem>) => setCurrentCart(prev => prev.map(i => i.uniqueId === uniqueId ? { ...i, ...updates } : i));
  const toggleFavorite = (itemId: string) => {
    if (!currentUser) return;
    const isFav = currentUser.favorites.includes(itemId);
    setCurrentUser({ ...currentUser, favorites: isFav ? currentUser.favorites.filter(id => id !== itemId) : [...currentUser.favorites, itemId] });
  };
  const setOrderType = (type: OrderType) => setCartOrderType(type);

  return (
    <AppContext.Provider value={{
      activeOrders, currentUser, currentCart, cartOrderType, userRole,
      branches, departments, jobTitles, jobTypes, employees,
      addBranch, updateBranch, deleteBranch,
      addDepartment, updateDepartment, deleteDepartment,
      addJobTitle, updateJobTitle, deleteJobTitle,
      addJobType, updateJobType, deleteJobType,
      addEmployee, updateEmployee, deleteEmployee,
      login, logout, addToCart, removeFromCart, updateCartQuantity, updateCartItem, submitOrder, depositToWallet, refundToWallet, saveNewCard, toggleFavorite, setOrderType,
      tables, selectedTable, setSelectedTable, updateTableStatus, transferTable, mergeTables, editingOrderId, clearCart, voidOrder, completeOrder, loadOrderToPOS, currentShift, openShift, closeShift,
      reorder
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
