import React, { useState, useMemo } from 'react';
import { Student, GradeLevel } from '../types.ts';
import { ChevronRight, CheckCircle, Search, Save, AlertCircle, X, Users } from 'lucide-react';

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
  const [classSearchTerm, setClassSearchTerm] = useState('');
  
  const [globalSearch, setGlobalSearch] = useState('');

  const availableGrades = useMemo(() => {
    const structureGrades = structure.map(g => g.name);
    const studentGrades = students.map(s => s.grade);
    return Array.from(new Set([...structureGrades, ...studentGrades])).sort();
  }, [students, structure]);

  const availableClasses = useMemo(() => {
    if (!selectedGrade) return [];
    
    const structureEntry = structure.find(g => g.name === selectedGrade);
    const structClasses = structureEntry ? structureEntry.classes : [];

    const studentClasses = students
      .filter(s => s.grade === selectedGrade)
      .map(s => s.className);

    return Array.from(new Set([...structClasses, ...studentClasses])).sort();
  }, [students, structure, selectedGrade]);

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => 
      s.grade === selectedGrade && 
      s.className === selectedClass &&
      (classSearchTerm === '' || s.name.includes(classSearchTerm))
    );
  }, [students, selectedGrade, selectedClass, classSearchTerm]);

  const globalSearchResults = useMemo(() => {
    if (!globalSearch.trim()) return [];
    const term = globalSearch.toLowerCase();
    return students
      .filter(s => s.name.toLowerCase().includes(term))
      .slice(0, 50);
  }, [students, globalSearch]);

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
    setGlobalSearch('');
    alert(`تم تسجيل ${studentsToAdd.length} طالب بنجاح`);
    setStep('GRADE');
    setSelectedGrade('');
    setSelectedClass('');
  };

  const goBack = () => {
    if (step === 'SELECT') setStep('CLASS');
    else if (step === 'CLASS') setStep('GRADE');
  };

  const isGlobalSearchActive = globalSearch.trim().length > 0;

  return (
    <div className="p-4 pb-24">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">تسجيل التأخير</h2>
          {!isGlobalSearchActive && step !== 'GRADE' && (
            <button onClick={goBack} className="text-sm text-gray-500 hover:text-primary">
              عودة للسابق
            </button>
          )}
        </div>

        <div className="relative z-20">
          <Search className="absolute right-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث سريع في كل المدرسة (1100+ طالب)..." 
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className={`w-full p-3 pr-10 border rounded-xl shadow-sm outline-none transition-all ${
              isGlobalSearchActive 
                ? 'border-primary ring-2 ring-primary/20 bg-white' 
                : 'border-gray-300 bg-gray-50 focus:bg-white focus:border-primary'
            }`}
          />
          {isGlobalSearchActive && (
            <button 
              onClick={() => setGlobalSearch('')}
              className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {isGlobalSearchActive ? (
        <div className="space-y-3 animate-fade-in">
           <div className="flex items-center justify-between text-sm text-gray-500 px-1">
             <span>نتائج البحث ({globalSearchResults.length})</span>
             {globalSearchResults.length === 50 && <span>(يتم عرض أول 50 نتيجة)</span>}
           </div>

           {globalSearchResults.length === 0 ? (
             <div className="text-center py-10 text-gray-400">
               لا توجد نتائج مطابقة لـ "{globalSearch}"
             </div>
           ) : (
             globalSearchResults.map(student => {
                const isSelected = selectedStudentIds.has(student.id);
                const isAlreadyLate = existingRecordIds.has(student.id);
                
                return (
                  <button
                    key={student.id}
                    onClick={() => !isAlreadyLate && toggleStudentSelection(student.id)}
                    disabled={isAlreadyLate}
                    className={`w-full p-3 rounded-xl border flex justify-between items-center transition-all ${
                      isAlreadyLate 
                        ? 'bg-red-50 border-red-100 opacity-60 cursor-not-allowed'
                        : isSelected 
                          ? 'bg-blue-50 border-blue-500 shadow-md transform scale-[1.01]' 
                          : 'bg-white border-gray-200 shadow-sm'
                    }`}
                  >
                    <div className="text-right">
                      <p className={`font-bold ${isAlreadyLate ? 'text-red-700' : 'text-gray-900'}`}>
                        {student.name}
                      </p>
                      <div className="flex gap-2 text-xs mt-1">
                         <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{student.grade}</span>
                         <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">{student.className}</span>
                      </div>
                    </div>
                    
                    {isSelected && !isAlreadyLate && <CheckCircle className="text-primary fill-blue-100" size={24} />}
                    {isAlreadyLate && <span className="text-xs text-red-500 font-bold px-2">مسجل</span>}
                  </button>
                );
             })
           )}
        </div>
      ) : (
        <>
          {step === 'GRADE' && (
            <div className="grid grid-cols-1 gap-3 animate-fade-in">
              <p className="text-gray-500 mb-1 text-sm">أو اختر الصف الدراسي:</p>
              {availableGrades.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500">لا توجد صفوف دراسية.</p>
                </div>
              ) : null}
              
              {availableGrades.map(grade => {
                 const studentCount = students.filter(s => s.grade === grade).length;
                 return (
                  <button
                    key={grade}
                    onClick={() => { setSelectedGrade(grade); setStep('CLASS'); }}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 text-right flex justify-between items-center hover:border-primary hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                       <div className="bg-blue-100 p-2 rounded-lg text-primary">
                         <Users size={20} />
                       </div>
                       <div>
                         <span className="font-bold text-lg text-gray-800 block">{grade}</span>
                         {studentCount > 0 && <span className="text-xs text-gray-400">{studentCount} طالب</span>}
                       </div>
                    </div>
                    <ChevronRight className="text-gray-400" />
                  </button>
                );
              })}
            </div>
          )}

          {step === 'CLASS' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-primary font-bold text-lg border-b pb-2 flex justify-between items-center">
                <span>{selectedGrade}</span>
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">اختر الشعبة</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {availableClasses.length === 0 && (
                   <div className="col-span-2 text-center py-8 text-gray-400 bg-gray-50 rounded border border-dashed">
                     لا توجد فصول مضافة
                   </div>
                )}
                
                {availableClasses.map(cls => {
                  const count = students.filter(s => s.grade === selectedGrade && s.className === cls).length;
                  return (
                    <button
                      key={cls}
                      onClick={() => { setSelectedClass(cls); setStep('SELECT'); }}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-blue-50 transition-all relative overflow-hidden group"
                    >
                      <span className="font-bold text-2xl text-gray-800 group-hover:scale-110 transition-transform">{cls}</span>
                      <span className="text-xs text-gray-500">{count} طالب</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'SELECT' && (
            <div className="flex flex-col h-full animate-fade-in">
              <div className="flex items-center gap-2 mb-4 bg-gray-100 p-2 rounded-lg text-sm">
                <span className="font-bold text-primary">{selectedGrade}</span>
                <span className="text-gray-400">/</span>
                <span className="font-bold text-primary">{selectedClass}</span>
              </div>

              <div className="relative mb-4">
                <Search className="absolute right-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="تصفية طلاب الفصل..." 
                  value={classSearchTerm}
                  onChange={(e) => setClassSearchTerm(e.target.value)}
                  className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2 mb-20">
                {classStudents.length === 0 && (
                   <div className="text-center py-10 text-gray-400">
                      لا يوجد طلاب
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
                      className={`w-full p-3 rounded-lg border flex justify-between items-center transition-all ${
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
            </div>
          )}
        </>
      )}

      {selectedStudentIds.size > 0 && (
        <button
          onClick={handleSave}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-auto md:w-[416px] bg-secondary text-white p-4 rounded-xl shadow-xl flex justify-center items-center gap-2 font-bold text-lg animate-bounce-short z-40 hover:bg-red-700 transition-colors"
        >
          <Save size={24} />
          <span>حفظ الغياب ({selectedStudentIds.size})</span>
        </button>
      )}
    </div>
  );
};