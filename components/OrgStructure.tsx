
import React, { useState } from 'react';
import { useApp } from '../store';
import { 
  Building2, 
  Network, 
  Briefcase, 
  Users2, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  MoreVertical,
  MapPin,
  Phone,
  UserCheck,
  Calendar,
  DollarSign,
  ArrowLeftRight,
  Filter,
  Layers,
  LayoutGrid,
  Mail,
  Smartphone,
  X,
  AlertTriangle,
  FileText,
  BadgeInfo,
  CreditCard
} from 'lucide-react';
import { Department, Employee, Branch, JobTitle, JobType } from '../types';

export const OrgStructure: React.FC = () => {
  const { 
    branches, departments, jobTitles, jobTypes, employees,
    addBranch, addDepartment, addJobTitle, addJobType, addEmployee,
    updateBranch, updateDepartment, updateJobTitle, updateJobType, updateEmployee,
    deleteBranch, deleteDepartment, deleteJobTitle, deleteJobType, deleteEmployee
  } = useApp();

  const [activeTab, setActiveTab] = useState<'branches' | 'departments' | 'jobs' | 'employees'>('branches');
  const [expandedDepts, setExpandedDepts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalType, setModalType] = useState<'BRANCH' | 'DEPT' | 'JOB_TITLE' | 'JOB_TYPE' | 'EMP' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const toggleDept = (id: string) => {
    setExpandedDepts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const buildDeptTree = (parentId?: string) => departments.filter(d => d.parentId === parentId);

  const ModalContainer: React.FC<{ title: string; children: React.ReactNode; onSave: () => void }> = ({ title, children, onSave }) => (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={() => { setModalType(null); setEditingId(null); }}></div>
      <div className="relative bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] border border-white/5">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-2xl font-black text-white tracking-tight">{title}</h3>
          <button onClick={() => { setModalType(null); setEditingId(null); }} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all text-slate-400"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-slate-950/30">
          {children}
        </div>
        <div className="p-8 bg-slate-900 border-t border-white/5 flex gap-4">
          <button onClick={() => { setModalType(null); setEditingId(null); }} className="flex-1 py-4.5 bg-slate-800 text-slate-300 rounded-2xl font-black hover:bg-slate-700 transition-all border border-white/5">إلغاء الأمر</button>
          <button onClick={onSave} className="flex-1 py-4.5 bg-red-600 text-white rounded-2xl font-black shadow-2xl shadow-red-900/30 active:scale-95 transition-all">حفظ البيانات</button>
        </div>
      </div>
    </div>
  );

  const renderDeptItem = (dept: Department, level: number = 0) => {
    const children = buildDeptTree(dept.id);
    const isExpanded = expandedDepts.includes(dept.id);
    const deptEmployees = employees.filter(e => e.departmentId === dept.id);

    return (
      <div key={dept.id} className="space-y-3">
        <div 
          className={`flex items-center justify-between p-5 rounded-[1.8rem] border transition-all ${
            level === 0 ? 'bg-slate-900 shadow-xl border-white/5' : 'bg-slate-900/40 border-white/5'
          } group hover:border-red-600/40`}
          style={{ marginRight: `${level * 2.5}rem` }}
        >
          <div className="flex items-center gap-5">
            <button 
              onClick={() => toggleDept(dept.id)}
              className={`p-2 rounded-xl transition-all ${children.length > 0 ? 'bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white shadow-lg' : 'opacity-0 cursor-default'}`}
            >
              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} className="rotate-180" />}
            </button>
            <div className="w-12 h-12 bg-red-600/10 text-red-500 rounded-[1.2rem] flex items-center justify-center shadow-inner">
              <Network size={24} />
            </div>
            <div>
              <h4 className="font-black text-white text-base">{dept.name}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{deptEmployees.length} موظف نشط</p>
            </div>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={() => { setEditingId(dept.id); setModalType('DEPT'); }} className="p-3 bg-slate-800 text-slate-400 hover:text-blue-400 rounded-[1.2rem] transition-all"><Edit3 size={18} /></button>
            <button 
              onClick={() => {
                if (deptEmployees.length > 0 || children.length > 0) {
                  alert("لا يمكن حذف قسم يحتوي على موظفين أو أقسام فرعية!");
                  return;
                }
                if (confirm("هل أنت متأكد من حذف هذا القسم؟")) deleteDepartment(dept.id);
              }}
              className="p-3 bg-slate-800 text-slate-400 hover:text-red-500 rounded-[1.2rem] transition-all"
            ><Trash2 size={18} /></button>
          </div>
        </div>
        {isExpanded && children.length > 0 && (
          <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
            {children.map(child => renderDeptItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderDepartments = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-white">شجرة الهيكل الإداري</h3>
          <p className="text-sm text-slate-500 font-bold mt-1">عرض وتنظيم الأقسام بتسلسل هرمي ذكي</p>
        </div>
        <button onClick={() => setModalType('DEPT')} className="bg-red-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm shadow-2xl shadow-red-900/30 flex items-center gap-3 active:scale-95 transition-all">
          <Plus size={20}/> إضافة قسم جديد
        </button>
      </div>
      <div className="space-y-4">
        {departments.filter(d => !d.parentId).map(dept => renderDeptItem(dept))}
        {departments.length === 0 && (
          <div className="bg-slate-900 p-24 rounded-[3.5rem] text-center border border-white/5 shadow-2xl">
            <Layers size={64} className="text-slate-800 mx-auto mb-6" />
            <p className="text-slate-600 font-black text-lg">لم يتم إنشاء أقسام بعد</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderBranches = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {branches.map(branch => (
        <div key={branch.id} className="bg-slate-900 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl hover:border-red-600/30 transition-all group relative overflow-hidden">
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-red-600/5 rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="w-16 h-16 bg-red-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-red-900/30">
              <Building2 size={32} />
            </div>
            <div className="flex gap-2">
               <button onClick={() => { setEditingId(branch.id); setModalType('BRANCH'); }} className="p-3 bg-slate-800 text-slate-500 hover:text-white rounded-2xl transition-all"><Edit3 size={20}/></button>
               <button onClick={() => {
                 if (employees.some(e => e.branchId === branch.id)) {
                   alert("لا يمكن حذف فرع يحتوي على موظفين مسجلين!");
                   return;
                 }
                 if(confirm("حذف هذا الفرع؟")) deleteBranch(branch.id);
               }} className="p-3 bg-slate-800 text-slate-500 hover:text-red-500 rounded-2xl transition-all"><Trash2 size={20}/></button>
            </div>
          </div>
          <h3 className="text-2xl font-black text-white mb-3 relative z-10">{branch.name}</h3>
          <div className="space-y-4 mb-10 relative z-10">
            <div className="flex items-center gap-4 text-slate-500">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-red-500"><MapPin size={16} /></div>
              <span className="text-sm font-bold truncate">{branch.address}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-red-500"><Phone size={16} /></div>
              <span className="text-sm font-bold">{branch.phone}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-white/5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">فرع نشط</span>
            </div>
            <div className="bg-slate-800 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-300">
              {employees.filter(e => e.branchId === branch.id).length} موظف
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => setModalType('BRANCH')} className="bg-slate-900/40 border-2 border-dashed border-white/10 rounded-[3.5rem] p-12 flex flex-col items-center justify-center gap-5 text-slate-600 hover:bg-slate-900 hover:border-red-600/40 hover:text-red-500 transition-all group shadow-inner">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform"><Plus size={40} /></div>
        <span className="font-black text-sm uppercase tracking-widest">إضافة فرع تشغيلي جديد</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-24 text-slate-100">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">هيكل المؤسسة الذكي</h2>
          <p className="text-slate-500 font-bold mt-2">التحكم المركزي في الموارد البشرية والانتشار الجغرافي</p>
        </div>
        <div className="flex bg-slate-900 p-2 rounded-[1.8rem] shadow-2xl border border-white/5 overflow-x-auto scrollbar-hide">
           {[
             { id: 'branches', label: 'الفروع', icon: Building2 },
             { id: 'departments', label: 'الأقسام', icon: Layers },
             { id: 'jobs', label: 'المسميات', icon: Briefcase },
             { id: 'employees', label: 'الموظفين', icon: Users2 }
           ].map(t => (
             <button 
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === t.id ? 'bg-red-600 text-white shadow-xl shadow-red-900/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-100'}`}
             >
               <t.icon size={20}/> {t.label}
             </button>
           ))}
        </div>
      </header>

      <div className="relative">
        {activeTab === 'branches' && renderBranches()}
        {activeTab === 'departments' && renderDepartments()}
        {/* Jobs and Employees components would similarly be dark-themed */}
        {activeTab === 'employees' && (
          <div className="bg-slate-900 p-24 rounded-[3.5rem] text-center border border-white/5 shadow-2xl">
            <Users2 size={64} className="text-slate-800 mx-auto mb-6" />
            <p className="text-slate-600 font-black text-lg">قائمة الموظفين متاحة في لوحة الـ HR</p>
          </div>
        )}
      </div>

      {modalType === 'BRANCH' && (
        <ModalContainer title={editingId ? 'تحديث بيانات الفرع' : 'تأسيس فرع جديد'} onSave={() => { setModalType(null); setEditingId(null); }}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">اسم الفرع التشغيلي</label>
              <input type="text" className="w-full p-5 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 text-white font-bold" placeholder="مثلاً: فرع الميناء الرئيسي"/>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">الموقع الجغرافي</label>
              <input type="text" className="w-full p-5 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 text-white font-bold" placeholder="المدينة، الشارع..."/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">رقم الاتصال</label>
                <input type="text" className="w-full p-5 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 text-white font-bold" placeholder="059..."/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">سعة استيعاب الفرع</label>
                <input type="number" className="w-full p-5 bg-slate-800 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 text-white font-bold" placeholder="عدد الطاولات"/>
              </div>
            </div>
          </div>
        </ModalContainer>
      )}
    </div>
  );
};
