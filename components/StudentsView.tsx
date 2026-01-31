import React, { useState, useRef } from 'react';
import { Student, GradeLevel } from '../types.ts';
import { Upload, Search, User, UserPlus, Layers, Plus, Trash2, X, FileSpreadsheet, FileText, Phone } from 'lucide-react';
import { parseExcelFile } from '../services/excelService.ts';
import { parseWordFile } from '../services/wordService.ts';

interface StudentsViewProps {
  students: Student[];
  setStudents: (s: Student[]) => void;
  structure: GradeLevel[];
  setStructure: (g: GradeLevel[]) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ students, setStudents, structure, setStructure }) => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'STRUCTURE'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [loading, setLoading] = useState(false);
  
  const [modalGrade, setModalGrade] = useState('');

  const [importMode, setImportMode] = useState<'AUTO' | 'MANUAL'>('MANUAL');
  const [importMethod, setImportMethod] = useState<'APPEND' | 'REPLACE'>('APPEND');
  const [importGrade, setImportGrade] = useState('');
  const [importClass, setImportClass] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('gradeName') as HTMLInputElement;
    const name = input.value.trim();
    if (name) {
      setStructure([...structure, { id: Date.now().toString(), name, classes: [] }]);
      input.value = '';
    }
  };

  const handleDeleteGrade = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصف؟')) {
      setStructure(structure.filter((g) => g.id !== id));
    }
  };

  const handleAddClass = (gradeId: string, className: string) => {
    if (!className.trim()) return;
    setStructure(structure.map((g) => {
      if (g.id === gradeId && !g.classes.includes(className)) {
        return { ...g, classes: [...g.classes, className] };
      }
      return g;
    }));
  };

  const handleDeleteClass = (gradeId: string, className: string) => {
    setStructure(structure.map((g) => {
      if (g.id === gradeId) {
        return { ...g, classes: g.classes.filter((c) => c !== className) };
      }
      return g;
    }));
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('studentName') as HTMLInputElement).value;
    const grade = (form.elements.namedItem('studentGrade') as HTMLSelectElement).value;
    const className = (form.elements.namedItem('studentClass') as HTMLSelectElement).value;
    const phone = (form.elements.namedItem('studentPhone') as HTMLInputElement).value;

    if (name && grade) {
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        name,
        grade,
        className: className || 'بدون',
        phone: phone || ''
      };
      setStudents([...students, newStudent]);
      setShowAddModal(false);
      setModalGrade('');
    }
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('حذف هذا الطالب؟')) {
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    
    if (!file) {
      alert('يرجى اختيار ملف');
      return;
    }

    if (importMode === 'MANUAL' && (!importGrade || !importClass)) {
      alert('يرجى اختيار الصف والفصل لتوزيع الطلاب عليهم، حيث أن معظم ملفات القوائم لا تحتوي على الصف.');
      return;
    }

    if (importMethod === 'REPLACE' && students.length > 0) {
      if (!confirm('تحذير هام: سيتم حذف جميع الطلاب الحاليين.\nهل أنت متأكد؟')) {
        return;
      }
    }

    setLoading(true);
    try {
      let parsedStudents: Student[] = [];

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parsedStudents = await parseExcelFile(file);
      } else if (file.name.endsWith('.docx')) {
        parsedStudents = await parseWordFile(file);
      } else {
        alert('صيغة الملف غير مدعومة. يرجى استخدام Excel (.xlsx) أو Word (.docx)');
        setLoading(false);
        return;
      }

      if (parsedStudents.length === 0) {
        alert('لم يتم العثور على بيانات. تأكد من أن الملف يحتوي على جدول أو قائمة بالأسماء.');
        setLoading(false);
        return;
      }

      const processedStudents = parsedStudents.map((s) => {
        if (importMode === 'MANUAL') {
          return { ...s, grade: importGrade, className: importClass };
        }
        return s;
      });

      if (importMethod === 'REPLACE') {
        setStudents(processedStudents);
      } else {
        setStudents([...students, ...processedStudents]);
      }
      
      alert(`تمت إضافة ${processedStudents.length} طالب بنجاح.`);
      setShowImportModal(false);
      setImportGrade('');
      setImportClass('');
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء قراءة الملف. تأكد من أن الملف ليس تالفاً ويحتوي على جدول واضح.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch = s.name.includes(searchTerm);
    const matchGrade = filterGrade ? s.grade === filterGrade : true;
    return matchSearch && matchGrade;
  });

  return (
    <div className="p-4 space-y-4 pb-24">
      
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">إدارة الطلاب ({students.length})</h2>
        
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm w-full">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-md font-bold text-sm transition-all ${
              activeTab === 'LIST' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <User size={16} />
            الطلاب
          </button>
          <button
            onClick={() => setActiveTab('STRUCTURE')}
            className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-md font-bold text-sm transition-all ${
              activeTab === 'STRUCTURE' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Layers size={16} />
            الصفوف
          </button>
        </div>
      </div>

      {activeTab === 'STRUCTURE' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-sm mb-3 text-primary flex items-center gap-2">
              <Plus size={16} />
              إضافة صف جديد
            </h3>
            <form onSubmit={handleAddGrade} className="flex gap-2">
              <input
                name="gradeName"
                type="text"
                placeholder="اسم الصف..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm text-gray-900"
              />
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm">
                إضافة
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {structure.map((grade) => (
              <div key={grade.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                  <h4 className="font-bold text-gray-800">{grade.name}</h4>
                  <button onClick={() => handleDeleteGrade(grade.id)} className="text-red-400 p-1">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {grade.classes.map((cls) => (
                    <span key={cls} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                      {cls}
                      <button onClick={() => handleDeleteClass(grade.id, cls)} className="text-blue-400 hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {grade.classes.length === 0 && <span className="text-xs text-gray-400">لا توجد فصول</span>}
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('classInput') as HTMLInputElement;
                    handleAddClass(grade.id, input.value);
                    input.value = '';
                  }}
                  className="flex gap-2"
                >
                  <input
                    name="classInput"
                    type="text"
                    placeholder="فصل (أ، 1...)"
                    className="w-full p-2 text-xs border border-gray-200 bg-gray-50 rounded focus:ring-1 focus:ring-primary outline-none text-gray-900"
                  />
                  <button type="submit" className="text-primary bg-blue-50 px-3 rounded">
                    <Plus size={16} />
                  </button>
                </form>
              </div>
            ))}
            {structure.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">لا توجد صفوف مضافة</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'LIST' && (
        <div className="space-y-3 animate-fade-in">
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="بحث..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pr-9 pl-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none text-gray-900 bg-white"
              />
            </div>
            <select 
              className="w-24 p-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-primary outline-none"
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              <option value="">الكل</option>
              {structure.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
             <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-white py-2 rounded-lg flex justify-center items-center gap-2 text-sm font-bold shadow-sm"
              >
                <UserPlus size={16} />
                إضافة
              </button>
              <button
                onClick={() => { setImportMethod('APPEND'); setShowImportModal(true); }}
                className="bg-green-600 text-white py-2 rounded-lg flex justify-center items-center gap-2 text-sm font-bold shadow-sm"
              >
                <Upload size={16} />
                استيراد
              </button>
          </div>

          <div className="space-y-2">
            {filteredStudents.length > 0 ? (
              filteredStudents.slice(0, 50).map((student) => (
                <div key={student.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{student.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{student.grade}</span>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{student.className}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.phone && (
                      <a href={`tel:${student.phone}`} className="text-green-600 bg-green-50 p-2 rounded-full">
                        <Phone size={16} />
                      </a>
                    )}
                    <button 
                      onClick={() => handleDeleteStudent(student.id)}
                      className="text-gray-300 hover:text-red-500 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm">
                لا توجد بيانات.
              </div>
            )}
            {filteredStudents.length > 50 && (
              <div className="text-center text-xs text-gray-400 py-2">يتم عرض 50 نتيجة فقط</div>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-900">إضافة طالب</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleAddStudent} className="p-4 space-y-3">
              <input name="studentName" type="text" required placeholder="اسم الطالب" className="w-full p-3 border rounded-lg bg-gray-50 outline-none text-gray-900" />
              <input name="studentPhone" type="tel" placeholder="رقم هاتف الولي (اختياري)" className="w-full p-3 border rounded-lg bg-gray-50 outline-none text-gray-900" />
              
              <select name="studentGrade" required className="w-full p-3 border rounded-lg bg-gray-50 outline-none text-gray-900" onChange={(e) => setModalGrade(e.target.value)}>
                <option value="">اختر الصف...</option>
                {structure.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
              <select name="studentClass" className="w-full p-3 border rounded-lg bg-gray-50 outline-none text-gray-900">
                <option value="">اختر الفصل...</option>
                {modalGrade && structure.find((g) => g.name === modalGrade)?.classes.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="1">1</option><option value="2">2</option><option value="أ">أ</option><option value="ب">ب</option>
              </select>
              <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold">حفظ</button>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b bg-green-50 flex justify-between items-center">
              <h3 className="font-bold text-green-800 flex gap-2"><Upload size={18}/> استيراد بيانات الطلاب</h3>
              <button onClick={() => setShowImportModal(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleImportSubmit} className="p-4 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border text-sm">
                 <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-800">
                      <input type="radio" name="importMethod" checked={importMethod === 'APPEND'} onChange={() => setImportMethod('APPEND')} />
                      <span>إضافة للقائمة</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-red-600">
                      <input type="radio" name="importMethod" checked={importMethod === 'REPLACE'} onChange={() => setImportMethod('REPLACE')} />
                      <span>استبدال الكل</span>
                    </label>
                 </div>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button type="button" onClick={() => setImportMode('MANUAL')} className={`flex-1 py-2 text-xs font-bold rounded ${importMode === 'MANUAL' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>تحديد الصف يدوياً</button>
                <button type="button" onClick={() => setImportMode('AUTO')} className={`flex-1 py-2 text-xs font-bold rounded ${importMode === 'AUTO' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>تلقائي (من الملف)</button>
              </div>

              {importMode === 'MANUAL' && (
                <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                   <p className="text-xs text-blue-800 mb-2">يفضل استخدام هذا الخيار عند استيراد قائمة فصل واحد (Excel أو Word)</p>
                   <select value={importGrade} onChange={(e) => setImportGrade(e.target.value)} className="w-full p-2 border rounded bg-white text-sm text-gray-900">
                     <option value="">اختر الصف...</option>
                     {structure.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
                   </select>
                   <select value={importClass} onChange={(e) => setImportClass(e.target.value)} className="w-full p-2 border rounded bg-white text-sm text-gray-900">
                     <option value="">اختر الشعبة...</option>
                     {importGrade && structure.find((g) => g.name === importGrade)?.classes.map((c) => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                <input type="file" ref={fileInputRef} accept=".xlsx, .xls, .docx" className="hidden" id="file-upload" onChange={(e) => {
                   if(e.target.files?.[0]) {
                     const f = e.target.files[0];
                     alert(`تم اختيار: ${f.name} (${(f.size/1024).toFixed(1)} KB)`);
                   }
                }}/>
                <label htmlFor="file-upload" className="flex flex-col items-center gap-3 cursor-pointer">
                  <div className="flex gap-2">
                    <FileSpreadsheet size={32} className="text-green-600" />
                    <FileText size={32} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">اضغط لاختيار ملف Excel أو Word</span>
                  <span className="text-xs text-gray-400">يدعم الجداول وقوائم الأسماء مع الأرقام</span>
                </label>
              </div>
              
              <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded">
                 <strong>نصيحة:</strong> للحصول على أفضل النتائج، تأكد من أن الملف يحتوي على عمود "الاسم" وعمود "الهاتف" (اختياري).
              </div>

              <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
                {loading ? 'جاري المعالجة...' : 'بدء الاستيراد'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};