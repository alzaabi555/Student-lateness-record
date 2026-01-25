import React, { useState, useMemo } from 'react';
import { Student, GradeLevel } from '../types';
import { ChevronRight, CheckCircle, Search, Save, AlertCircle } from 'lucide-react';

interface RegisterViewProps {
  students: Student[];
  onAddRecords: (students: Student[]) => void;
  existingRecordIds: Set<string>;
  structure: GradeLevel[];
}

type Step = 'GRADE' | 'CLASS' | 'SELECT';

export const RegisterView: React.FC<RegisterViewProps> = ({ students, onAddRecords, existingRecordIds, structure }) => {
  const [step, setStep] = useState<Step>('GRADE');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Get Available Grades (Merge Structure + Existing Student Grades)
  const availableGrades = useMemo(() => {
    const structureGrades = structure.map(g => g.name);
    const studentGrades = students.map(s => s.grade);
    // Unique and sort
    return Array.from(new Set([...structureGrades, ...studentGrades])).sort();
  }, [students, structure]);

  // 2. Get Classes for selected Grade (Merge Structure + Existing Student Classes)
  const availableClasses = useMemo(() => {
    if (!selectedGrade) return [];
    
    // Find in structure
    const structureEntry = structure.find(g => g.name === selectedGrade);
    const structClasses = structureEntry ? structureEntry.classes : [];

    // Find in students (fallback for imported data)
    const studentClasses = students
      .filter(s => s.grade === selectedGrade)
      .map(s => s.className);

    return Array.from(new Set([...structClasses, ...studentClasses])).sort();
  }, [students, structure, selectedGrade]);

  // 3. Get Students for selected Class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => 
      s.grade === selectedGrade && 
      s.className === selectedClass &&
      (searchTerm === '' || s.name.includes(searchTerm))
    );
  }, [students, selectedGrade, selectedClass, searchTerm]);

  const toggleStudentSelection = (id: string) => {
    if (existingRecordIds.has(id)) return;
    
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStudentIds(newSet);
  };

  const handleSave = () => {
    const studentsToAdd = students.filter(s => selectedStudentIds.has(s.id));
    onAddRecords(studentsToAdd);
    setSelectedStudentIds(new Set());
    alert(`تم تسجيل ${studentsToAdd.length} طالب بنجاح`);
    setStep('GRADE');
    setSelectedGrade('');
    setSelectedClass('');
  };

  const goBack = () => {
    if (step === 'SELECT') setStep('CLASS');
    else if (step === 'CLASS') setStep('GRADE');
  };

  return (
    <div className="p-4 h-[calc(100vh-80px)] overflow-y-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">تسجيل التأخير</h2>
        {step !== 'GRADE' && (
          <button onClick={goBack} className="text-sm text-gray-500 hover:text-primary">
            عودة للسابق
          </button>
        )}
      </div>

      {/* STEP 1: Select Grade */}
      {step === 'GRADE' && (
        <div className="grid grid-cols-1 gap-4">
          <p className="text-gray-500 mb-2">اختر الصف الدراسي:</p>
          {availableGrades.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500">لا توجد صفوف دراسية.</p>
              <p className="text-sm text-gray-400 mt-1">قم بإضافة الصفوف من تبويب "الطلاب" &gt; "الهيكل المدرسي"</p>
            </div>
          ) : null}
          
          {availableGrades.map(grade => {
             // Optional: Show count of students in this grade
             const studentCount = students.filter(s => s.grade === grade).length;
             
             return (
              <button
                key={grade}
                onClick={() => { setSelectedGrade(grade); setStep('CLASS'); }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-right flex justify-between items-center hover:border-primary hover:bg-blue-50 transition-all"
              >
                <div>
                   <span className="font-bold text-lg text-gray-800">{grade}</span>
                   {studentCount > 0 && <span className="text-xs text-gray-400 block mt-1">{studentCount} طالب</span>}
                </div>
                <ChevronRight className="text-gray-400" />
              </button>
            );
          })}
        </div>
      )}

      {/* STEP 2: Select Class */}
      {step === 'CLASS' && (
        <div className="space-y-4">
          <div className="text-primary font-bold text-lg border-b pb-2">{selectedGrade}</div>
          <p className="text-gray-500">اختر الشعبة / الفصل:</p>
          
          <div className="grid grid-cols-2 gap-4">
            {availableClasses.length === 0 && (
               <div className="col-span-2 text-center py-8 text-gray-400 bg-gray-50 rounded border border-dashed">
                 لا توجد فصول مضافة لهذا الصف
               </div>
            )}
            
            {availableClasses.map(cls => {
              const count = students.filter(s => s.grade === selectedGrade && s.className === cls).length;
              
              return (
                <button
                  key={cls}
                  onClick={() => { setSelectedClass(cls); setStep('SELECT'); }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-blue-50 transition-all relative overflow-hidden"
                >
                  <span className="font-bold text-2xl text-gray-800">{cls}</span>
                  <span className="text-xs text-gray-500">{count} طالب</span>
                  {count === 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-orange-400 rounded-full" title="فارغ"></span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Select Students */}
      {step === 'SELECT' && (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-bold text-primary">{selectedGrade}</span>
            <span className="text-gray-300">|</span>
            <span className="font-bold text-primary">{selectedClass}</span>
          </div>

          <div className="relative mb-4">
            <Search className="absolute right-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="بحث عن طالب..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-20">
            {classStudents.length === 0 && (
               <div className="text-center py-10 text-gray-400">
                  لا يوجد طلاب في هذا الفصل
               </div>
            )}
            
            {classStudents.map(student => {
              const isSelected = selectedStudentIds.has(student.id);
              const isAlreadyLate = existingRecordIds.has(student.id);

              return (
                <button
                  key={student.id}
                  onClick={() => !isAlreadyLate && toggleStudentSelection(student.id)}
                  disabled={isAlreadyLate}
                  className={`w-full p-4 rounded-lg border flex justify-between items-center transition-all ${
                    isAlreadyLate 
                      ? 'bg-red-50 border-red-100 opacity-70 cursor-not-allowed'
                      : isSelected 
                        ? 'bg-blue-50 border-blue-500 shadow-md transform scale-[1.01]' 
                        : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="text-right">
                    <p className={`font-bold ${isAlreadyLate ? 'text-red-700' : 'text-gray-800'}`}>
                      {student.name}
                    </p>
                    {isAlreadyLate && <span className="text-xs text-red-500">تم تسجيله اليوم</span>}
                  </div>
                  
                  {isSelected && !isAlreadyLate && <CheckCircle className="text-primary fill-blue-100" size={24} />}
                </button>
              );
            })}
          </div>

          {/* Floating Action Button */}
          {selectedStudentIds.size > 0 && (
            <button
              onClick={handleSave}
              className="fixed bottom-24 left-4 right-4 bg-secondary text-white p-4 rounded-xl shadow-xl flex justify-center items-center gap-2 font-bold text-lg animate-bounce-short z-40"
            >
              <Save size={24} />
              <span>حفظ الغياب ({selectedStudentIds.size})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};