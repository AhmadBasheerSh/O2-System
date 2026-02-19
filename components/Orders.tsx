
import React, { useState } from 'react';
import { useApp } from '../store';
import { OrderStatus, Order } from '../types';
import { Clock, CheckCircle2, XCircle, MoreVertical, Edit3, Eye, Search } from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { activeOrders, voidOrder, completeOrder, loadOrderToPOS } = useApp();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'CLOSED'>('ACTIVE');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.PENDING: return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case OrderStatus.PREPARING: return 'bg-blue-50 text-blue-600 border-blue-100';
      case OrderStatus.READY: return 'bg-orange-50 text-orange-600 border-orange-100';
      case OrderStatus.DELIVERED: return 'bg-green-50 text-green-600 border-green-100';
      case OrderStatus.CANCELED: return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.PENDING: return 'قيد المراجعة';
      case OrderStatus.PREPARING: return 'في المطبخ';
      case OrderStatus.READY: return 'جاهز';
      case OrderStatus.DELIVERED: return 'تم التسليم';
      case OrderStatus.CANCELED: return 'ملغي';
      default: return 'غير معروف';
    }
  };

  const filteredOrders = activeOrders.filter(order => {
    const matchesTab = activeTab === 'ACTIVE' 
      ? order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELED
      : order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELED;
    const matchesSearch = order.orderNumber.includes(searchTerm) || order.tableId?.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const handleEditOrder = (order: Order) => {
    // Check if editable
    if (order.status === OrderStatus.DELIVERED) {
      alert('عذراً، الطلبات المسلمة لا يمكن تعديلها.');
      return;
    }
    loadOrderToPOS(order);
    // Note: Parent component should ideally handle view switching, 
    // but in this setup, the loadOrderToPOS updates the global state.
    // The user will need to navigate back to POS or we can trigger it if needed.
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة الطلبات</h2>
          <p className="text-slate-500 font-bold">تابع الطلبات النشطة وراجع سجل المبيعات</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث برقم الطلب أو الطاولة..."
            className="w-full pr-12 pl-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 text-sm font-bold shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 w-fit">
        <button 
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'ACTIVE' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500'}`}
        >
          الطلبات النشطة ({activeOrders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELED).length})
        </button>
        <button 
          onClick={() => setActiveTab('CLOSED')}
          className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'CLOSED' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
        >
          الطلبات المغلقة ({activeOrders.filter(o => o.status === OrderStatus.DELIVERED || o.status === OrderStatus.CANCELED).length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الطلب</span>
                  <p className="text-xl font-black text-slate-800">#{order.orderNumber.split('-').pop()}</p>
                </div>
                <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black flex items-center gap-2 ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {order.items.map(item => (
                  <div key={item.uniqueId} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                    <span className="text-xs font-bold text-slate-700">{item.name} <span className="text-orange-500">×{item.quantity}</span></span>
                    <span className="text-xs font-black">{(item.price * item.quantity).toFixed(2)} ₪</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={14} />
                  <span className="text-xs font-bold">{new Date(order.createdAt).toLocaleTimeString('ar-EG')}</span>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase">الإجمالي</p>
                   <p className="text-2xl font-black text-orange-600">{order.total.toFixed(2)} ₪</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex gap-3">
               {activeTab === 'ACTIVE' ? (
                 <>
                    <button 
                      onClick={() => handleEditOrder(order)}
                      className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-2xl font-black text-xs hover:bg-slate-100 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <Edit3 size={14} /> تعديل الطلب
                    </button>
                    <button 
                      onClick={() => completeOrder(order.id, { method: 'CASH' })}
                      className="flex-1 bg-orange-500 text-white py-3 rounded-2xl font-black text-xs hover:bg-orange-600 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                    >
                      <CheckCircle2 size={14} /> إغلاق الفاتورة
                    </button>
                 </>
               ) : (
                 <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-2xl font-black text-xs hover:bg-slate-100 flex items-center justify-center gap-2 transition-all shadow-sm">
                   <Eye size={14} /> عرض التفاصيل
                 </button>
               )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 opacity-50">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Eye size={48} className="text-slate-300" />
            </div>
            <p className="font-bold text-slate-400">لا توجد طلبات في هذا القسم حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};
