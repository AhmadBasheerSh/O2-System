
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../store';
import { MENU_ITEMS, CATEGORIES } from '../constants';
import { OrderType, OrderStatus, PaymentMethod, MenuItem, Order } from '../types';
import { GoogleGenAI } from "@google/genai";
import { 
  Home, User, ShoppingBag, Star, Plus, ChevronLeft, CreditCard, History, 
  Heart, Send, Bot, X, Sparkles, Clock, CheckCircle2, Package, Truck, 
  Minus, Trash2, Tag, Bell, Wallet, ArrowUpCircle, Receipt, ShieldCheck, 
  Utensils, Search, Filter, Flame, Leaf, Info, ShoppingCart, MapPin, Map, Navigation, Banknote, Store, 
  ChevronRight, RefreshCcw, Timer, FileText, Calendar, AlertCircle, Smartphone, Power
} from 'lucide-react';

export const CustomerPortal: React.FC<{ initialTab?: 'home' | 'menu' | 'orders' | 'wallet' | 'profile' }> = ({ initialTab = 'home' }) => {
  const { 
    currentUser, addToCart, currentCart, removeFromCart, updateCartQuantity, 
    submitOrder, activeOrders, toggleFavorite, depositToWallet, cartOrderType, setOrderType, reorder,
    tables, setSelectedTable, selectedTable, logout
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'orders' | 'wallet' | 'profile'>(initialTab);
  const [ordersSubTab, setOrdersSubTab] = useState<'active' | 'history'>('active');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<MenuItem | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>('');
  
  const [cartAnimate, setCartAnimate] = useState(false);
  const prevCartLength = useRef(currentCart.length);

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.WALLET);

  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'spicy' | 'vegan' | 'popular'>('all');

  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      const matchesCategory = selectedCat === 'all' || item.category === selectedCat;
      const matchesSearch = item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'spicy' && (item.dietary?.spicyLevel || 0) > 0) ||
                           (filterType === 'vegan' && item.dietary?.vegan) ||
                           (filterType === 'popular' && item.popular);
      
      return matchesCategory && matchesSearch && matchesFilter;
    });
  }, [selectedCat, searchQuery, filterType]);

  const [customSize, setCustomSize] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [itemNote, setItemNote] = useState('');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const cartCount = currentCart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = currentCart.reduce((s, i) => s + (i.price * i.quantity), 0);
  const deliveryFee = cartOrderType === OrderType.DELIVERY ? 10 : 0;
  const tax = (subtotal + deliveryFee - appliedDiscount) * 0.15;
  const cartTotal = subtotal + deliveryFee + tax - appliedDiscount;

  const myOrders = activeOrders.filter(o => o.customerId === currentUser?.id);
  const activeOrdersList = myOrders.filter(o => ![OrderStatus.DELIVERED, OrderStatus.CANCELED, OrderStatus.REFUNDED].includes(o.status));
  const historyOrdersList = myOrders.filter(o => [OrderStatus.DELIVERED, OrderStatus.CANCELED, OrderStatus.REFUNDED].includes(o.status));

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<string, string> = {
      [OrderStatus.PENDING]: 'قيد الانتظار',
      [OrderStatus.PENDING_CONFIRMATION]: 'بانتظار تأكيد الموظف',
      [OrderStatus.CONFIRMED]: 'تم التأكيد',
      [OrderStatus.PREPARING]: 'جاري التحضير',
      [OrderStatus.READY]: 'جاهز للاستلام',
      [OrderStatus.ON_DELIVERY]: 'جاري التوصيل',
      [OrderStatus.DELIVERED]: 'تم التسليم',
      [OrderStatus.CANCELED]: 'ملغي',
      [OrderStatus.REFUNDED]: 'تم الاسترداد',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED: return 'text-green-500 bg-green-500/10 border-green-500/20';
      case OrderStatus.CONFIRMED: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case OrderStatus.PENDING_CONFIRMATION: return 'text-orange-500 bg-orange-500/10 border-orange-500/20 animate-pulse';
      case OrderStatus.CANCELED:
      case OrderStatus.REFUNDED: return 'text-red-500 bg-red-500/10 border-red-500/20';
      case OrderStatus.ON_DELIVERY:
      case OrderStatus.READY: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case OrderStatus.PREPARING: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-800 border-white/5';
    }
  };

  const getPaymentLabel = (method?: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.WALLET: return 'المحفظة';
      case PaymentMethod.ONLINE: return 'دفع إلكتروني';
      case PaymentMethod.CASH: return 'نقداً';
      default: return 'غير محدد';
    }
  };

  const getTypeLabel = (type: OrderType) => {
    switch (type) {
      case OrderType.DINE_IN: return 'داخل المطعم';
      case OrderType.TAKEAWAY: return 'سفري';
      case OrderType.DELIVERY: return 'توصيل للمنزل';
    }
  };

  const handleAiAsk = async (prompt: string) => {
    if (!prompt.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', text: prompt }]);
    setIsTyping(true);
    try {
      const menuContext = MENU_ITEMS.map(i => `${i.nameAr} (${i.price}₪)`).join(', ');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: `أنت المساعد الذكي لمطعم RestoMaster. المنيو: ${menuContext}. ساعد الزبون في اختيار وجبة حسب وقته أو مزاجه أو ميزانيته. العملة هي الشيكل الفلسطيني ₪.`,
        }
      });
      setChatMessages(prev => [...prev, { role: 'bot', text: response.text || 'عذراً، لم أفهم ذلك.' }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'bot', text: 'أعتذر، واجهت مشكلة تقنية.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddItem = (item: MenuItem) => {
    if (!item.sizes && !item.addons) {
      addToCart(item);
    } else {
      setSelectedItemDetails(item);
      setCustomSize(item.sizes?.[0].name || '');
      setSelectedAddons([]);
      setItemNote('');
    }
  };

  const renderHome = () => (
    <div className="p-6 space-y-10 animate-in fade-in duration-500 max-w-4xl mx-auto pb-24 text-slate-100">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">أهلاً بك، {currentUser?.name} 👋</h1>
          <p className="text-slate-500 font-bold mt-1">اشحن رصيدك واستمتع بأفضل الوجبات 🍔</p>
        </div>
        <button onClick={() => setActiveTab('wallet')} className="relative p-3.5 bg-slate-900 rounded-[1.2rem] shadow-xl border border-white/5 text-slate-400">
          <Bell size={24} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-slate-900"></span>
        </button>
      </header>

      {activeOrdersList.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-black text-white flex items-center gap-2">طلبك قيد التحضير <Flame size={20} className="text-red-500 animate-pulse" /></h3>
          {activeOrdersList.slice(0, 1).map(order => (
            <div key={order.id} onClick={() => { setSelectedOrderDetails(order); setActiveTab('orders'); }} className="bg-slate-900 p-6 rounded-[2.5rem] border border-red-500/20 shadow-2xl shadow-red-900/10 flex items-center justify-between group cursor-pointer transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-red-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg"><Clock size={32} /></div>
                <div>
                  <h4 className="font-black text-white">#{order.orderNumber} - {getStatusLabel(order.status)}</h4>
                  <p className="text-xs font-bold text-slate-500 mt-1">نحن نهتم بأدق التفاصيل لوجبتك 🍴</p>
                </div>
              </div>
              <ChevronLeft className="text-red-600 group-hover:-translate-x-1 transition-transform" />
            </div>
          ))}
        </section>
      )}

      <div className="bg-gradient-to-br from-red-600 to-red-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex justify-between items-end">
           <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">رصيد محفظة Resto</p>
              <h3 className="text-5xl font-black tracking-tighter">{currentUser?.balance.toFixed(2)} <span className="text-lg opacity-80">₪</span></h3>
              <div className="mt-6 flex gap-3">
                 <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black border border-white/10 flex items-center gap-1.5"><ShieldCheck size={12}/> مستوى ذهبي</div>
                 <div className="bg-white text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black">{currentUser?.points} نقطة</div>
              </div>
           </div>
           <button onClick={() => setIsDepositModalOpen(true)} className="bg-white text-red-600 p-5 rounded-[1.5rem] hover:scale-110 transition-transform shadow-xl active:scale-95">
              <ArrowUpCircle size={32} />
           </button>
        </div>
        <Sparkles className="absolute -right-12 -top-12 text-white/10 w-64 h-64 rotate-12" />
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 group hover:border-red-600/30 transition-all cursor-pointer" onClick={() => setIsChatOpen(true)}>
         <div className="w-20 h-20 bg-red-600/10 text-red-500 rounded-[1.8rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500"><Bot size={40} /></div>
         <div className="flex-1">
            <h4 className="font-black text-white text-lg">محتار شو توكل؟</h4>
            <p className="text-xs text-slate-500 font-bold mt-1 leading-relaxed">المساعد الذكي يقترح لك وجبات حسب ميزانيتك ومزاجك الحالي!</p>
         </div>
         <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all"><ChevronLeft size={24} /></div>
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">الطلب عبر الطاولة (QR)</h3>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center">
              <Smartphone size={32} />
            </div>
            <div>
              <h4 className="font-black text-white">امسح الكود أو اختر الطاولة</h4>
              <p className="text-xs text-slate-500 font-bold">اطلب مباشرة من مكانك وسنقوم بخدمتك</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => {
                  setSelectedTable(table);
                  setOrderType(OrderType.DINE_IN);
                  setActiveTab('menu');
                }}
                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                  selectedTable?.id === table.id 
                    ? 'border-red-600 bg-red-600/10 text-red-500' 
                    : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20'
                }`}
              >
                <span className="text-lg font-black">{table.number}</span>
                <span className="text-[8px] font-bold uppercase">طاولة</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const renderMenu = () => (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom-8 duration-500 max-w-6xl mx-auto pb-24">
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-2xl py-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن وجبة، مكونات، أو قسم..."
              className="w-full pr-12 pl-4 py-4.5 bg-slate-900 border border-white/5 rounded-[1.5rem] font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all shadow-xl text-white placeholder-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs transition-all whitespace-nowrap border shadow-sm ${
                selectedCat === cat.id ? 'bg-red-600 text-white border-red-600 shadow-red-900/20' : 'bg-slate-900 text-slate-500 border-white/5 hover:bg-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {(filteredMenuItems || []).map(item => {
          const inCart = currentCart.find(i => i.itemId === item.id);
          return (
            <div key={item.id} className="bg-slate-900 rounded-[3rem] p-6 border border-white/5 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="relative aspect-square rounded-[2.2rem] overflow-hidden mb-6 bg-slate-800">
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.nameAr} />
                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-4 py-1.5 rounded-2xl text-sm font-black text-red-500 border border-white/10">
                   {item.price} ₪
                </div>
              </div>
              <div className="space-y-2 mb-8 px-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-white">{item.nameAr}</h3>
                  {item.popular && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-2">{item.descriptionAr}</p>
              </div>
              <button 
                onClick={() => handleAddItem(item)}
                className={`w-full py-4.5 rounded-[1.5rem] font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  inCart ? 'bg-green-600 text-white shadow-xl shadow-green-900/20' : 'bg-slate-800 text-white hover:bg-red-600'
                }`}
              >
                {inCart ? <><CheckCircle2 size={18} /> تمت الإضافة</> : <><Plus size={18} /> أضف للسلة</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWallet = () => (
    <div className="p-6 space-y-10 animate-in slide-in-from-bottom-8 duration-500 max-w-4xl mx-auto pb-24">
      <header>
        <h2 className="text-3xl font-black text-white">محفظتي</h2>
        <p className="text-slate-500 font-bold">تحكم في ميزانيتك وتابع مصاريفك</p>
      </header>

      <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="relative z-10">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-3">الرصيد المتاح حالياً</p>
          <h3 className="text-6xl font-black mb-10 tracking-tighter">{currentUser?.balance.toFixed(2)} ₪</h3>
          <button 
            onClick={() => setIsDepositModalOpen(true)}
            className="bg-red-600 text-white px-10 py-4.5 rounded-[1.5rem] font-black text-sm flex items-center gap-3 hover:bg-red-700 transition-all shadow-2xl shadow-red-900/30 active:scale-95"
          >
            <Plus size={24} /> شحن رصيد إضافي
          </button>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-red-600/5 rounded-full"></div>
      </div>

      <div className="space-y-5">
        <h4 className="text-xl font-black text-white flex items-center gap-2">
          <History size={24} className="text-red-500" /> سجل المعاملات المالية
        </h4>
        <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 shadow-xl overflow-hidden divide-y divide-white/5">
          {currentUser?.transactions.length === 0 ? (
            <p className="p-12 text-center text-slate-600 font-bold">لا توجد معاملات بعد</p>
          ) : (
            currentUser?.transactions.map(tr => (
              <div key={tr.id} className="p-6 flex justify-between items-center hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                    tr.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {tr.type === 'DEPOSIT' ? <ArrowUpCircle size={28} className="rotate-180" /> : <ArrowUpCircle size={28} />}
                  </div>
                  <div>
                    <p className="font-black text-white text-base">{tr.description}</p>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">{new Date(tr.date).toLocaleDateString('ar-PS')}</p>
                  </div>
                </div>
                <p className={`text-lg font-black ${tr.type === 'DEPOSIT' ? 'text-green-500' : 'text-red-500'}`}>
                  {tr.type === 'DEPOSIT' ? '+' : '-'}{Math.abs(tr.amount).toFixed(2)} ₪
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // Added renderOrders to show user's order history and active orders
  const renderOrders = () => (
    <div className="p-6 space-y-8 animate-in slide-in-from-bottom-8 duration-500 max-w-4xl mx-auto pb-24">
      <header className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">طلباتي</h2>
          <p className="text-slate-500 font-bold mt-1">تابع حالة وجبتك المفضلة الآن</p>
        </div>
        <div className="flex bg-slate-900 p-1.5 rounded-2xl w-fit shadow-xl border border-white/5">
          <button 
            onClick={() => setOrdersSubTab('active')}
            className={`px-8 py-3 rounded-xl font-black text-xs transition-all ${ordersSubTab === 'active' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            الطلبات النشطة ({activeOrdersList.length})
          </button>
          <button 
            onClick={() => setOrdersSubTab('history')}
            className={`px-8 py-3 rounded-xl font-black text-xs transition-all ${ordersSubTab === 'history' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            السجل ({historyOrdersList.length})
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {(ordersSubTab === 'active' ? activeOrdersList : historyOrdersList).map(order => (
          <div key={order.id} className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl group transition-all hover:border-red-600/20">
            <div className="p-8 space-y-6">
               <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">رقم الطلب</span>
                    <p className="text-xl font-black text-white">#{order.orderNumber}</p>
                    <div className="flex items-center gap-2 mt-2 text-slate-500">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold">{new Date(order.createdAt).toLocaleDateString('ar-PS')}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </div>
               </div>

               <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.uniqueId} className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-red-500 font-black text-xs">{item.quantity}×</div>
                         <span className="text-xs font-bold text-slate-300">{item.name}</span>
                       </div>
                       <span className="text-xs font-black text-white">{(item.price * item.quantity).toFixed(2)} ₪</span>
                    </div>
                  ))}
               </div>

               <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2 text-slate-500">
                        <MapPin size={14} />
                        <span className="text-[10px] font-bold">{getTypeLabel(order.type)}</span>
                     </div>
                     <div className="flex items-center gap-2 text-slate-500">
                        <CreditCard size={14} />
                        <span className="text-[10px] font-bold">{getPaymentLabel(order.paymentMethod)}</span>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">الإجمالي</p>
                    <p className="text-3xl font-black text-red-600">{order.total.toFixed(2)} ₪</p>
                  </div>
               </div>
            </div>
            {ordersSubTab === 'history' && (
              <div className="p-6 bg-slate-950/50 border-t border-white/5">
                <button 
                  onClick={() => { reorder(order.id); setIsCartOpen(true); }}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-xl active:scale-95"
                >
                  <RefreshCcw size={16} /> إعادة الطلب مرة أخرى
                </button>
              </div>
            )}
          </div>
        ))}
        {(ordersSubTab === 'active' ? activeOrdersList : historyOrdersList).length === 0 && (
          <div className="py-32 text-center space-y-6 bg-slate-900 rounded-[3rem] border border-dashed border-white/10">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-700">
              <Package size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <p className="font-black text-lg text-slate-400">لا توجد طلبات هنا بعد</p>
              <p className="text-xs text-slate-600 font-bold">ابدأ بطلب وجبتك الأولى من قائمة الطعام المميزة</p>
            </div>
            <button 
              onClick={() => setActiveTab('menu')}
              className="px-10 py-4 bg-red-600/10 text-red-500 rounded-2xl font-black text-xs hover:bg-red-600 hover:text-white transition-all"
            >
              استعراض المنيو
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Added renderProfile to display user account details and settings
  const renderProfile = () => (
    <div className="p-6 space-y-10 animate-in slide-in-from-bottom-8 duration-500 max-w-4xl mx-auto pb-24 text-slate-100">
      <header>
        <h2 className="text-3xl font-black text-white">الملف الشخصي</h2>
        <p className="text-slate-500 font-bold mt-1">إدارة بياناتك الشخصية وتفضيلاتك</p>
      </header>

      <div className="bg-slate-900 rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl">
         <div className="h-32 bg-gradient-to-r from-red-600 to-red-900 relative">
            <div className="absolute -bottom-16 right-10 w-32 h-32 bg-slate-800 rounded-[2.5rem] border-[6px] border-slate-900 flex items-center justify-center text-white text-5xl font-black shadow-2xl">
               {currentUser?.name.charAt(0)}
            </div>
         </div>
         <div className="pt-20 pb-10 px-10 space-y-8">
            <div className="flex justify-between items-end">
               <div>
                  <h3 className="text-3xl font-black text-white">{currentUser?.name}</h3>
                  <p className="text-slate-500 font-bold mt-1 flex items-center gap-2"><Smartphone size={14} /> {currentUser?.phone}</p>
               </div>
               <div className="bg-slate-800 px-6 py-2.5 rounded-2xl text-[10px] font-black border border-white/5 flex items-center gap-2 text-red-500">
                  <ShieldCheck size={16}/> عضو {currentUser?.tier === 'GOLD' ? 'ذهبي' : currentUser?.tier === 'SILVER' ? 'فضي' : 'بلاتيني'}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="bg-slate-950/50 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group hover:border-red-600/20 transition-all">
                  <div className="w-14 h-14 bg-red-600/10 text-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Star size={28} /></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">إجمالي النقاط</p>
                  <p className="text-2xl font-black text-white">{currentUser?.points} نقطة</p>
               </div>
               <div className="bg-slate-950/50 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group hover:border-red-600/20 transition-all">
                  <div className="w-14 h-14 bg-red-600/10 text-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Receipt size={28} /></div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">الرصيد الحالي</p>
                  <p className="text-2xl font-black text-white">{currentUser?.balance.toFixed(2)} ₪</p>
               </div>
            </div>

            <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">خيارات الحساب</p>
               <div className="bg-slate-950/50 rounded-[2.5rem] border border-white/5 overflow-hidden divide-y divide-white/5">
                  <button className="w-full flex items-center justify-between p-6 hover:bg-slate-800/50 transition-all text-right">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-800 rounded-xl text-slate-400"><MapPin size={20}/></div>
                        <div>
                           <p className="font-black text-white text-sm">عناوين التوصيل</p>
                           <p className="text-[10px] text-slate-500 font-bold mt-0.5">أضف أو عدل مواقع التوصيل الخاصة بك</p>
                        </div>
                     </div>
                     <ChevronLeft size={18} className="text-slate-600" />
                  </button>
                  <button className="w-full flex items-center justify-between p-6 hover:bg-slate-800/50 transition-all text-right">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-800 rounded-xl text-slate-400"><Heart size={20}/></div>
                        <div>
                           <p className="font-black text-white text-sm">الوجبات المفضلة</p>
                           <p className="text-[10px] text-slate-500 font-bold mt-0.5">قائمة بالأطعمة التي تحبها</p>
                        </div>
                     </div>
                     <ChevronLeft size={18} className="text-slate-600" />
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full flex items-center justify-between p-6 hover:bg-red-500/10 transition-all text-right group"
                  >
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all"><Power size={20}/></div>
                        <div>
                           <p className="font-black text-red-500 text-sm">تسجيل الخروج</p>
                           <p className="text-[10px] text-slate-500 font-bold mt-0.5">الخروج من حسابك الحالي</p>
                        </div>
                     </div>
                     <ChevronLeft size={18} className="text-red-500 group-hover:-translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 font-['Tajawal']" dir="rtl">
      <main className="flex-1 overflow-auto relative pb-24 lg:pb-0 custom-scrollbar">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'menu' && renderMenu()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'wallet' && renderWallet()}
        {activeTab === 'profile' && renderProfile()}

        <div className="fixed bottom-24 left-6 z-40 lg:bottom-10 lg:left-10">
          <button 
            onClick={() => setIsCartOpen(true)} 
            className={`w-18 h-18 bg-red-600 text-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(220,38,38,0.3)] relative hover:scale-110 transition-all active:scale-95 border-4 border-slate-950 ${cartAnimate ? 'animate-bounce' : ''}`}
            style={{ width: '70px', height: '70px' }}
          >
            <ShoppingBag size={30} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-lg">{cartCount}</span>}
          </button>
        </div>
      </main>

      {/* Cart Drawer */}
      <div className={`fixed inset-0 z-[300] flex justify-end transition-all duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
        <div className={`relative w-full max-w-lg bg-slate-900 h-full shadow-2xl flex flex-col transition-transform duration-500 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} border-r border-white/5`}>
           <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <ShoppingCart className="text-red-500" size={28} />
                <h3 className="text-2xl font-black text-white tracking-tight">سلة المشتريات</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-[1.2rem] transition-all text-slate-400"><X size={24} /></button>
           </div>

           <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {currentCart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-5">
                  <div className="w-28 h-28 bg-slate-800 rounded-full flex items-center justify-center shadow-inner"><ShoppingBag size={54} strokeWidth={1} /></div>
                  <p className="font-black text-lg">سلتك لا تزال فارغة</p>
                  <button onClick={() => {setIsCartOpen(false); setActiveTab('menu');}} className="text-red-500 font-bold border-b-2 border-red-500 pb-1">ابدأ باختيار وجباتك المفضلة</button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الوجبات المختارة</p>
                    {currentCart.map(item => (
                      <div key={item.uniqueId} className="bg-slate-950 p-5 rounded-[2.2rem] border border-white/5 shadow-inner space-y-4">
                        <div className="flex gap-4">
                          <img src={MENU_ITEMS.find(m => m.id === item.itemId)?.image} className="w-20 h-20 rounded-[1.2rem] object-cover shadow-xl" alt={item.name} />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-black text-white text-base truncate">{item.name}</h5>
                            <div className="flex justify-between items-center mt-2">
                               <span className="text-xs font-bold text-slate-500">{item.price} ₪ للواحدة</span>
                               <span className="text-lg font-black text-red-500">{(item.price * item.quantity).toFixed(2)} ₪</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                           <div className="flex items-center gap-4 bg-slate-800 p-1.5 rounded-2xl">
                              <button onClick={() => updateCartQuantity(item.uniqueId, -1)} className="w-9 h-9 flex items-center justify-center bg-slate-900 rounded-xl shadow-lg text-slate-400 hover:text-red-500"><Minus size={16}/></button>
                              <span className="font-black text-sm w-5 text-center text-white">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.uniqueId, 1)} className="w-9 h-9 flex items-center justify-center bg-slate-900 rounded-xl shadow-lg text-slate-400 hover:text-red-500"><Plus size={16}/></button>
                           </div>
                           <button onClick={() => removeFromCart(item.uniqueId)} className="p-3 text-slate-600 hover:text-red-500 transition-colors bg-slate-800/50 rounded-2xl"><Trash2 size={20}/></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">طريقة الاستلام</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: OrderType.DINE_IN, label: 'محلي', icon: Utensils },
                        { id: OrderType.TAKEAWAY, label: 'سفري', icon: Store },
                        { id: OrderType.DELIVERY, label: 'توصيل', icon: Truck },
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => setOrderType(type.id)}
                          className={`flex flex-col items-center gap-2 py-5 rounded-[1.8rem] border-2 transition-all ${cartOrderType === type.id ? 'border-red-600 bg-red-600/10 text-red-500 shadow-xl shadow-red-900/10' : 'bg-slate-950 border-white/5 text-slate-600'}`}
                        >
                          <type.icon size={22} />
                          <span className="text-[10px] font-black">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-4">
                     <div className="flex justify-between text-sm font-bold text-slate-500"><span>المجموع الفرعي</span><span>{subtotal.toFixed(2)} ₪</span></div>
                     {cartOrderType === OrderType.DELIVERY && (
                       <div className="flex justify-between text-sm font-bold text-slate-500"><span>رسوم التوصيل</span><span>10.00 ₪</span></div>
                     )}
                     <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-xl font-black text-white">الإجمالي النهائي</span>
                        <span className="text-3xl font-black text-red-600">{cartTotal.toFixed(2)} ₪</span>
                     </div>
                  </div>

                  <div className="space-y-4 pb-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">وسيلة الدفع</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setPaymentMethod(PaymentMethod.WALLET)}
                        className={`p-5 rounded-[1.8rem] border-2 flex items-center gap-3 transition-all ${paymentMethod === PaymentMethod.WALLET ? 'border-red-600 bg-red-600/10 text-red-500' : 'bg-slate-950 border-white/5 text-slate-600'}`}
                      >
                        <Wallet size={24} />
                        <p className="text-xs font-black">محفظة Resto</p>
                      </button>
                      <button 
                        onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                        className={`p-5 rounded-[1.8rem] border-2 flex items-center gap-3 transition-all ${paymentMethod === PaymentMethod.CASH ? 'border-red-600 bg-red-600/10 text-red-500' : 'bg-slate-950 border-white/5 text-slate-600'}`}
                      >
                        <Banknote size={24} />
                        <p className="text-xs font-black">كاش عند الاستلام</p>
                      </button>
                    </div>
                  </div>
                </>
              )}
           </div>

           {currentCart.length > 0 && (
             <div className="p-8 bg-slate-900 border-t border-white/5 sticky bottom-0">
                <button 
                  onClick={() => { 
                    submitOrder(OrderStatus.PENDING, paymentMethod, appliedDiscount); 
                    setIsCartOpen(false); 
                    setActiveTab('orders'); 
                  }} 
                  className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-red-900/30 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  تأكيد وإرسال الطلب <ChevronLeft size={24} className="rotate-0" />
                </button>
             </div>
           )}
        </div>
      </div>

      {/* AI Chat Slider */}
      <div className={`fixed inset-0 z-[300] flex justify-end transition-all duration-500 ${isChatOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsChatOpen(false)}></div>
        <div className={`relative w-full max-w-md bg-slate-900 h-full shadow-2xl flex flex-col transition-transform duration-500 ease-out ${isChatOpen ? 'translate-x-0' : 'translate-x-full'} border-r border-white/5`}>
           <div className="bg-slate-950 p-8 text-white flex justify-between items-center border-b border-white/5">
             <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-red-600 rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-red-900/20"><Bot size={32} /></div>
               <div><h3 className="font-black text-xl">المساعد الذكي</h3><p className="text-[10px] opacity-60 font-bold">بخدمتك على مدار الساعة 🌙</p></div>
             </div>
             <button onClick={() => setIsChatOpen(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-400"><X size={20} /></button>
           </div>
           <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-950/30 custom-scrollbar">
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center space-y-5">
                   <Sparkles size={64} strokeWidth={1} />
                   <p className="font-bold max-w-[200px]">أهلاً بك! أنا مساعدك الذكي، يمكنني مساعدتك في اختيار وجبتك المثالية.</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[1.8rem] text-sm font-bold shadow-2xl ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none border border-white/5' : 'bg-red-600 text-white rounded-tl-none shadow-red-900/20'}`}>{msg.text}</div>
                </div>
              ))}
              {isTyping && <div className="flex justify-end"><div className="bg-slate-800 p-5 rounded-[1.8rem] rounded-tl-none shadow-2xl border border-white/5 flex gap-1.5"><div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]"></div></div></div>}
              <div ref={chatEndRef} />
           </div>
           <div className="p-8 bg-slate-900 border-t border-white/5 flex gap-4">
              <input 
                type="text" 
                onKeyPress={(e) => e.key === 'Enter' && handleAiAsk((e.target as HTMLInputElement).value)} 
                placeholder="اسألني أي شيء..." 
                className="flex-1 bg-slate-800 px-6 py-4.5 rounded-[1.5rem] outline-none text-sm font-bold text-white border border-white/5 focus:border-red-600 transition-all placeholder-slate-600" 
              />
              <button 
                className="bg-red-600 text-white p-4.5 rounded-[1.5rem] shadow-xl shadow-red-900/20 active:scale-90 transition-all" 
                onClick={(e) => {
                  const input = (e.currentTarget.previousSibling as HTMLInputElement);
                  handleAiAsk(input.value);
                  input.value = '';
                }}
              >
                <Send size={24} />
              </button>
           </div>
        </div>
      </div>

      {/* Item Customization Backdrop */}
      {selectedItemDetails && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-xl rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] border border-white/5">
             <div className="relative h-72">
                <img src={selectedItemDetails.image} className="w-full h-full object-cover" alt={selectedItemDetails.nameAr} />
                <button onClick={() => setSelectedItemDetails(null)} className="absolute top-6 left-6 p-3.5 bg-slate-950/80 backdrop-blur-md rounded-2xl text-white shadow-2xl border border-white/10"><X size={24}/></button>
                <div className="absolute bottom-6 right-6 bg-red-600 px-6 py-2 rounded-2xl font-black text-xl shadow-2xl">
                   {selectedItemDetails.price} ₪
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <div>
                  <h3 className="text-3xl font-black text-white mb-3">{selectedItemDetails.nameAr}</h3>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed">{selectedItemDetails.descriptionAr || 'استمتع بمذاق لا يقاوم تم تحضيره بعناية فائقة خصيصاً لك.'}</p>
                </div>

                {selectedItemDetails.sizes && (
                  <div className="space-y-5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">اختر الحجم المفضل</p>
                    <div className="flex gap-4">
                      {selectedItemDetails.sizes.map(size => (
                        <button 
                          key={size.name}
                          onClick={() => setCustomSize(size.name)}
                          className={`flex-1 py-4 px-5 rounded-2xl border-2 font-black text-sm transition-all ${customSize === size.name ? 'border-red-600 bg-red-600/10 text-red-500' : 'border-white/5 text-slate-600 bg-slate-950'}`}
                        >
                          <p className="text-lg">{size.name}</p>
                          <p className="text-[10px] opacity-60 mt-1">{size.price} ₪</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">إضافة ملاحظات خاصة</p>
                   <textarea 
                    value={itemNote}
                    onChange={(e) => setItemNote(e.target.value)}
                    placeholder="مثلاً: بدون توابل، زيادة صوص، أو أي شيء آخر..."
                    className="w-full bg-slate-950 border border-white/5 rounded-[1.8rem] p-6 text-sm font-bold outline-none focus:ring-2 focus:ring-red-600 h-32 resize-none text-white placeholder-slate-700 transition-all"
                   />
                </div>
             </div>

             <div className="p-10 bg-slate-950 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">السعر التقريبي</p>
                  <p className="text-3xl font-black text-red-600">
                    {((selectedItemDetails.sizes?.find(s => s.name === customSize)?.price || selectedItemDetails.price)).toFixed(2)} ₪
                  </p>
                </div>
                <button 
                  onClick={() => {
                    addToCart(selectedItemDetails, {
                      size: customSize,
                      note: itemNote,
                      price: selectedItemDetails.sizes?.find(s => s.name === customSize)?.price || selectedItemDetails.price
                    });
                    setSelectedItemDetails(null);
                  }}
                  className="bg-red-600 text-white px-12 py-5 rounded-[1.8rem] font-black text-lg shadow-2xl shadow-red-900/30 hover:scale-105 active:scale-95 transition-all"
                >
                  تأكيد الإضافة
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
