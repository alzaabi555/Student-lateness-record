import React from 'react';
import { AppSettings, LateRecord, Student } from '../types';
import { Clock, Calendar, Users, AlertCircle } from 'lucide-react';

interface HomeViewProps {
  settings: AppSettings;
  students: Student[];
  records: LateRecord[];
}

export const HomeView: React.FC<HomeViewProps> = ({ settings, students, records }) => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const todayRecords = records.filter(r => r.dateString === today);
  
  const dateObj = new Date();
  const dayName = dateObj.toLocaleDateString('ar-SA', { weekday: 'long' });
  const formattedDate = dateObj.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header Card */}
      <div className="fixed md:sticky top-0 z-40 md:z-30 bg-[#1e3a8a] text-white shadow-lg px-4 pt-[env(safe-area-inset-top)] pb-6 transition-all duration-300 rounded-b-[2.5rem] md:rounded-none md:shadow-md w-full md:w-auto left-0 right-0 md:left-auto md:right-auto">
        
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

      {/* Quick Action Hint */}
      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
        <Clock className="text-orange-500 mt-1" size={20} />
        <div>
          <h3 className="font-bold text-orange-800">تذكير</h3>
          <p className="text-sm text-orange-700 leading-relaxed">
            يرجى التأكد من تسجيل المتأخرين قبل الحصة الأولى لضمان دقة التقارير.
          </p>
        </div>
      </div>
    </div>
  );
};
