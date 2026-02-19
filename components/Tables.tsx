
import React from 'react';
import { useApp } from '../store';
import { Table as TableType } from '../types';

export const TablesView: React.FC<{ onSelect: (table: TableType) => void }> = ({ onSelect }) => {
  const { tables, selectedTable, setSelectedTable } = useApp();

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة الطاولات</h2>
          <p className="text-slate-500">اختر طاولة للبدء بطلب جديد أو متابعة طلب قائم</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border border-slate-200"></div>
            <span className="text-sm text-slate-600">فارغة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-sm text-slate-600">مشغولة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-sm text-slate-600">محجوزة</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => {
              setSelectedTable(table);
              onSelect(table);
            }}
            className={`aspect-square rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all group ${
              selectedTable?.id === table.id 
                ? 'border-orange-500 bg-orange-50' 
                : table.status === 'OCCUPIED'
                ? 'bg-orange-500 border-orange-500 text-white shadow-lg'
                : table.status === 'RESERVED'
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white border-slate-100 hover:border-orange-300 text-slate-700'
            }`}
          >
            <span className="text-2xl font-bold">#{table.number}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              table.status === 'EMPTY' ? 'bg-slate-100 text-slate-500' : 'bg-white bg-opacity-20 text-white'
            }`}>
              {table.capacity} أشخاص
            </span>
            {table.status === 'OCCUPIED' && (
              <span className="text-[10px] opacity-80 mt-1">مشغولة</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
