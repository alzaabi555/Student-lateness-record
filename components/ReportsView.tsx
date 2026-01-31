import React, { useState, useMemo } from 'react';
import { LateRecord, AppSettings } from '../types.ts';
import { Printer, CalendarDays, Calendar, Trash2, Filter } from 'lucide-react';

interface ReportsViewProps {
  records: LateRecord[];
  settings: AppSettings;
  onDeleteRecord: (id: string) => void;
}

type ReportType = 'DAILY' | 'MONTHLY' | 'FREQUENT';

export const ReportsView: React.FC<ReportsViewProps> = ({ records, settings, onDeleteRecord }) => {
  const [reportType, setReportType] = useState<ReportType>('DAILY');
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [minLates, setMinLates] = useState<number>(3); // Minimum lates to show in frequent report

  // --- Logic for Daily/Monthly ---
  const filteredRecords = useMemo(() => {
    if (reportType === 'FREQUENT') return []; // Handled separately

    return records.filter(r => {
      if (reportType === 'DAILY') {
        return r.dateString === selectedDate;
      } else {
        return r.dateString.startsWith(selectedMonth);
      }
    }).sort((a, b) => {
      // Sort by Grade, then Class, then Name
      if (a.grade !== b.grade) return a.grade.localeCompare(b.grade);
      if (a.className !== b.className) return a.className.localeCompare(b.className);
      return a.studentName.localeCompare(b.studentName);
    });
  }, [records, reportType, selectedDate, selectedMonth]);

  // --- Logic for Frequent Latecomers ---
  const frequentStudents = useMemo(() => {
    if (reportType !== 'FREQUENT') return [];

    const stats: Record<string, { 
      studentName: string, 
      grade: string, 
      className: string, 
      count: number,
      dates: string[] 
    }> = {};

    records.forEach(r => {
      const key = `${r.studentName}-${r.grade}-${r.className}`; // Group by unique student details
      if (!stats[key]) {
        stats[key] = {
          studentName: r.studentName,
          grade: r.grade,
          className: r.className,
          count: 0,
          dates: []
        };
      }
      stats[key].count += 1;
      // Store date if not already present
      if (!stats[key].dates.includes(r.dateString)) {
        stats[key].dates.push(r.dateString);
      }
    });

    return Object.values(stats)
      .filter(s => s.count >= minLates)
      .sort((a, b) => b.count - a.count); // Descending order
  }, [records, reportType, minLates]);


  const handlePrint = () => {
    window.print();
  };

  const getTitle = () => {
    if (reportType === 'DAILY') return `سجل المتأخرين اليومي (${selectedDate})`;
    if (reportType === 'MONTHLY') return `سجل المتأخرين الشهري (${selectedMonth})`;
    return `تقرير تكرار التأخر (أكثر من ${minLates} مرات)`;
  };

  return (
    <div className="p-4 pb-24 w-full">
      {/* Controls - Hidden on Print */}
      <div className="no-print space-y-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">التقارير</h2>
        
        {/* Toggle Tabs */}
        <div className="flex bg-gray-200 p-1 rounded-lg overflow-x-auto">
          <button
            onClick={() => setReportType('DAILY')}
            className={`flex-1 py-2 px-1 text-xs md:text-sm font-bold rounded-md transition-all whitespace-nowrap ${
              reportType === 'DAILY' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            يومي
          </button>
          <button
            onClick={() => setReportType('MONTHLY')}
            className={`flex-1 py-2 px-1 text-xs md:text-sm font-bold rounded-md transition-all whitespace-nowrap ${
              reportType === 'MONTHLY' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            شهري
          </button>
          <button
            onClick={() => setReportType('FREQUENT')}
            className={`flex-1 py-2 px-1 text-xs md:text-sm font-bold rounded-md transition-all whitespace-nowrap ${
              reportType === 'FREQUENT' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            الأكثر تكراراً
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
          
          {/* Daily Filter */}
          {reportType === 'DAILY' && (
            <div className="flex flex-col gap-2">
               <label className="text-xs text-gray-500 font-bold">التاريخ:</label>
               <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                   <CalendarDays size={18} className="text-gray-400" />
                   <input 
                     type="date" 
                     value={selectedDate} 
                     onChange={(e) => setSelectedDate(e.target.value)}
                     className="bg-transparent w-full outline-none text-gray-800"
                   />
              </div>
            </div>
          )}

          {/* Monthly Filter */}
          {reportType === 'MONTHLY' && (
            <div className="flex flex-col gap-2">
               <label className="text-xs text-gray-500 font-bold">الشهر:</label>
               <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                   <Calendar size={18} className="text-gray-400" />
                   <input 
                     type="month" 
                     value={selectedMonth} 
                     onChange={(e) => setSelectedMonth(e.target.value)}
                     className="bg-transparent w-full outline-none text-gray-800"
                   />
               </div>
            </div>
          )}

          {/* Frequent Filter */}
          {reportType === 'FREQUENT' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-bold">الحد الأدنى لعدد مرات التأخر:</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                 <Filter size={18} className="text-gray-400" />
                 <input 
                   type="number" 
                   min="1"
                   max="50"
                   value={minLates} 
                   onChange={(e) => setMinLates(parseInt(e.target.value) || 1)}
                   className="bg-transparent w-full outline-none text-gray-800"
                 />
              </div>
            </div>
          )}

          <button 
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors font-bold shadow-sm"
          >
            <Printer size={18} />
            <span>طباعة التقرير (A4)</span>
          </button>
        </div>
      </div>

      <div id="printable-area" className="bg-white">
        
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
          <div className="flex justify-between items-center px-4 mb-2">
             <div className="text-right">
                <p className="font-bold">سلطنة عمان</p>
                <p>وزارة التربية والتعليم</p>
             </div>
             {settings.logoDataUrl && (
               <img src={settings.logoDataUrl} alt="Logo" className="h-20 object-contain mx-auto" />
             )}
             <div className="text-left">
                <p className="font-mono" dir="ltr">{new Date().toLocaleDateString('en-GB')}</p>
             </div>
          </div>
          
          <h1 className="text-lg md:text-2xl font-bold mb-1 text-gray-900 leading-tight">{getTitle()}</h1>
          <h2 className="text-base font-medium text-gray-700">{settings.schoolName}</h2>
        </div>

        {reportType === 'FREQUENT' ? (
          <div className="w-full">
            <table className="w-full border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-center w-10">#</th>
                  <th className="border border-gray-400 p-2 text-right">الاسم الثلاثي</th>
                  <th className="border border-gray-400 p-2 text-center w-24">الصف/الفصل</th>
                  <th className="border border-gray-400 p-2 text-center w-16 bg-red-50">عدد مرات التأخر</th>
                  <th className="border border-gray-400 p-2 text-right">تواريخ التأخر</th>
                </tr>
              </thead>
              <tbody>
                {frequentStudents.length > 0 ? (
                  frequentStudents.map((student, index) => (
                    <tr key={index}>
                      <td className="border border-gray-400 p-2 text-center font-bold">{index + 1}</td>
                      <td className="border border-gray-400 p-2 font-medium">{student.studentName}</td>
                      <td className="border border-gray-400 p-2 text-center">{student.grade} - {student.className}</td>
                      <td className="border border-gray-400 p-2 text-center font-bold text-red-700 bg-red-50">{student.count}</td>
                      <td className="border border-gray-400 p-2 text-xs text-gray-600 leading-relaxed break-words whitespace-normal">
                        {student.dates.join('، ')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400 border border-gray-400">
                      لا يوجد طلاب متأخرين أكثر من {minLates} مرات.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-center w-10">#</th>
                  {reportType === 'MONTHLY' && <th className="border border-gray-400 p-2 text-center w-24">التاريخ</th>}
                  <th className="border border-gray-400 p-2 text-right">الاسم الثلاثي</th>
                  <th className="border border-gray-400 p-2 text-center w-20">الصف</th>
                  <th className="border border-gray-400 p-2 text-center w-12">ف</th>
                  <th className="border border-gray-400 p-2 text-center w-12 no-print">حذف</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => (
                    <tr key={record.id}>
                      <td className="border border-gray-400 p-2 text-center">{index + 1}</td>
                      {reportType === 'MONTHLY' && <td className="border border-gray-400 p-2 text-center whitespace-nowrap">{record.dateString}</td>}
                      <td className="border border-gray-400 p-2 font-medium">{record.studentName}</td>
                      <td className="border border-gray-400 p-2 text-center">{record.grade}</td>
                      <td className="border border-gray-400 p-2 text-center">{record.className}</td>
                      <td className="border border-gray-400 p-2 text-center no-print">
                        <button 
                          onClick={() => onDeleteRecord(record.id)}
                          className="text-red-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 border border-gray-400">
                      لا توجد سجلات للعرض
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-10 flex justify-between items-end pt-8">
           <div className="text-center w-1/3">
             <p className="font-bold mb-8">مشرف السجل</p>
             <p className="text-gray-800">{settings.supervisorName}</p>
           </div>
           <div className="text-center w-1/3">
             <p className="font-bold mb-8">مدير المدرسة</p>
             <p className="text-gray-800">{settings.managerName}</p>
           </div>
        </div>
      </div>
    </div>
  );
};