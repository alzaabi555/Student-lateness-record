import React, { useState, useMemo } from 'react';
import { LateRecord, AppSettings } from '../types';
import { Printer, CalendarDays, Calendar, Filter, Share2, User, Layers, Loader2 } from 'lucide-react';
import { Share } from '@capacitor/share';
import { generateAndSharePDF } from '../services/pdfService';

interface ReportsViewProps {
  records: LateRecord[];
  settings: AppSettings;
  onDeleteRecord: (id: string) => void;
}

type ReportType = 'DAILY' | 'MONTHLY' | 'CLASS' | 'STUDENT' | 'FREQUENT';

export const ReportsView: React.FC<ReportsViewProps> = ({ records, settings, onDeleteRecord }) => {
  const [reportType, setReportType] = useState<ReportType>('DAILY');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [minLates, setMinLates] = useState<number>(3);
  
  // New Filters for Class/Student
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  // --- Derived Lists for Dropdowns ---
  const availableGrades = useMemo(() => Array.from(new Set(records.map(r => r.grade))).sort(), [records]);
  const availableClasses = useMemo(() => {
    if (!selectedGrade) return [];
    return Array.from(new Set(records.filter(r => r.grade === selectedGrade).map(r => r.className))).sort();
  }, [records, selectedGrade]);

  // --- Main Filtering Logic ---
  const filteredRecords = useMemo(() => {
    if (reportType === 'FREQUENT') return [];

    let result = records;

    switch (reportType) {
      case 'DAILY':
        result = result.filter(r => r.dateString === selectedDate);
        break;
      case 'MONTHLY':
        result = result.filter(r => r.dateString.startsWith(selectedMonth));
        break;
      case 'CLASS':
        if (selectedGrade) result = result.filter(r => r.grade === selectedGrade);
        if (selectedClass) result = result.filter(r => r.className === selectedClass);
        break;
      case 'STUDENT':
        if (studentSearch.trim()) {
           result = result.filter(r => r.studentName.includes(studentSearch.trim()));
        } else {
           result = []; 
        }
        break;
    }

    // --- SORTING ---
    return result.sort((a, b) => {
      if (reportType === 'STUDENT') return b.timestamp - a.timestamp;
      if (reportType === 'CLASS') {
        if (a.className !== b.className) return a.className.localeCompare(b.className);
        return a.studentName.localeCompare(b.studentName);
      }
      if (a.grade !== b.grade) return a.grade.localeCompare(b.grade);
      if (a.className !== b.className) return a.className.localeCompare(b.className);
      return a.studentName.localeCompare(b.studentName);
    });
  }, [records, reportType, selectedDate, selectedMonth, selectedGrade, selectedClass, studentSearch]);

  const frequentStudents = useMemo(() => {
    if (reportType !== 'FREQUENT') return [];
    const stats: Record<string, { studentName: string, grade: string, className: string, count: number, dates: string[] }> = {};

    records.forEach(r => {
      const key = `${r.studentName}-${r.grade}-${r.className}`; 
      if (!stats[key]) stats[key] = { studentName: r.studentName, grade: r.grade, className: r.className, count: 0, dates: [] };
      stats[key].count += 1;
      if (!stats[key].dates.includes(r.dateString)) stats[key].dates.push(r.dateString);
    });

    return Object.values(stats).filter(s => s.count >= minLates).sort((a, b) => b.count - a.count);
  }, [records, reportType, minLates]);

  // --- PAGINATION LOGIC FOR PRINTING ---
  // This splits the long list into visual "pages" (arrays of records)
  // so we can render a Header on every page.
  const paginatedData = useMemo(() => {
    const data = reportType === 'FREQUENT' ? frequentStudents : filteredRecords;
    
    // Rows per page (Approximate fitting for A4 portrait with simplified header)
    // Increased to 22 rows since we removed the large Ministry logo
    const PAGE_SIZE = 22; 

    if (data.length === 0) return [];

    const pages = [];
    let currentData = [...data];

    while (currentData.length > 0) {
      pages.push(currentData.slice(0, PAGE_SIZE));
      currentData = currentData.slice(PAGE_SIZE);
    }
    return pages;
  }, [filteredRecords, frequentStudents, reportType]);

  const handlePdfExport = async () => {
    setIsGeneratingPdf(true);
    try {
      // Small delay to ensure DOM updates if any state changed
      await new Promise(resolve => setTimeout(resolve, 100));
      // 'printable-area-container' contains the .pdf-page elements
      await generateAndSharePDF('printable-area-container', getTitle());
    } catch (error) {
      alert('حدث خطأ أثناء إنشاء ملف PDF');
      console.error(error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareText = async () => {
    let text = `--- ${getTitle()} ---\n${settings.schoolName}\n\n`;
    const data = reportType === 'FREQUENT' ? frequentStudents : filteredRecords;
    
    if (data.length === 0) text += "لا توجد سجلات.\n";
    else {
      data.forEach((item: any, i) => {
        text += `${i+1}. ${item.studentName} | ${item.grade}\n`;
      });
    }
    text += `\n-------------------------\nالمشرف: ${settings.supervisorName}`;

    try {
      await Share.share({ title: getTitle(), text: text, dialogTitle: 'مشاركة التقرير' });
    } catch (error) { console.log(error); }
  };

  const getTitle = () => {
    if (reportType === 'DAILY') return `سجل المتأخرين اليومي (${selectedDate})`;
    if (reportType === 'MONTHLY') return `سجل المتأخرين الشهري (${selectedMonth})`;
    if (reportType === 'CLASS') return selectedGrade ? `تقرير ${selectedGrade} ${selectedClass ? '- ' + selectedClass : ''}` : 'تقرير الفصول';
    if (reportType === 'STUDENT') return `تقرير طالب: ${studentSearch}`;
    return `تقرير التكرار (أكثر من ${minLates})`;
  };

  return (
    <div className="p-4 pb-24 w-full">
      {/* Controls (Hidden in Print via CSS class 'no-print' if needed, but we use specific container capture) */}
      <div className="no-print space-y-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">التقارير</h2>
        
        {/* Toggle Tabs */}
        <div className="flex bg-gray-200 p-1 rounded-lg overflow-x-auto gap-1">
          {[
            { id: 'DAILY', label: 'يومي', icon: CalendarDays },
            { id: 'MONTHLY', label: 'شهري', icon: Calendar },
            { id: 'CLASS', label: 'تقرير الصف', icon: Layers },
            { id: 'STUDENT', label: 'تقرير الطالب', icon: User },
            { id: 'FREQUENT', label: 'التكرار', icon: Filter },
          ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setReportType(tab.id as ReportType)}
               className={`flex-1 py-2 px-2 text-xs md:text-sm font-bold rounded-md transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                 reportType === tab.id ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               <tab.icon size={14} />
               <span>{tab.label}</span>
             </button>
          ))}
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
           {reportType === 'DAILY' && (
            <div className="flex flex-col gap-2">
               <label className="text-xs text-gray-500 font-bold">التاريخ:</label>
               <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                   <CalendarDays size={18} className="text-gray-400" />
                   <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent w-full outline-none text-gray-800" />
              </div>
            </div>
          )}
          {reportType === 'MONTHLY' && (
            <div className="flex flex-col gap-2">
               <label className="text-xs text-gray-500 font-bold">الشهر:</label>
               <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                   <Calendar size={18} className="text-gray-400" />
                   <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent w-full outline-none text-gray-800" />
               </div>
            </div>
          )}
          {reportType === 'CLASS' && (
            <div className="flex gap-2">
               <div className="flex-1">
                  <label className="text-xs text-gray-500 font-bold mb-1 block">الصف الدراسي:</label>
                  <select value={selectedGrade} onChange={e => { setSelectedGrade(e.target.value); setSelectedClass(''); }} className="w-full p-2 border rounded-lg bg-gray-50">
                    <option value="">-- اختر الصف --</option>
                    {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
               </div>
               <div className="flex-1">
                  <label className="text-xs text-gray-500 font-bold mb-1 block">الشعبة / الفصل:</label>
                  <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50" disabled={!selectedGrade}>
                    <option value="">(طباعة كل الشعب)</option>
                    {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
            </div>
          )}
          {reportType === 'STUDENT' && (
            <div className="flex flex-col gap-2">
               <label className="text-xs text-gray-500 font-bold">اسم الطالب:</label>
               <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                   <User size={18} className="text-gray-400" />
                   <input type="text" placeholder="بحث..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="bg-transparent w-full outline-none text-gray-800" />
              </div>
            </div>
          )}
          {reportType === 'FREQUENT' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-bold">الحد الأدنى:</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                 <Filter size={18} className="text-gray-400" />
                 <input type="number" min="1" max="50" value={minLates} onChange={(e) => setMinLates(parseInt(e.target.value) || 1)} className="bg-transparent w-full outline-none text-gray-800" />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={handlePdfExport} disabled={isGeneratingPdf} className={`flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors font-bold shadow-sm ${isGeneratingPdf ? 'opacity-70 cursor-wait' : ''}`}>
              {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
              <span>{isGeneratingPdf ? 'جاري التجهيز...' : 'طباعة / مشاركة PDF'}</span>
            </button>
            <button onClick={handleShareText} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-bold shadow-sm">
              <Share2 size={18} />
              <span>مشاركة نص</span>
            </button>
          </div>
        </div>
      </div>

      {/* 
         PDF GENERATION CONTAINER 
         This container holds the visual "Pages". 
         We map through `paginatedData` and create a `div.pdf-page` for each chunk.
         The pdfService iterates these divs and snapshots them.
      */}
      <div id="printable-area-container" className="bg-gray-100 p-2 md:p-0">
        
        {paginatedData.length === 0 ? (
           <div className="bg-white p-10 text-center text-gray-400 rounded shadow">لا توجد بيانات للعرض</div>
        ) : (
           paginatedData.map((pageRecords, pageIndex) => {
             // Calculate row number offset
             let startingIndex = 0;
             for (let k = 0; k < pageIndex; k++) {
               startingIndex += paginatedData[k].length;
             }

             const isLastPage = pageIndex === paginatedData.length - 1;
             
             // A4 Aspect Ratio container
             return (
               <div 
                 key={pageIndex} 
                 className="pdf-page bg-white p-6 mb-8 mx-auto shadow-lg border border-gray-300 relative"
                 style={{ 
                   width: '100%', 
                   maxWidth: '210mm', 
                   aspectRatio: '210/297', // Forces A4 ratio
                   margin: '0 auto 20px auto',
                   display: 'flex',
                   flexDirection: 'column'
                 }}
               >
                 {/* 
                    HEADER (Repeated on every page) 
                    Simplified: School Name (Right), Date (Left), Title (Center)
                 */}
                 <div className="w-full border-b-2 border-black pb-2 mb-2" style={{ borderColor: 'black' }}>
                    <div className="flex justify-between items-end mb-2">
                        <div className="text-right">
                           {/* School Name */}
                           <h2 className="font-bold text-black text-lg">{settings.schoolName}</h2>
                        </div>
                        <div className="text-left">
                           {/* Date */}
                           <div className="text-xs font-bold text-black flex flex-col items-end">
                              <span>{new Date().toLocaleDateString('ar-SA', { weekday: 'long' })}</span>
                              <span className="font-mono" dir="ltr">{new Date().toLocaleDateString('en-GB')}</span>
                           </div>
                        </div>
                    </div>
                    {/* Report Title */}
                    <div className="text-center">
                        <h1 className="inline-block text-xl font-extrabold text-black leading-tight bg-gray-50 px-6 py-1 rounded border border-gray-300">
                           {getTitle()}
                        </h1>
                    </div>
                 </div>

                 {/* TABLE BODY */}
                 <div className="flex-1">
                   <table className="w-full border-collapse text-xs" dir="rtl">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-1.5 text-center w-10 font-bold text-black">#</th>
                        {(reportType !== 'FREQUENT') && <th className="border border-black p-1.5 text-center w-20 font-bold text-black">التاريخ</th>}
                        <th className="border border-black p-1.5 text-right font-bold text-black px-2">الاسم الثلاثي</th>
                        <th className="border border-black p-1.5 text-center w-20 font-bold text-black">الصف</th>
                        {reportType === 'FREQUENT' && <th className="border border-black p-1.5 text-center w-12 font-bold text-black">العدد</th>}
                        {reportType !== 'FREQUENT' && <th className="border border-black p-1.5 text-center w-12 font-bold text-black">ف</th>}
                        {reportType !== 'FREQUENT' && <th className="border border-black p-1.5 text-center w-16 font-bold text-black">الوقت</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pageRecords.map((record: any, idx: number) => (
                        <tr key={idx} className="h-8">
                          <td className="border border-black p-1 text-center font-bold text-black">{startingIndex + idx + 1}</td>
                          
                          {(reportType !== 'FREQUENT') && (
                             <td className="border border-black p-1 text-center whitespace-nowrap text-black">{record.dateString}</td>
                          )}

                          <td className="border border-black p-1 px-2 font-medium text-black text-right truncate max-w-[150px]">{record.studentName}</td>
                          <td className="border border-black p-1 text-center text-black">{record.grade} {record.className ? `- ${record.className}` : ''}</td>
                          
                          {reportType === 'FREQUENT' && (
                            <td className="border border-black p-1 text-center font-bold text-black bg-red-50">{record.count}</td>
                          )}

                          {reportType !== 'FREQUENT' && (
                            <>
                              <td className="border border-black p-1 text-center font-bold text-black">{record.className}</td>
                              <td className="border border-black p-1 text-center font-mono text-black">{record.arrivalTime}</td>
                            </>
                          )}
                        </tr>
                      ))}
                      
                      {/* Fill empty space on LAST page only to look neat (optional) */}
                      {isLastPage && pageRecords.length < 5 && Array.from({length: 5 - pageRecords.length}).map((_, i) => (
                         <tr key={`empty-${i}`} className="h-8">
                           <td className="border border-black p-1"></td>
                           {(reportType !== 'FREQUENT') && <td className="border border-black p-1"></td>}
                           <td className="border border-black p-1"></td>
                           <td className="border border-black p-1"></td>
                           {reportType === 'FREQUENT' && <td className="border border-black p-1"></td>}
                           {reportType !== 'FREQUENT' && <td className="border border-black p-1"></td>}
                           {reportType !== 'FREQUENT' && <td className="border border-black p-1"></td>}
                         </tr>
                      ))}
                    </tbody>
                   </table>
                 </div>

                 {/* FOOTER - Signatures (Only on Last Page) */}
                 {isLastPage ? (
                   <div className="mt-auto pt-4 flex justify-between items-end">
                      <div className="text-center w-1/3">
                        <p className="font-bold mb-6 text-black text-sm">مشرف السجل</p>
                        <p className="text-black text-sm">{settings.supervisorName}</p>
                      </div>
                      <div className="text-center w-1/3">
                        <p className="font-bold mb-6 text-black text-sm">مدير المدرسة</p>
                        <p className="text-black text-sm">{settings.managerName}</p>
                      </div>
                   </div>
                 ) : (
                   <div className="mt-auto h-8 text-center text-[10px] text-gray-400">
                      (يتبع في الصفحة التالية)
                   </div>
                 )}
               </div>
             );
           })
        )}
      </div>
    </div>
  );
};