import React from 'react';
import { LateRecord, ActionType } from '../types';
import { Trash2, MessageCircle, Clock, CheckSquare, Square, AlertCircle } from 'lucide-react';

interface LateTableProps {
  records: LateRecord[];
  onRemove: (id: string) => void;
  onUpdateRecord: (id: string, updates: Partial<LateRecord>) => void;
  managerName: string;
}

export const LateTable: React.FC<LateTableProps> = ({ records, onRemove, onUpdateRecord, managerName }) => {
  // Ensure we always show at least 20 rows to match the paper style
  const emptyRowsCount = Math.max(0, 20 - records.length);
  const emptyRows = Array.from({ length: emptyRowsCount });

  const getActionLabel = (action?: ActionType) => {
    switch (action) {
      case 'WARNING': return 'تنبيه شفوي';
      case 'PLEDGE': return 'تعهد خطي';
      case 'CALL': return 'اتصال بالولي';
      case 'SUMMON': return 'استدعاء ولي أمر';
      case 'COUNCIL': return 'مجلس نظام';
      default: return '-';
    }
  };

  const handleWhatsApp = (record: LateRecord) => {
    if (!record.phone) {
      alert(`عفواً، لا يوجد رقم هاتف مسجل للطالب: ${record.studentName}\nيرجى تحديث بيانات الطالب من قائمة "الطلاب".`);
      return;
    }

    // --- منطق تحسين رقم الهاتف ---
    let phone = record.phone.replace(/\D/g, '');

    if (phone.length === 8 && (phone.startsWith('9') || phone.startsWith('7'))) {
        phone = '968' + phone;
    }
    else if (phone.startsWith('00')) {
        phone = phone.substring(2);
    }
    else if (phone.startsWith('0')) {
        phone = phone.substring(1); 
    }

    const msg = `السلام عليكم ولي أمر الطالب/ة (${record.studentName}) المحترم،\nنود إشعاركم بتأخر ابنكم عن الطابور الصباحي اليوم ${record.dateString} (${record.arrivalTime}).\nنرجو التنبيه عليه بالالتزام بالوقت المحدد.\nإدارة المدرسة`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto border-2 border-gray-800 rounded-sm">
        <table className="w-full min-w-[700px] border-collapse bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-600 p-2 w-10 text-center font-bold text-gray-800">م</th>
              <th className="border border-gray-600 p-2 text-right font-bold text-gray-800">اسم الطالب</th>
              <th className="border border-gray-600 p-2 w-24 text-center font-bold text-gray-800">الصف</th>
              <th className="border border-gray-600 p-2 w-20 text-center font-bold text-gray-800">الوقت</th>
              <th className="border border-gray-600 p-2 w-16 text-center font-bold text-gray-800">بعذر؟</th>
              <th className="border border-gray-600 p-2 w-40 text-center font-bold text-gray-800">الإجراء المتخذ</th>
              <th className="border border-gray-600 p-2 w-12 text-center font-bold text-gray-800 no-print">تواصل</th>
              <th className="border border-gray-600 p-2 w-10 text-center font-bold text-gray-800 no-print">حذف</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.id} className={`hover:bg-gray-50 h-12 ${record.isExcused ? 'bg-green-50' : ''}`}>
                <td className="border border-gray-400 text-center font-medium">{index + 1}</td>
                
                <td className="border border-gray-400 px-3 text-gray-900 font-medium">
                  {record.studentName}
                  {record.phone && <span className="block text-[10px] text-gray-400 font-mono tracking-wider print:hidden">{record.phone}</span>}
                </td>
                
                <td className="border border-gray-400 text-center text-gray-700 text-sm">
                  {record.grade} ({record.className})
                </td>
                
                <td className="border border-gray-400 text-center">
                  <input
                    type="time"
                    value={record.arrivalTime || ''}
                    onChange={(e) => onUpdateRecord(record.id, { arrivalTime: e.target.value })}
                    className="w-full text-center bg-transparent border-none focus:ring-0 text-sm font-mono"
                  />
                </td>

                <td className="border border-gray-400 text-center no-print">
                   <button 
                     onClick={() => onUpdateRecord(record.id, { isExcused: !record.isExcused })}
                     className={`p-1 rounded ${record.isExcused ? 'text-green-600' : 'text-gray-300'}`}
                   >
                     {record.isExcused ? <CheckSquare size={20}/> : <Square size={20}/>}
                   </button>
                </td>
                <td className="border border-gray-400 text-center print-only hidden">
                  {record.isExcused ? 'نعم' : ''}
                </td>

                <td className="border border-gray-400 px-1">
                   <span className="print-only hidden text-center w-full">{getActionLabel(record.actionTaken)}</span>
                   
                   <select
                     value={record.actionTaken || 'NONE'}
                     onChange={(e) => onUpdateRecord(record.id, { actionTaken: e.target.value as ActionType })}
                     className="w-full bg-transparent border-none text-sm text-center focus:ring-0 cursor-pointer no-print"
                   >
                     <option value="NONE" className="text-gray-400">-- اختر --</option>
                     <option value="WARNING">تنبيه شفوي</option>
                     <option value="PLEDGE">تعهد خطي</option>
                     <option value="CALL">اتصال بالولي</option>
                     <option value="SUMMON">استدعاء ولي أمر</option>
                     <option value="COUNCIL">مجلس نظام</option>
                   </select>
                </td>

                <td className="border border-gray-400 text-center no-print align-middle">
                  <button 
                    onClick={() => handleWhatsApp(record)}
                    className={`p-2 rounded transition-colors flex items-center justify-center mx-auto ${
                      record.phone 
                        ? 'text-green-500 hover:bg-green-50 hover:text-green-700' 
                        : 'text-gray-300 hover:text-gray-500'
                    }`}
                    title={record.phone ? "مراسلة ولي الأمر" : "لا يوجد رقم هاتف"}
                  >
                    <MessageCircle size={20} />
                  </button>
                </td>

                <td className="border border-gray-400 text-center no-print align-middle">
                  <button 
                    onClick={() => onRemove(record.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            
            {emptyRows.map((_, i) => (
              <tr key={`empty-${i}`} className="h-10">
                <td className="border border-gray-400 text-center text-gray-400 font-light">{records.length + i + 1}</td>
                <td className="border border-gray-400"></td>
                <td className="border border-gray-400"></td>
                <td className="border border-gray-400"></td>
                <td className="border border-gray-400"></td>
                <td className="border border-gray-400"></td>
                <td className="border border-gray-400 no-print"></td>
                <td className="border border-gray-400 no-print"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-end px-8">
        <div className="text-center">
          <p className="font-bold text-gray-800 mb-4 text-lg">يعتمد مدير المدرسة:</p>
          <div className="bg-gray-200/50 px-6 py-2 rounded border border-dashed border-gray-400 print:border-none print:bg-transparent">
             <span className="font-tajawal font-bold text-xl">{managerName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};