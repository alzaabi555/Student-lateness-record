import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { UserPlus } from 'lucide-react';

interface StudentSelectorProps {
  students: Student[];
  onAdd: (student: Student) => void;
}

export const StudentSelector: React.FC<StudentSelectorProps> = ({ students, onAdd }) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract unique grades
  const grades = useMemo(() => {
    return Array.from(new Set(students.map(s => s.grade))).sort();
  }, [students]);

  // Extract unique classes based on selected grade
  const classes = useMemo(() => {
    if (!selectedGrade) return [];
    return Array.from(new Set(
      students.filter(s => s.grade === selectedGrade).map(s => s.className)
    )).sort();
  }, [students, selectedGrade]);

  // Filter students based on selection
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchGrade = selectedGrade ? s.grade === selectedGrade : true;
      const matchClass = selectedClass ? s.className === selectedClass : true;
      const matchSearch = searchTerm ? s.name.includes(searchTerm) : true;
      return matchGrade && matchClass && matchSearch;
    });
  }, [students, selectedGrade, selectedClass, searchTerm]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 no-print">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
        <UserPlus size={20} />
        تسجيل تأخر جديد
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Grade Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الصف الدراسـي</label>
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setSelectedClass(''); // Reset class
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">-- اختر الصف --</option>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Class Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الفصل / الشعبة</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={!selectedGrade}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
          >
            <option value="">-- اختر الفصل --</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">بحث بالاسم</label>
          <input 
            type="text" 
            placeholder="اكتب اسم الطالب..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Student List Grid */}
      <div className="mt-4 max-h-48 overflow-y-auto border border-gray-100 rounded-md bg-gray-50 p-2">
        {filteredStudents.length === 0 ? (
          <p className="text-center text-gray-500 py-4">لا توجد نتائج مطابقة</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => onAdd(student)}
                className="text-right p-2 text-sm bg-white border border-gray-200 rounded hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors flex justify-between items-center group"
              >
                <span>{student.name}</span>
                <span className="text-xs text-gray-400 group-hover:text-red-400">
                  {student.grade} - {student.className}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};