
import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { 
  User, Calendar, Clock, CreditCard, BookOpen, Power, 
  ChevronRight, ChevronLeft, Edit2, Bell, CheckCircle2, AlertCircle,
  TrendingUp, Wallet, ArrowUpRight, ArrowDownRight,
  Menu, X, Briefcase, Phone, Mail, MapPin, Hash,
  ChevronDown, Info, Shield, FileText, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmployeeStatus } from '../types';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area
} from 'recharts';

type Tab = 'DASHBOARD' | 'PERSONAL' | 'SHIFT' | 'TIMESHEET' | 'FINANCE' | 'POLICIES';

export const EmployeeDashboard: React.FC<{ initialTab?: Tab }> = ({ initialTab = 'DASHBOARD' }) => {
  const { currentUser, logout, employees, departments, jobTitles, attendances, workSchedules, financialTransactions, checkIn, checkOut, addFinancialTransaction, updateEmployee } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedPolicy, setExpandedPolicy] = useState<number | null>(null);
  const [timesheetSearch, setTimesheetSearch] = useState('');

  const todayAttendance = useMemo(() => {
    const today = new Date();
    return attendances.find(a => 
      a.employeeId === currentUser?.id && 
      a.date.toDateString() === today.toDateString()
    );
  }, [attendances, currentUser]);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const employee = useMemo(() => {
    return employees.find(e => e.id === currentUser?.id) || employees[0];
  }, [employees, currentUser]);

  const department = useMemo(() => {
    return departments.find(d => d.id === employee.departmentId);
  }, [departments, employee]);

  const jobTitle = useMemo(() => {
    return jobTitles.find(j => j.id === employee.jobTitleId);
  }, [jobTitles, employee]);

  const employeeAttendances = useMemo(() => {
    let filtered = attendances.filter(a => a.employeeId === employee.id);
    if (timesheetSearch) {
      filtered = filtered.filter(a => a.date.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).includes(timesheetSearch));
    }
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [attendances, employee, timesheetSearch]);

  const employeeTransactions = useMemo(() => {
    return financialTransactions.filter(t => t.employeeId === employee.id);
  }, [financialTransactions, employee]);

  const totalAdvances = useMemo(() => {
    return employeeTransactions
      .filter(t => t.type === 'WITHDRAWAL' || t.type === 'EXPENSE') // Assuming advances are withdrawals or expenses
      .reduce((acc, t) => acc + t.amount, 0);
  }, [employeeTransactions]);

  const attendanceStatusData = useMemo(() => {
    const statusCounts = employeeAttendances.reduce((acc, att) => {
      acc[att.status] = (acc[att.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'مكتمل', value: statusCounts['PRESENT'] || 0, color: '#10b981' },
      { name: 'متأخر', value: statusCounts['LATE'] || 0, color: '#f59e0b' },
      { name: 'غائب', value: statusCounts['ABSENT'] || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [employeeAttendances]);

  const workHoursTrendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    return last30Days.map(date => {
      const att = attendances.find(a => 
        a.employeeId === employee.id && 
        a.date.toDateString() === date.toDateString()
      );
      let hours = 0;
      if (att?.checkIn && att?.checkOut) {
        hours = (att.checkOut.getTime() - att.checkIn.getTime()) / (1000 * 60 * 60);
      }
      return {
        date: date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
        hours: parseFloat(hours.toFixed(1))
      };
    });
  }, [attendances, employee]);

  const handleEditProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedData = {
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
    };

    updateEmployee(employee.id, updatedData);
    setIsEditModalOpen(false);
    alert('تم تحديث البيانات بنجاح');
  };

  const employeeSchedules = useMemo(() => {
    return workSchedules.filter(s => s.employeeId === employee.id);
  }, [workSchedules, employee]);

  const handleAdvanceRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const reason = formData.get('reason') as string;

    if (amount > employee.salary * 0.3) {
      alert('لا يمكن طلب سلفة تزيد عن 30% من الراتب');
      return;
    }

    addFinancialTransaction({
      type: 'WITHDRAWAL',
      amount,
      description: `طلب سلفة: ${reason}`,
      category: 'SALARY_ADVANCE',
      paymentMethod: 'CASH',
      employeeId: employee.id,
      timestamp: new Date()
    });

    alert('تم إرسال طلب السلفة بنجاح');
    e.currentTarget.reset();
  };

  const nextShift = useMemo(() => {
    const today = new Date().getDay();
    const schedule = employeeSchedules.find(s => s.dayOfWeek === today) || employeeSchedules[0];
    return schedule;
  }, [employeeSchedules]);

  const totalHoursThisMonth = useMemo(() => {
    return employeeAttendances.reduce((acc, att) => {
      if (att.checkIn && att.checkOut) {
        const diff = att.checkOut.getTime() - att.checkIn.getTime();
        return acc + (diff / (1000 * 60 * 60));
      }
      return acc;
    }, 0);
  }, [employeeAttendances]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    return last7Days.map(date => {
      const att = attendances.find(a => 
        a.employeeId === employee.id && 
        a.date.toDateString() === date.toDateString()
      );
      let hours = 0;
      if (att?.checkIn && att?.checkOut) {
        hours = (att.checkOut.getTime() - att.checkIn.getTime()) / (1000 * 60 * 60);
      }
      return {
        name: date.toLocaleDateString('ar-EG', { weekday: 'short' }),
        hours: parseFloat(hours.toFixed(1)),
        status: att?.status || 'ABSENT'
      };
    });
  }, [attendances, employee]);

  if (!employee) return <div>Loading...</div>;

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 flex font-['Tajawal']" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 p-0">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-2">👋 مرحباً، {employee.name.split(' ')[0]}</h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">نتمنى لك يوماً سعيداً في {department?.nameAr || 'المطعم'}</p>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-3 bg-slate-900 rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-all">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-600 rounded-full border-2 border-slate-900"></span>
            </button>
            <div className="flex items-center gap-3 md:gap-4 bg-slate-900 p-1.5 md:p-2 pr-3 md:pr-4 rounded-2xl border border-white/5">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-black text-white leading-none">{employee.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{jobTitle?.name || 'موظف'}</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-800 rounded-xl flex items-center justify-center text-red-500 font-black">
                {employee.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'DASHBOARD' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-600 opacity-50"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-600/10 text-red-500 rounded-2xl"><Clock size={24} /></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ساعات العمل</span>
                  </div>
                  <h3 className="text-3xl font-black text-white">{totalHoursThisMonth.toFixed(1)}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-bold flex items-center gap-1">
                    <TrendingUp size={12} className="text-emerald-500" />
                    <span className="text-emerald-500">+12%</span> من الشهر الماضي
                  </p>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600 opacity-50"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-600/10 text-emerald-500 rounded-2xl"><Wallet size={24} /></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الراتب المتوقع</span>
                  </div>
                  <h3 className="text-3xl font-black text-white">₪{(totalHoursThisMonth * 25).toLocaleString()}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-bold">بناءً على الساعات المسجلة</p>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-600 opacity-50"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-600/10 text-amber-500 rounded-2xl"><Calendar size={24} /></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الدوام القادم</span>
                  </div>
                  <h3 className="text-xl font-black text-white">{nextShift?.startTime || '08:00 ص'}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-bold">{department?.nameAr || 'قسم الشاورما'}</p>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 opacity-50"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-600/10 text-indigo-500 rounded-2xl"><CheckCircle2 size={24} /></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">حالة الموظف</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${todayAttendance && !todayAttendance.checkOut ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'} rounded-full`}></div>
                    <h3 className="text-xl font-black text-white">
                      {todayAttendance ? (todayAttendance.checkOut ? 'خارج الدوام' : 'على رأس العمل') : 'لم يبدأ الدوام'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-bold">
                    {todayAttendance ? `تم تسجيل الدخول ${todayAttendance.checkIn.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}` : 'بانتظار تسجيل الحضور'}
                  </p>
                </div>
              </div>

              {/* Grid Navigation & Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-white">ساعات العمل (آخر 7 أيام)</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ساعات الدوام</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="#64748b" 
                            fontSize={10} 
                            fontWeight="bold"
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={10} 
                            fontWeight="bold"
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            cursor={{ fill: '#1e293b' }}
                            contentStyle={{ 
                              backgroundColor: '#0f172a', 
                              border: '1px solid rgba(255,255,255,0.05)',
                              borderRadius: '1rem',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          />
                          <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.hours > 0 ? '#dc2626' : '#1e293b'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-white">تطور ساعات العمل (آخر 30 يوم)</h3>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={workHoursTrendData}>
                          <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#64748b" 
                            fontSize={10} 
                            fontWeight="bold"
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={10} 
                            fontWeight="bold"
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0f172a', 
                              border: '1px solid rgba(255,255,255,0.05)',
                              borderRadius: '1rem',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          />
                          <Area type="monotone" dataKey="hours" stroke="#dc2626" fillOpacity={1} fill="url(#colorHours)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 shadow-xl">
                    <h3 className="text-xl font-black text-white mb-8">توزيع الحضور</h3>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={attendanceStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {attendanceStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#0f172a', 
                              border: '1px solid rgba(255,255,255,0.05)',
                              borderRadius: '1rem',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {attendanceStatusData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-xs font-bold text-slate-400">{item.name}</span>
                          </div>
                          <span className="text-xs font-black text-white">{item.value} يوم</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-white">النشاط الأخير</h3>
                      <button 
                        onClick={() => setActiveTab('TIMESHEET')}
                        className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                      >
                        عرض الكل
                      </button>
                    </div>
                    <div className="space-y-4">
                      {employeeAttendances.slice(0, 4).map((att, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${att.status === 'PRESENT' ? 'bg-emerald-600/10 text-emerald-500' : 'bg-amber-600/10 text-amber-500'}`}>
                              <Clock size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white">
                                {att.status === 'PRESENT' ? 'تسجيل حضور مكتمل' : 'تسجيل حضور متأخر'}
                              </p>
                              <p className="text-[10px] text-slate-500 font-bold">
                                {att.date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-black text-white">
                              {att.checkIn?.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold">وقت الدخول</p>
                          </div>
                        </div>
                      ))}
                      {employeeAttendances.length === 0 && (
                        <div className="text-center py-8">
                          <Info size={32} className="mx-auto text-slate-700 mb-2" />
                          <p className="text-slate-500 font-bold text-sm">لا يوجد نشاط مؤخراً</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('PERSONAL')}
                    className="w-full bg-slate-900 p-6 rounded-2xl border border-white/5 hover:border-red-600 transition-all group text-right flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">بياناتي الشخصية</h3>
                      <p className="text-sm text-slate-500 font-bold">عرض وتعديل معلوماتك</p>
                    </div>
                    <div className="w-14 h-14 bg-slate-800 text-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><User size={28} /></div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('SHIFT')}
                    className="w-full bg-slate-900 p-6 rounded-2xl border border-white/5 hover:border-red-600 transition-all group text-right flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">جدول الدوام</h3>
                      <p className="text-sm text-slate-500 font-bold">متابعة مواعيد العمل</p>
                    </div>
                    <div className="w-14 h-14 bg-slate-800 text-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Calendar size={28} /></div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('FINANCE')}
                    className="w-full bg-slate-900 p-6 rounded-2xl border border-white/5 hover:border-red-600 transition-all group text-right flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">القسم المالي</h3>
                      <p className="text-sm text-slate-500 font-bold">كشف الراتب والسلف</p>
                    </div>
                    <div className="w-14 h-14 bg-slate-800 text-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><CreditCard size={28} /></div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'PERSONAL' && (
            <motion.div 
              key="personal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="h-48 bg-gradient-to-r from-red-600 to-red-900 relative">
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute top-6 left-6 p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all backdrop-blur-md flex items-center gap-2 font-bold"
                  >
                    <Edit2 size={18} />
                    تعديل الملف
                  </button>
                </div>
                <div className="px-6 pb-6 -mt-20 relative">
                  <div className="w-40 h-40 bg-slate-800 rounded-2xl border-8 border-slate-900 flex items-center justify-center text-red-500 text-6xl font-black shadow-2xl mb-8">
                    {employee.name.charAt(0)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-black text-white mb-1">{employee.name}</h2>
                        <p className="text-red-500 font-black uppercase tracking-widest text-sm">{jobTitle?.name || 'موظف'}</p>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                          <div className="p-3 bg-slate-800 rounded-2xl text-slate-400 group-hover:text-red-500 transition-colors"><Mail size={20} /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">البريد الإلكتروني</p>
                            <p className="text-white font-bold">{employee.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                          <div className="p-3 bg-slate-800 rounded-2xl text-slate-400 group-hover:text-red-500 transition-colors"><Phone size={20} /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">رقم الهاتف</p>
                            <p className="text-white font-bold">{employee.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                          <div className="p-3 bg-slate-800 rounded-2xl text-slate-400 group-hover:text-red-500 transition-colors"><MapPin size={20} /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">العنوان</p>
                            <p className="text-white font-bold">{employee.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8 bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                      <h3 className="text-xl font-black text-white flex items-center gap-3">
                        <Briefcase size={24} className="text-red-500" />
                        المعلومات الوظيفية
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">القسم</p>
                          <p className="text-white font-bold">{department?.nameAr || 'غير محدد'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">الرقم الوظيفي</p>
                          <p className="text-white font-bold">{employee.employeeId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">تاريخ التعيين</p>
                          <p className="text-white font-bold">{employee.hireDate.toLocaleDateString('ar-EG')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">نوع الدوام</p>
                          <p className="text-white font-bold">دوام كامل</p>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">الصلاحيات</p>
                        <div className="flex flex-wrap gap-2">
                          {employee.permissions.map(p => (
                            <span key={p} className="px-3 py-1 bg-red-600/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-wider">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'SHIFT' && (
            <motion.div 
              key="shift"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-black text-white">جدول العمل الأسبوعي</h3>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                        <span className="text-xs font-bold text-slate-400">الدوام الحالي</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day, idx) => {
                        const schedule = employeeSchedules.find(s => s.dayOfWeek === (idx + 6) % 7);
                        const isToday = new Date().getDay() === (idx + 6) % 7;
                        
                        return (
                          <div 
                            key={day} 
                            className={`p-4 rounded-2xl border transition-all ${
                              isToday ? 'bg-red-600 border-red-500 shadow-lg shadow-red-600/20' : 'bg-slate-800 border-white/5'
                            }`}
                          >
                            <p className={`text-[10px] font-black mb-2 uppercase tracking-widest ${isToday ? 'text-white/60' : 'text-slate-500'}`}>
                              {day}
                            </p>
                            {schedule ? (
                              <div className="space-y-1">
                                <p className={`text-sm font-black ${isToday ? 'text-white' : 'text-slate-200'}`}>{schedule.startTime}</p>
                                <p className={`text-[10px] font-bold ${isToday ? 'text-white/80' : 'text-slate-500'}`}>إلى {schedule.endTime}</p>
                              </div>
                            ) : (
                              <p className="text-[10px] font-black text-slate-600 uppercase">إجازة</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-black text-white mb-6">تفاصيل الشفت الحالي</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-800 rounded-2xl border border-white/5 flex items-center gap-6">
                        <div className="w-14 h-14 bg-red-600/10 text-red-500 rounded-2xl flex items-center justify-center"><Clock size={28} /></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">نوع الشفت</p>
                          <p className="text-lg font-black text-white">صباحي (Morning)</p>
                        </div>
                      </div>
                      <div className="p-6 bg-slate-800 rounded-2xl border border-white/5 flex items-center gap-6">
                        <div className="w-14 h-14 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center"><Calendar size={28} /></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">أيام العمل</p>
                          <p className="text-lg font-black text-white">السبت - الخميس</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-red-600 p-6 rounded-2xl text-white shadow-2xl shadow-red-900/20">
                    <h3 className="text-xl font-black mb-4">تسجيل الحضور</h3>
                    <p className="text-sm text-white/80 font-bold mb-8">يرجى التأكد من تسجيل الحضور عند الوصول لمقر العمل.</p>
                    {!todayAttendance ? (
                      <button 
                        onClick={() => checkIn(employee.id)}
                        className="w-full py-4 bg-white text-red-600 rounded-2xl font-black text-lg shadow-xl hover:bg-slate-100 transition-all active:scale-95"
                      >
                        تسجيل حضور الآن
                      </button>
                    ) : !todayAttendance.checkOut ? (
                      <button 
                        onClick={() => checkOut(employee.id)}
                        className="w-full py-4 bg-white text-red-600 rounded-2xl font-black text-lg shadow-xl hover:bg-slate-100 transition-all active:scale-95"
                      >
                        تسجيل انصراف الآن
                      </button>
                    ) : (
                      <div className="w-full py-4 bg-white/20 text-white rounded-2xl font-black text-lg text-center">
                        تم إكمال الدوام اليوم
                      </div>
                    )}
                    <p className="text-center mt-4 text-[10px] font-black uppercase tracking-widest opacity-60">
                      {todayAttendance ? `آخر تسجيل: ${todayAttendance.checkIn.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}` : 'لم يتم التسجيل اليوم'}
                    </p>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-black text-white mb-6">تنبيهات الدوام</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4 p-4 bg-amber-600/10 rounded-2xl border border-amber-600/20">
                        <AlertCircle className="text-amber-500 shrink-0" size={20} />
                        <p className="text-xs font-bold text-amber-200/80">تأخير 15 دقيقة في يوم الثلاثاء الماضي.</p>
                      </div>
                      <div className="flex gap-4 p-4 bg-emerald-600/10 rounded-2xl border border-emerald-600/20">
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                        <p className="text-xs font-bold text-emerald-200/80">التزام كامل بالمواعيد هذا الأسبوع.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'TIMESHEET' && (
            <motion.div 
              key="timesheet"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <h3 className="text-2xl font-black text-white">سجل الحضور والانصراف</h3>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <input 
                        type="text" 
                        placeholder="بحث في التواريخ..." 
                        value={timesheetSearch}
                        onChange={(e) => setTimesheetSearch(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-slate-800 border border-white/5 rounded-xl outline-none font-bold text-xs text-white focus:ring-2 focus:ring-red-600 transition-all"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    </div>
                    <select className="bg-slate-800 border border-white/5 text-white text-xs font-black px-4 py-2 rounded-xl outline-none">
                      <option>مارس 2026</option>
                      <option>فبراير 2026</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-slate-800/50">
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">التاريخ</th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">الحضور</th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">الانصراف</th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ساعات العمل</th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {employeeAttendances.map((att) => (
                        <tr key={att.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold text-white">{att.date.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</td>
                          <td className="p-4 font-black text-slate-300">{att.checkIn ? att.checkIn.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                          <td className="p-4 font-black text-slate-300">{att.checkOut ? att.checkOut.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                          <td className="p-4 font-black text-white">8 ساعات</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              att.status === 'PRESENT' ? 'bg-emerald-600/10 text-emerald-500' : 
                              att.status === 'LATE' ? 'bg-amber-600/10 text-amber-500' : 
                              'bg-red-600/10 text-red-500'
                            }`}>
                              {att.status === 'PRESENT' ? 'مكتمل' : att.status === 'LATE' ? 'متأخر' : 'غائب'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'FINANCE' && (
            <motion.div 
              key="finance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-indigo-600"></div>
                    <h3 className="text-2xl font-black text-white mb-8">كشف الراتب الحالي</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-slate-800 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-600/10 text-emerald-500 rounded-xl"><ArrowUpRight size={24} /></div>
                          <div>
                            <p className="text-sm font-black text-white">الراتب الأساسي</p>
                            <p className="text-xs text-slate-500 font-bold">حسب العقد الوظيفي</p>
                          </div>
                        </div>
                        <p className="text-2xl font-black text-white">₪{employee.salary}</p>
                      </div>
                      <div className="flex items-center justify-between p-6 bg-slate-800 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-600/10 text-red-500 rounded-xl"><ArrowDownRight size={24} /></div>
                          <div>
                            <p className="text-sm font-black text-white">السحوبات والسلف</p>
                            <p className="text-xs text-slate-500 font-bold">تم سحبها خلال الشهر</p>
                          </div>
                        </div>
                        <p className="text-2xl font-black text-red-500">-₪{totalAdvances}</p>
                      </div>
                      <div className="flex items-center justify-between p-6 bg-red-600 rounded-2xl shadow-xl shadow-red-900/20">
                        <div>
                          <p className="text-sm font-black text-white/80 uppercase tracking-widest">صافي الراتب المستحق</p>
                          <p className="text-xs text-white/60 font-bold">سيتم صرفه في 01/{new Date().getMonth() + 2}/{new Date().getFullYear()}</p>
                        </div>
                        <p className="text-4xl font-black text-white">₪{employee.salary - totalAdvances}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-black text-white mb-6">آخر العمليات المالية</h3>
                    <div className="space-y-4">
                      {employeeTransactions.length > 0 ? (
                        employeeTransactions.slice(0, 5).map(t => (
                          <div key={t.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-red-500">
                                {t.type === 'WITHDRAWAL' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                              </div>
                              <div>
                                <p className="text-sm font-black text-white">{t.description}</p>
                                <p className="text-[10px] text-slate-500 font-bold">
                                  {new Date(t.timestamp).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <p className={`font-black ${t.type === 'WITHDRAWAL' ? 'text-red-500' : 'text-emerald-500'}`}>
                              {t.type === 'WITHDRAWAL' ? '-' : '+'}₪{t.amount}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <CreditCard size={48} className="mx-auto text-slate-700 mb-4" />
                          <p className="text-slate-500 font-bold">لا يوجد عمليات مالية مسجلة</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-black text-white mb-6">طلب سلفة</h3>
                    <p className="text-sm text-slate-500 font-bold mb-6">يمكنك طلب سلفة مالية بحد أقصى 30% من الراتب الأساسي (₪{(employee.salary * 0.3).toFixed(0)}).</p>
                    <form className="space-y-4" onSubmit={handleAdvanceRequest}>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">المبلغ المطلوب (₪)</label>
                        <input 
                          type="number" 
                          name="amount"
                          placeholder="أدخل المبلغ" 
                          max={employee.salary * 0.3}
                          className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none font-black text-white focus:ring-2 focus:ring-red-600 transition-all" 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">السبب</label>
                        <textarea 
                          name="reason"
                          placeholder="اكتب سبب الطلب..."
                          className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none font-bold text-white focus:ring-2 focus:ring-red-600 transition-all min-h-[100px]"
                          required
                        ></textarea>
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-red-700 transition-all active:scale-95"
                      >
                        إرسال الطلب
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'POLICIES' && (
            <motion.div 
              key="policies"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-white mb-4">سياسات ولوائح الموظفين</h2>
                <p className="text-slate-500 font-bold">يرجى قراءة والالتزام بجميع السياسات لضمان بيئة عمل احترافية</p>
              </div>

              {[
                { title: 'سياسة الحضور والانصراف', icon: Clock, content: 'يجب على جميع الموظفين تسجيل الحضور قبل 5 دقائق من بداية الشفت. التأخير المتكرر قد يؤدي إلى خصومات مالية حسب اللائحة الداخلية.' },
                { title: 'الزي الرسمي والمظهر العام', icon: Shield, content: 'الالتزام بالزي الرسمي النظيف والمكوي طوال ساعات العمل. يمنع ارتداء الإكسسوارات المبالغ فيها أو العطور القوية في مناطق تحضير الطعام.' },
                { title: 'سياسة الإجازات والغياب', icon: Calendar, content: 'يجب تقديم طلب الإجازة قبل 48 ساعة على الأقل من موعدها. في حالات الطوارئ، يرجى إبلاغ مدير الفرع فوراً.' },
                { title: 'الأمن والسلامة المهنية', icon: Info, content: 'الالتزام بكافة معايير السلامة عند التعامل مع المعدات الحادة أو الساخنة. الإبلاغ الفوري عن أي عطل في الأجهزة أو مخاطر محتملة.' }
              ].map((policy, idx) => (
                <div key={idx} className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden group">
                  <button 
                    onClick={() => setExpandedPolicy(expandedPolicy === idx ? null : idx)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-800 text-red-500 rounded-xl"><policy.icon size={24} /></div>
                      <span className="text-lg font-black text-white">{policy.title}</span>
                    </div>
                    <ChevronDown size={20} className={`text-slate-500 transition-all duration-300 ${expandedPolicy === idx ? 'rotate-180 text-white' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedPolicy === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-8 pt-2">
                          <p className="text-slate-400 font-bold leading-relaxed">{policy.content}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {isEditModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditModalOpen(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 shadow-2xl p-10"
              >
                <h3 className="text-2xl font-black text-white mb-8">تعديل الملف الشخصي</h3>
                <form className="space-y-6" onSubmit={handleEditProfile}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">رقم الهاتف</label>
                    <input type="text" name="phone" defaultValue={employee.phone} className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none font-black text-white focus:ring-2 focus:ring-red-600 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">البريد الإلكتروني</label>
                    <input type="email" name="email" defaultValue={employee.email} className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none font-black text-white focus:ring-2 focus:ring-red-600 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">العنوان</label>
                    <input type="text" name="address" defaultValue={employee.address} className="w-full p-4 bg-slate-800 border border-white/5 rounded-2xl outline-none font-black text-white focus:ring-2 focus:ring-red-600 transition-all" />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl hover:bg-red-700 transition-all">حفظ التغييرات</button>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black hover:bg-slate-700 transition-all">إلغاء</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
