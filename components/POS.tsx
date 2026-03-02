
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { MENU_ITEMS, CATEGORIES } from '../constants';
import { OrderType, OrderStatus, PaymentMethod } from '../types';
import { Search, Plus, Minus, ShoppingCart, Trash2, CreditCard, Save, CheckCircle, Tag, Wallet, Banknote, FileText, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const POS: React.FC<{ onViewTables: () => void }> = ({ onViewTables }) => {
  const { 
    addToCart, currentCart, cartOrderType, setOrderType, 
    updateCartItem, removeFromCart, submitOrder, selectedTable, setSelectedTable, tables, editingOrderId, clearCart,
    currentUser, userRole
  } = useApp();
  
  const isHospitality = userRole === 'HOSPITALITY';
  
  const [activePOSMode, setActivePOSMode] = useState<'menu' | 'info' | 'customer'>('menu');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceNote, setInvoiceNote] = useState('');
  const [accountType, setAccountType] = useState<'ACCOUNT' | 'SUPPLIER' | 'EMPLOYEE'>('ACCOUNT');
  const [accountNumber, setAccountNumber] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const { employees } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  useEffect(() => {
    if (paymentMethod === PaymentMethod.CASH) {
      setCustomerName('صندوق مبيعات');
      setAccountNumber('1001');
    } else if (paymentMethod === PaymentMethod.WALLET) {
      setAccountNumber('2002');
      if (customerName === 'صندوق مبيعات') setCustomerName('');
    } else if (paymentMethod === PaymentMethod.CREDIT_CARD) {
      setAccountNumber('3003');
      if (customerName === 'صندوق مبيعات') setCustomerName('');
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (accountType === 'EMPLOYEE' && accountNumber) {
      const emp = employees.find(e => e.id === accountNumber || e.phone === accountNumber);
      if (emp) setCustomerName(emp.name);
    }
  }, [accountNumber, accountType, employees]);
  
  const [quickId, setQuickId] = useState('');
  const [quickQty, setQuickQty] = useState('');
  const [quickTotal, setQuickTotal] = useState('');
  
  useEffect(() => {
    if (isHospitality) {
      setOrderType(OrderType.DINE_IN);
      setActivePOSMode('menu');
    }
  }, [isHospitality]);

  const handleQuickIdChange = (id: string) => {
    setQuickId(id);
    const item = MENU_ITEMS.find(i => i.id === id);
    if (item) {
      setQuickQty('1');
      setQuickTotal(item.price.toString());
    } else {
      setQuickQty('');
      setQuickTotal('');
    }
  };

  const handleQuickQtyChange = (qtyStr: string) => {
    setQuickQty(qtyStr);
    const item = MENU_ITEMS.find(i => i.id === quickId);
    if (item && qtyStr) {
      const qty = parseFloat(qtyStr) || 0;
      setQuickTotal((qty * item.price).toFixed(2));
    }
  };

  const handleQuickTotalChange = (totalStr: string) => {
    setQuickTotal(totalStr);
    const item = MENU_ITEMS.find(i => i.id === quickId);
    if (item && totalStr) {
      const totalVal = parseFloat(totalStr) || 0;
      setQuickQty((totalVal / item.price).toFixed(2));
    }
  };

  const handleQuickAdd = () => {
    const item = MENU_ITEMS.find(i => i.id === quickId);
    if (!item) return;
    
    const qty = parseFloat(quickQty) || 1;
    const price = item.price; // Use base price, total is calculated in cart
    
    addToCart(item, { quantity: qty, price: price });
    setQuickId('');
    setQuickQty('');
    setQuickTotal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuickAdd();
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualTable, setManualTable] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (selectedTable) {
      setManualTable(selectedTable.number.toString());
    } else {
      setManualTable('');
    }
  }, [selectedTable]);

  const handleTableInput = (val: string) => {
    setManualTable(val);
    const table = tables.find(t => t.number.toString() === val);
    if (table) {
      setSelectedTable(table);
    } else {
      setSelectedTable(null);
    }
  };

  const filteredItems = MENU_ITEMS.filter(item => 
    (selectedCategory === 'all' || item.category === selectedCategory) &&
    (item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // No tax or discount as requested

  const handleQuantityChange = (uniqueId: string, val: string, price: number) => {
    if (val === '') {
      updateCartItem(uniqueId, { quantity: 0 });
      return;
    }
    const qty = parseFloat(val);
    if (!isNaN(qty)) {
      updateCartItem(uniqueId, { quantity: qty });
    }
  };

  const handleTotalChange = (uniqueId: string, val: string, price: number) => {
    if (val === '') {
      updateCartItem(uniqueId, { quantity: 0 });
      return;
    }
    const newTotal = parseFloat(val);
    if (!isNaN(newTotal)) {
      const newQty = price > 0 ? newTotal / price : 0;
      updateCartItem(uniqueId, { quantity: newQty });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full bg-slate-950 overflow-y-auto lg:overflow-hidden p-2 sm:p-4 lg:p-0 custom-scrollbar relative">
      {/* Menu Area */}
      <div className={`flex-1 flex flex-col min-w-0 h-full ${isCartOpen ? 'hidden lg:flex' : 'flex'}`}>
        <header className="mb-4 bg-slate-900 p-4 sm:p-6 rounded-3xl border border-white/5 shadow-xl space-y-6">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
             <div className="flex items-center gap-4 shrink-0 w-full xl:w-auto justify-between xl:justify-start">
               <h2 
                 onClick={clearCart}
                 className="text-xl sm:text-2xl font-black text-white tracking-tight whitespace-nowrap cursor-pointer hover:text-red-500 transition-colors"
               >
                 {editingOrderId ? `تعديل طلب #${editingOrderId.slice(-4)}` : 'فاتورة جديدة'}
               </h2>
               {editingOrderId && (
                 <button onClick={clearCart} className="text-xs font-black text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors border border-red-500/20">إلغاء</button>
               )}
             </div>

             {/* Quick Entry Bar */}
             <div className="w-full xl:flex-1 flex flex-col sm:flex-row items-center gap-3 bg-slate-800/50 p-2 rounded-2xl border border-white/5">
                <div className="flex flex-wrap items-center gap-2 flex-1 w-full">
                  <span className="text-[10px] font-black text-slate-500 uppercase shrink-0">إضافة سريعة:</span>
                  <input 
                    type="text" 
                    placeholder="رقم الصنف"
                    value={quickId}
                    onChange={(e) => handleQuickIdChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 sm:w-24 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white outline-none focus:ring-1 focus:ring-red-600"
                  />
                  <input 
                    type="number" 
                    placeholder="الكمية"
                    value={quickQty}
                    onChange={(e) => handleQuickQtyChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-16 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white outline-none focus:ring-1 focus:ring-red-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <input 
                    type="number" 
                    placeholder="الإجمالي"
                    value={quickTotal}
                    onChange={(e) => handleQuickTotalChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 sm:w-24 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-white outline-none focus:ring-1 focus:ring-red-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button 
                  onClick={handleQuickAdd}
                  className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 active:scale-95 shrink-0"
                >
                  إضافة
                </button>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {!isHospitality && (
              <div className="flex flex-wrap bg-slate-800 p-1 rounded-2xl shrink-0 border border-white/5 shadow-inner">
                <button 
                  onClick={() => setActivePOSMode('menu')}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${activePOSMode === 'menu' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  المنيو
                </button>
                <button 
                  onClick={() => setActivePOSMode('info')}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${activePOSMode === 'info' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  بيانات الفاتورة
                </button>
                <button 
                  onClick={() => setActivePOSMode('customer')}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${activePOSMode === 'customer' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  بيانات الزبون والحساب
                </button>
              </div>
            )}

            <div className="relative flex-1 w-full group">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors pointer-events-none">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="ابحث عن وجبة، رقم الصنف..."
                className="w-full pr-12 pl-4 py-3 bg-slate-800/40 border border-white/5 rounded-xl focus:ring-2 focus:ring-red-600/50 outline-none text-xs font-bold text-white placeholder-slate-600 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0">
          {activePOSMode === 'menu' ? (
            <>
              <div className="mb-4 flex flex-wrap gap-1.5 shrink-0 sticky top-0 z-10 py-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-[9px] font-black transition-all duration-200 border ${
                      selectedCategory === cat.id 
                        ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                        : 'bg-slate-900 text-slate-500 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto pr-1 pb-8 custom-scrollbar">
                {filteredItems.map(item => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(item)}
                    className="group cursor-pointer flex flex-col gap-3"
                  >
                    {/* Image Container */}
                    <div className="aspect-square relative rounded-3xl overflow-hidden bg-slate-900 border border-white/5 group-hover:border-red-600/50 transition-all duration-300 shadow-lg">
                      <img 
                        src={item.image} 
                        alt={item.nameAr} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Floating ID */}
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-lg text-[9px] font-black shadow-lg border border-white/10">
                        #{item.id}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-black text-slate-100 text-[11px] leading-tight group-hover:text-red-500 transition-colors line-clamp-1 flex-1">
                          {item.nameAr}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-red-500">{item.price} ₪</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : activePOSMode === 'info' ? (
            <div className="flex-1 bg-slate-900 rounded-[2rem] sm:rounded-[3rem] border border-white/5 p-4 sm:p-10 overflow-y-auto custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-6 sm:space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">رقم نقطة البيع</label>
                    <div className="p-3 sm:p-4 bg-slate-800 rounded-2xl border border-white/5 font-black text-xs sm:text-sm text-slate-300">POS-001</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">رقم الفاتورة</label>
                    <div className="p-3 sm:p-4 bg-slate-800 rounded-2xl border border-white/5 font-black text-xs sm:text-sm text-slate-300">
                      {editingOrderId ? `#${editingOrderId.slice(-6)}` : 'تلقائي عند الحفظ'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">التاريخ والوقت</label>
                    <div className="p-3 sm:p-4 bg-slate-800 rounded-2xl border border-white/5 font-black text-xs sm:text-sm text-slate-300">
                      {new Date().toLocaleString('ar-PS')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">عملة الفاتورة</label>
                    <div className="p-3 sm:p-4 bg-slate-800 rounded-2xl border border-white/5 font-black text-xs sm:text-sm text-slate-300">شيكل فلسطيني (₪)</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">رقم الحساب</label>
                    <div className="p-3 sm:p-4 bg-slate-800 rounded-2xl border border-white/5 font-black text-xs sm:text-sm text-slate-300">ACC-9988-22</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">اسم المستخدم</label>
                    <div className="p-3 sm:p-4 bg-slate-800 rounded-2xl border border-white/5 font-black text-xs sm:text-sm text-slate-300">{currentUser?.name}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-slate-900 rounded-[2rem] sm:rounded-[3rem] border border-white/5 p-4 sm:p-10 overflow-y-auto custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-12">
                {/* Customer Section */}
                <div className="space-y-6">
                  <h4 className="text-base sm:text-lg font-black text-white border-b border-white/5 pb-3">بيانات الزبون</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">اسم الزبون</label>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="أدخل اسم الزبون..."
                        className="w-full p-3 sm:p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-xs sm:text-sm text-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">رقم الجوال</label>
                      <input 
                        type="text" 
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="059-000-0000"
                        className="w-full p-3 sm:p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-xs sm:text-sm text-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Section */}
                <div className="space-y-6">
                  <h4 className="text-base sm:text-lg font-black text-white border-b border-white/5 pb-3">بيانات الحساب المالي</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">نوع الحساب</label>
                      <select 
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value as any)}
                        className="w-full p-3 sm:p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-xs sm:text-sm text-white transition-all appearance-none"
                      >
                        <option value="ACCOUNT">رقم حساب</option>
                        <option value="SUPPLIER">رقم مورد</option>
                        <option value="EMPLOYEE">رقم موظف</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">رقم الحساب / المعرف</label>
                      <input 
                        type="text" 
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="أدخل الرقم هنا..."
                        className="w-full p-3 sm:p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-xs sm:text-sm text-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bill/Cart Area */}
      <div className={`w-full lg:w-[400px] xl:w-[450px] bg-slate-900 rounded-[2rem] sm:rounded-[3rem] border border-white/10 flex flex-col shadow-2xl overflow-hidden h-auto lg:h-full shrink-0 ${isCartOpen ? 'fixed inset-0 z-50 lg:relative lg:z-0' : 'hidden lg:flex'}`}>
        {/* 1. Header & Table Info */}
        <div className="p-4 sm:p-5 border-b border-white/5 space-y-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-red-500" size={20} />
              <h3 className="text-sm sm:text-base font-black text-white">تفاصيل الفاتورة</h3>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsCartOpen(false)}
                className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors"
              >
                <Plus className="rotate-45" size={24} />
              </button>
              {!isHospitality && (
                <div className="flex bg-slate-800 p-1 rounded-xl overflow-x-auto scrollbar-hide">
                  {([OrderType.DINE_IN, OrderType.TAKEAWAY]).map(type => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`px-2 sm:px-3 py-1.5 text-[8px] sm:text-[9px] font-black rounded-lg transition-all whitespace-nowrap ${
                        cartOrderType === type ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {type === OrderType.DINE_IN ? 'محلي' : 'فوري'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {cartOrderType === OrderType.DINE_IN && (
            <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 mr-2 uppercase tracking-widest">الطاولة</label>
                  <input 
                    type="text" 
                    value={manualTable} 
                    onChange={(e) => handleTableInput(e.target.value)}
                    placeholder="رقم..."
                    className="w-full px-3 py-2 bg-slate-800 border border-white/5 rounded-xl outline-none focus:ring-1 focus:ring-red-600 font-black text-xs text-center text-white"
                  />
               </div>
               <div className="flex items-end">
                  <button 
                    onClick={onViewTables}
                    className="w-full py-2 bg-slate-800 text-slate-400 border border-white/5 rounded-xl font-black text-[9px] hover:bg-slate-700 hover:text-slate-100 transition-all"
                  >
                    الخريطة
                  </button>
               </div>
            </div>
          )}

          {/* 2. Total Amount */}
          <div className="bg-red-600/10 border border-red-600/20 p-2 px-4 rounded-xl flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">الإجمالي</span>
            <div className="text-left">
              <span className="text-lg sm:text-xl font-black text-red-600">{total.toFixed(2)}</span>
              <span className="text-[10px] font-black text-red-600 mr-1">₪</span>
            </div>
          </div>
        </div>

        {/* 3. Invoice Items (Table Format) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[200px] lg:min-h-0">
          {currentCart.length === 0 ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-700 space-y-3">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
                <ShoppingCart size={24} sm:size={32} strokeWidth={1} />
              </div>
              <p className="font-black text-[10px] sm:text-xs">الفاتورة فارغة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[350px]">
                <thead className="sticky top-0 bg-slate-900 z-10">
                  <tr className="border-b border-white/5">
                    <th className="p-2 sm:p-3 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">#</th>
                    <th className="p-2 sm:p-3 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">الصنف</th>
                    <th className="p-2 sm:p-3 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">السعر</th>
                    <th className="p-2 sm:p-3 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">الكمية</th>
                    <th className="p-2 sm:p-3 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">الإجمالي</th>
                    <th className="p-2 sm:p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentCart.map((item) => (
                    <tr key={item.uniqueId} className="group hover:bg-white/5 transition-colors">
                      <td className="p-2 sm:p-3 text-[8px] sm:text-[10px] font-black text-slate-600">#{item.itemId}</td>
                      <td className="p-2 sm:p-3">
                        <p className="text-[10px] sm:text-xs font-black text-white">{item.name}</p>
                      </td>
                      <td className="p-2 sm:p-3 text-center text-[10px] sm:text-xs font-bold text-slate-400">{item.price}</td>
                      <td className="p-2 sm:p-3">
                        <input 
                          type="text"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.uniqueId, e.target.value, item.price)}
                          className="w-10 sm:w-12 bg-transparent text-center text-[10px] sm:text-xs font-black text-white outline-none"
                        />
                      </td>
                      <td className="p-2 sm:p-3 text-left">
                        <input 
                          type="text"
                          value={Math.round(item.price * item.quantity * 100) / 100}
                          onChange={(e) => handleTotalChange(item.uniqueId, e.target.value, item.price)}
                          className="w-16 sm:w-20 bg-transparent text-left text-[10px] sm:text-xs font-black text-red-500 outline-none"
                        />
                      </td>
                      <td className="p-2 sm:p-3 text-center">
                        <button 
                          onClick={() => removeFromCart(item.uniqueId)} 
                          className="p-1.5 text-slate-600 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. Footer Summary & Actions */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-white/10 space-y-3">
          {/* Invoice Note */}
          <div className="bg-slate-900 px-3 sm:px-4 py-2 rounded-xl border border-white/5 flex flex-col gap-1">
             <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
                <FileText size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">ملاحظة الفاتورة</span>
             </div>
             <textarea 
                value={invoiceNote}
                onChange={(e) => setInvoiceNote(e.target.value)}
                placeholder="أدخل ملاحظات الفاتورة..."
                className="w-full bg-transparent text-[10px] sm:text-[11px] font-black outline-none text-white placeholder:text-slate-700 h-10 sm:h-12 resize-none"
              />
          </div>

          {/* Payment Methods - Hidden for Hospitality */}
          {!isHospitality && (
            <div className="grid grid-cols-3 gap-1.5">
                 <button 
                  onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 rounded-xl border transition-all ${paymentMethod === PaymentMethod.CASH ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                 >
                   <Banknote size={14} />
                   <span className="text-[8px] sm:text-[9px] font-black">كاش</span>
                 </button>
                 <button 
                  onClick={() => setPaymentMethod(PaymentMethod.WALLET)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 rounded-xl border transition-all ${paymentMethod === PaymentMethod.WALLET ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                 >
                   <Wallet size={14} />
                   <span className="text-[8px] sm:text-[9px] font-black">تطبيق</span>
                 </button>
                 <button 
                  onClick={() => setPaymentMethod(PaymentMethod.CREDIT_CARD)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 rounded-xl border transition-all ${paymentMethod === PaymentMethod.CREDIT_CARD ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                 >
                   <CreditCard size={14} />
                   <span className="text-[8px] sm:text-[9px] font-black">بطاقة</span>
                 </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            {isHospitality ? (
              <button 
                onClick={() => {
                  if (cartOrderType === OrderType.DINE_IN && !manualTable) {
                    alert('يرجى إدخال رقم الطاولة أولاً');
                    return;
                  }
                  submitOrder(OrderStatus.CONFIRMED, PaymentMethod.CASH, 0, { name: customerName, phone: customerPhone, note: invoiceNote });
                }}
                disabled={currentCart.length === 0}
                className="col-span-2 py-3 sm:py-4 bg-red-600 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-red-700 shadow-xl shadow-red-900/20 disabled:opacity-30 transition-all active:scale-95"
              >
                <Save size={18} />
                {editingOrderId ? 'تحديث الطلب' : 'إرسال الطلب للمطبخ والكاشير'}
              </button>
            ) : (
              <>
                <button 
                  onClick={() => {
                    if (cartOrderType === OrderType.DINE_IN && !manualTable) {
                      alert('يرجى إدخال رقم الطاولة أولاً');
                      return;
                    }
                    submitOrder(OrderStatus.PENDING, paymentMethod, 0, { name: customerName, phone: customerPhone, note: invoiceNote });
                  }}
                  disabled={currentCart.length === 0}
                  className="py-2.5 sm:py-3 bg-slate-800 text-white rounded-xl font-black text-[9px] sm:text-[10px] flex items-center justify-center gap-1.5 hover:bg-slate-700 disabled:opacity-30 transition-all active:scale-95"
                >
                  <Save size={14} />
                  حفظ
                </button>
                <button 
                  onClick={() => {
                    if (cartOrderType === OrderType.DINE_IN && !manualTable) {
                      alert('يرجى إدخال رقم الطاولة أولاً');
                      return;
                    }
                    if (!customerName || (customerName === 'صندوق مبيعات' && paymentMethod !== PaymentMethod.CASH)) {
                      setShowCustomerModal(true);
                      return;
                    }
                    submitOrder(OrderStatus.DELIVERED, paymentMethod, 0, { name: customerName, phone: customerPhone, note: invoiceNote });
                  }}
                  disabled={currentCart.length === 0}
                  className="py-2.5 sm:py-3 bg-red-600 text-white rounded-xl font-black text-[9px] sm:text-[10px] flex items-center justify-center gap-1.5 hover:bg-red-700 shadow-xl shadow-red-900/20 disabled:opacity-30 transition-all active:scale-95"
                >
                  <CheckCircle size={14} />
                  إغلاق
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Cart Button */}
      {currentCart.length > 0 && !isCartOpen && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed bottom-6 left-6 right-6 bg-red-600 text-white py-4 rounded-2xl font-black shadow-2xl shadow-red-900/40 flex items-center justify-center gap-3 z-40 animate-bounce"
        >
          <ShoppingCart size={20} />
          عرض السلة ({currentCart.length}) - {total.toFixed(2)} ₪
        </button>
      )}

      {/* Customer Name Modal */}
      <AnimatePresence>
        {showCustomerModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden p-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-red-600/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag size={32} />
                </div>
                <h3 className="text-2xl font-black text-white">إغلاق الفاتورة</h3>
                <p className="text-slate-500 font-bold text-sm">يرجى إدخال اسم الزبون لإتمام العملية</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">اسم الزبون</label>
                  <input 
                    type="text" 
                    autoFocus
                    value={customerName === 'صندوق مبيعات' ? '' : customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="أدخل اسم الزبون..."
                    className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-black text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if (!customerName || customerName.trim() === '') {
                      alert('يرجى إدخال اسم الزبون');
                      return;
                    }
                    submitOrder(OrderStatus.DELIVERED, paymentMethod, 0, { name: customerName, phone: customerPhone, note: invoiceNote });
                    setShowCustomerModal(false);
                  }}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-red-900/20 active:scale-95 transition-all"
                >
                  تأكيد وإغلاق الفاتورة
                </button>
                <button 
                  onClick={() => setShowCustomerModal(false)}
                  className="w-full bg-slate-800 text-slate-400 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
