
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { MENU_ITEMS, CATEGORIES } from '../constants';
import { OrderType, OrderStatus, PaymentMethod } from '../types';
import { Search, Plus, Minus, ShoppingCart, Trash2, CreditCard, Save, CheckCircle, Tag, Wallet, Banknote } from 'lucide-react';

export const POS: React.FC = () => {
  const { 
    addToCart, currentCart, cartOrderType, setOrderType, 
    updateCartQuantity, removeFromCart, submitOrder, selectedTable, setSelectedTable, tables, editingOrderId, clearCart
  } = useApp();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualTable, setManualTable] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>('PERCENT');

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
  const discountAmount = discountType === 'PERCENT' ? (subtotal * (discountValue / 100)) : discountValue;
  const tax = (subtotal - discountAmount) * 0.15;
  const total = subtotal - discountAmount + tax;

  return (
    <div className="flex gap-4 h-full bg-slate-950">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="mb-4 bg-slate-900 p-4 rounded-3xl border border-white/5 shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              {editingOrderId ? <span className="text-red-500 font-black">تعديل طلب #{editingOrderId.slice(-4)}</span> : 'فاتورة جديدة'}
            </h2>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن وجبة..."
                className="w-full pr-10 pl-4 py-3 bg-slate-800 border border-white/5 rounded-2xl focus:ring-2 focus:ring-red-600 outline-none text-sm font-bold text-white placeholder-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {editingOrderId && (
              <button onClick={clearCart} className="text-xs font-black text-red-500 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-colors">إلغاء التعديل</button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap text-xs font-black transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-1 pb-4 custom-scrollbar">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-slate-900 p-3 rounded-[2.5rem] border border-white/5 hover:border-red-600 cursor-pointer group transition-all shadow-lg hover:shadow-red-900/10"
            >
              <div className="aspect-square rounded-[2rem] overflow-hidden mb-3 bg-slate-800 relative">
                <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-red-500 shadow-xl border border-white/5">
                  {item.price} ₪
                </div>
              </div>
              <h4 className="font-black text-slate-100 text-xs mb-3 text-center">{item.nameAr}</h4>
              <div className="w-full py-2.5 bg-slate-800 group-hover:bg-red-600 group-hover:text-white rounded-2xl flex items-center justify-center transition-all">
                <Plus size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill/Cart Area */}
      <div className="w-[450px] bg-slate-900 rounded-[3rem] border border-white/10 flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-red-500" size={22} />
              <h3 className="text-lg font-black text-white">تفاصيل الفاتورة</h3>
            </div>
            <div className="flex bg-slate-800 p-1.5 rounded-2xl">
              {([OrderType.DINE_IN, OrderType.TAKEAWAY, OrderType.DELIVERY]).map(type => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${
                    cartOrderType === type ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {type === OrderType.DINE_IN ? 'محلي' : type === OrderType.TAKEAWAY ? 'سفري' : 'توصيل'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">رقم الطاولة</label>
                <input 
                  type="text" 
                  value={manualTable} 
                  onChange={(e) => handleTableInput(e.target.value)}
                  placeholder="رقم..."
                  className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-1 focus:ring-red-600 font-black text-sm text-center text-white"
                />
             </div>
             <div className="flex items-end">
                <button 
                  className="w-full py-3 bg-slate-800 text-slate-400 border border-white/5 rounded-2xl font-black text-[10px] hover:bg-slate-700 hover:text-slate-100 transition-all"
                >
                  اختيار من الخريطة
                </button>
             </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          {currentCart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
                <ShoppingCart size={40} strokeWidth={1} />
              </div>
              <p className="font-black text-sm">الفاتورة لا تزال فارغة</p>
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-slate-900 border-b border-white/5 text-slate-500 font-black uppercase tracking-tighter">
                <tr>
                  <th className="py-3 pr-2">#</th>
                  <th className="py-3">الصنف</th>
                  <th className="py-3 text-center">الكمية</th>
                  <th className="py-3 text-center">السعر</th>
                  <th className="py-2 text-left pl-2">الإجمالي</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentCart.map((item, idx) => (
                  <tr key={item.uniqueId} className="group hover:bg-white/5">
                    <td className="py-4 pr-2 font-bold text-slate-600">{idx + 1}</td>
                    <td className="py-4 font-black text-slate-100">{item.name}</td>
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => updateCartQuantity(item.uniqueId, -1)} className="p-1.5 bg-slate-800 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-500"><Minus size={12}/></button>
                        <span className="font-black w-4 text-center text-white">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.uniqueId, 1)} className="p-1.5 bg-slate-800 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-500"><Plus size={12}/></button>
                      </div>
                    </td>
                    <td className="py-4 text-center font-bold text-slate-500">{item.price}</td>
                    <td className="py-4 text-left pl-2 font-black text-red-500">{(item.price * item.quantity).toFixed(2)}</td>
                    <td className="py-4 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => removeFromCart(item.uniqueId)} className="text-slate-500 hover:text-red-500"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary Area */}
        <div className="p-6 bg-slate-950 border-t border-white/10 space-y-6">
          <div className="bg-slate-900 p-4 rounded-3xl border border-white/5 space-y-4">
             <div className="flex items-center gap-2 text-red-500">
               <Tag size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">الخصومات</span>
             </div>
             <div className="flex gap-2">
                <input 
                  type="number" 
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder="0.00"
                  className="flex-1 px-4 py-2.5 bg-slate-800 rounded-2xl text-xs font-black outline-none border border-transparent focus:border-red-600 text-white"
                />
                <select 
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="bg-slate-800 px-4 py-2.5 rounded-2xl text-[10px] font-black outline-none text-slate-300"
                >
                  <option value="PERCENT">% نسبة</option>
                  <option value="FIXED">₪ مبلغ</option>
                </select>
             </div>
          </div>

          <div className="space-y-3 px-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>المجموع الأصلي</span>
              <span className="text-slate-300">{subtotal.toFixed(2)} ₪</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs font-bold text-red-500">
                <span>الخصم</span>
                <span>-{discountAmount.toFixed(2)} ₪</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>الضريبة (15%)</span>
              <span className="text-slate-300">{tax.toFixed(2)} ₪</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-white pt-4 border-t border-white/10">
              <span>الإجمالي</span>
              <span className="text-red-600">{total.toFixed(2)} ₪</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-2">
               <button 
                onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                className={`flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${paymentMethod === PaymentMethod.CASH ? 'border-red-600 bg-red-600/10 text-red-500' : 'bg-slate-900 border-white/5 text-slate-500'}`}
               >
                 <Banknote size={20} />
                 <span className="text-[10px] font-black">كاش</span>
               </button>
               <button 
                onClick={() => setPaymentMethod(PaymentMethod.WALLET)}
                className={`flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${paymentMethod === PaymentMethod.WALLET ? 'border-red-600 bg-red-600/10 text-red-500' : 'bg-slate-900 border-white/5 text-slate-500'}`}
               >
                 <Wallet size={20} />
                 <span className="text-[10px] font-black">تطبيق</span>
               </button>
               <button 
                onClick={() => setPaymentMethod(PaymentMethod.CREDIT_CARD)}
                className={`flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${paymentMethod === PaymentMethod.CREDIT_CARD ? 'border-red-600 bg-red-600/10 text-red-500' : 'bg-slate-900 border-white/5 text-slate-500'}`}
               >
                 <CreditCard size={20} />
                 <span className="text-[10px] font-black">بطاقة</span>
               </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button 
              onClick={() => submitOrder(OrderStatus.PENDING, paymentMethod, discountAmount)}
              disabled={currentCart.length === 0}
              className="flex-1 py-4 bg-slate-800 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-700 disabled:opacity-30 transition-all active:scale-95 shadow-xl"
            >
              <Save size={18} />
              حفظ الطلب
            </button>
            <button 
              onClick={() => submitOrder(OrderStatus.DELIVERED, paymentMethod, discountAmount)}
              disabled={currentCart.length === 0}
              className="flex-1 py-4 bg-red-600 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-2 hover:bg-red-700 shadow-xl shadow-red-900/20 disabled:opacity-30 transition-all active:scale-95"
            >
              <CheckCircle size={18} />
              دفع وإغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
