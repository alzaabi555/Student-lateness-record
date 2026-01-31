import React, { useMemo } from 'react';
import { AppSettings, LateRecord, Student } from '../types';
import { Clock, Users, AlertCircle, AlertTriangle } from 'lucide-react';
import { LateTable } from './LateTable';

interface HomeViewProps {
  settings: AppSettings;
  students: Student[];
  records: LateRecord[];
  onRemoveRecord: (id: string) => void;
  onUpdateRecord: (id: string, updates: Partial<LateRecord>) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ settings, students, records, onRemoveRecord, onUpdateRecord }) => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const todayRecords = records.filter(r => r.dateString === today);
  
  const dateObj = new Date();
  const dayName = dateObj.toLocaleDateString('ar-SA', { weekday: 'long' });
  const formattedDate = dateObj.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  // Logic for Frequent Latecomers (Top 5 with >= 3 lates)
  const frequentLatecomers = useMemo(() => {
    const stats: Record<string, { name: string, grade: string, className: string, count: number }> = {};
    
    records.forEach(r => {
      // Use studentId to group uniquely
      if (!stats[r.studentId]) {
        stats[r.studentId] = { 
          name: r.studentName, 
          grade: r.grade, 
          className: r.className, 
          count: 0 
        };
      }
      stats[r.studentId].count += 1;
    });

    // Filter >= 3 and sort descending
    return Object.values(stats)
      .filter(s => s.count >= 3)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [records]);

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header Card */}
      <div className="bg-gradient-to-l from-primary to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 pointer-events-none"></div>

        <div className="flex flex-row items-center gap-4 relative z-10">
           {/* Logo - Right Side (Start) */}
           {settings.logoDataUrl && (
             <div className="shrink-0">
               <img 
                 src={settings.logoDataUrl} 
                 alt="School Logo" 
                 className="w-20 h-20 md:w-24 md:h-24 object-contain bg-white rounded-full p-1 shadow-lg border-2 border-white/30"
               />
             </div>
           )}

           {/* Text Content - Flexible width */}
           <div className={`flex-1 text-center ${settings.logoDataUrl ? 'md:text-right md:pr-4' : ''}`}>
             <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">سجل المتأخرين اليومي</h1>
             <h2 className="text-lg md:text-xl font-medium opacity-90 mb-4">{settings.schoolName}</h2>
             
             <div className="flex flex-wrap justify-center md:justify-start gap-2 text-xs md:text-sm">
                <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  {dayName}، {formattedDate}
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                   المشرف: {settings.supervisorName}
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-blue-100 p-3 rounded-full mb-3 text-primary">
            <Users size={24} />
          </div>
          <span className="text-gray-500 text-sm">إجمالي الطلاب</span>
          <span className="text-2xl font-bold text-gray-800">{students.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-3 text-red-600">
            <AlertCircle size={24} />
          </div>
          <span className="text-gray-500 text-sm">متأخرين اليوم</span>
          <span className="text-2xl font-bold text-red-600">{todayRecords.length}</span>
        </div>
      </div>

      {/* Frequent Latecomers Warning Box */}
      {frequentLatecomers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden animate-fade-in">
          <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
            <h3 className="font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-600" />
              تنبيه: الأكثر تكراراً
            </h3>
            <span className="text-[10px] bg-red-200 text-red-900 px-2 py-1 rounded-full font-bold">
              إجراء مطلوب
            </span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {frequentLatecomers.map((student, idx) => (
              <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{student.grade} - {student.className}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center bg-white border border-red-100 px-3 py-1 rounded-lg shadow-sm min-w-[60px]">
                   <span className="block font-bold text-red-600 text-lg leading-none">{student.count}</span>
                   <span className="text-[10px] text-gray-400">مرات</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TODAY'S TABLE - ACTION CENTER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
           <Clock size={20} className="text-primary"/>
           <h3 className="font-bold text-gray-800">قائمة المتأخرين اليوم ({todayRecords.length})</h3>
        </div>
        {todayRecords.length > 0 ? (
           <LateTable 
             records={todayRecords} 
             onRemove={onRemoveRecord} 
             onUpdateRecord={onUpdateRecord}
             managerName={settings.managerName}
           />
        ) : (
          <div className="p-8 text-center text-gray-400">
            لم يتم تسجيل أي تأخير اليوم
          </div>
        )}
      </div>
    </div>
  );
};