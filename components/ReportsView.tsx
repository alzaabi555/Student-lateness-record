import React, { useState } from 'react';
import { LateRecord, AppSettings } from '../types';
import { Printer, CalendarDays, Calendar, Trash2 } from 'lucide-react';

interface ReportsViewProps {
  records: LateRecord[];
  settings: AppSettings;
  onDeleteRecord: (id: string) => void;
}

type ReportType = 'DAILY' | 'MONTHLY';

export const ReportsView: React.FC<ReportsViewProps> = ({ records, settings, onDeleteRecord }) => {
  const [reportType, setReportType] = useState<ReportType>('DAILY');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Filter Logic
  const filteredRecords = records.filter(r => {
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

  const handlePrint = () => {
    window.print();
  };

  const getTitle = () => {
    if (reportType === 'DAILY') return `سجل المتأخرين اليومي (${selectedDate})`;
    return `سجل المتأخرين الشهري (${selectedMonth})`;
  };

  return (
    <div className="p-4 pb-24 w-full">
      {/* Controls - Hidden on Print */}
      <div className="no-print space-y-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">التقارير</h2>
        
        {/* Toggle Tabs */}
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            onClick={() => setReportType('DAILY')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
              reportType === 'DAILY' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            تقرير يومي
          </button>
          <button
            onClick={() => setReportType('MONTHLY')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
              reportType === 'MONTHLY' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            تقرير شهري
          </button>
        </div>

        {/* Filters - Stacked for Mobile */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
          <div className="flex flex-col gap-2">
             <label className="text-xs text-gray-500 font-bold">التاريخ:</label>
             <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
               {reportType === 'DAILY' ? (
                 <>
                   <CalendarDays size={18} className="text-gray-400" />
                   <input 
                     type="date" 
                     value={selectedDate} 
                     onChange={(e) => setSelectedDate(e.target.value)}
                     className="bg-transparent w-full outline-none text-gray-800"
                   />
                 </>
               ) : (
                 <>
                   <Calendar size={18} className="text-gray-400" />
                   <input 
                     type="month" 
                     value={selectedMonth} 
                     onChange={(e) => setSelectedMonth(e.target.value)}
                     className="bg-transparent w-full outline-none text-gray-800"
                   />
                 </>
               )}
            </div>
          </div>

          <button 
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors font-bold shadow-sm"
          >
            <Printer size={18} />
            <span>طباعة التقرير (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white print:shadow-none print:w-full">
        
        {/* Print Header - Visible mainly on Print */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
          <div className="flex justify-between items-center px-4 mb-2 print:flex hidden">
             <div className="text-right">
                <p className="font-bold">سلطنة عمان</p>
                <p>وزارة التربية والتعليم</p>
             </div>
             {settings.logoDataUrl && (
               <img src={settings.logoDataUrl} alt="Logo" className="h-20 object-contain" />
             )}
             <div className="text-left">
                <p>{new Date().toLocaleDateString('ar-SA')}</p>
             </div>
          </div>
          
          <h1 className="text-lg md:text-2xl font-bold mb-1 text-gray-900 leading-tight">{getTitle()}</h1>
          <h2 className="text-base font-medium text-gray-700">{settings.schoolName}</h2>
          <p className="text-xs text-gray-500 mt-1 no-print">عدد السجلات: {filteredRecords.length}</p>
        </div>

        {/* Table - Optimized for Print */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200">
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
                  <tr key={record.id} className="hover:bg-gray-50 print:hover:bg-transparent">
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

        {/* Print Footer */}
        <div className="mt-10 flex justify-between items-end print:flex hidden text-sm pt-8">
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