import React from 'react';
import { LateRecord } from '../types';
import { Trash2 } from 'lucide-react';

interface LateTableProps {
  records: LateRecord[];
  onRemove: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  managerName: string;
}

export const LateTable: React.FC<LateTableProps> = ({ records, onRemove, onUpdateNotes, managerName }) => {
  // Ensure we always show at least 20 rows to match the paper style
  const emptyRowsCount = Math.max(0, 20 - records.length);
  const emptyRows = Array.from({ length: emptyRowsCount });

  return (
    <div className="w-full">
      <div className="overflow-x-auto border-2 border-gray-800 rounded-sm">
        <table className="w-full min-w-[600px] border-collapse bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-600 p-2 w-12 text-center font-bold text-gray-800">م</th>
              <th className="border border-gray-600 p-2 text-right font-bold text-gray-800">اسم الطالب</th>
              <th className="border border-gray-600 p-2 w-48 text-center font-bold text-gray-800">الصف</th>
              <th className="border border-gray-600 p-2 w-1/3 text-center font-bold text-gray-800">ملاحظات (الإجراءات)</th>
              <th className="border border-gray-600 p-2 w-12 text-center font-bold text-gray-800 no-print">حذف</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.id} className="hover:bg-gray-50 h-10">
                <td className="border border-gray-400 text-center font-medium">{index + 1}</td>
                <td className="border border-gray-400 px-3 text-gray-900 font-medium">{record.studentName}</td>
                <td className="border border-gray-400 text-center text-gray-700">
                  {record.grade} {record.className ? `(${record.className})` : ''}
                </td>
                <td className="border border-gray-400 px-2">
                  <input
                    type="text"
                    value={record.notes}
                    onChange={(e) => onUpdateNotes(record.id, e.target.value)}
                    className="w-full h-full bg-transparent border-none focus:ring-0 text-right text-sm"
                    placeholder="..."
                  />
                </td>
                <td className="border border-gray-400 text-center no-print">
                  <button 
                    onClick={() => onRemove(record.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {/* Fill empty rows to maintain A4 look */}
            {emptyRows.map((_, i) => (
              <tr key={`empty-${i}`} className="h-10">
                <td className="border border-gray-400 text-center text-gray-400 font-light">{records.length + i + 1}</td>
                <td className="border border-gray-400"></td>
                <td className="border border-gray-400"></td>
                <td className="border border-gray-400"></td>
                <td className="border border-gray-400 no-print"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Signature Area */}
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