import React, { useState, useEffect } from 'react';
import { Student, LateRecord, AppSettings, ViewState, GradeLevel } from './types.ts';
import { BottomNav } from './components/BottomNav.tsx';
import { HomeView } from './components/HomeView.tsx';
import { RegisterView } from './components/RegisterView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { StudentsView } from './components/StudentsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';

const DEFAULT_SETTINGS: AppSettings = {
  schoolName: 'مدرسة الإبداع للتعليم الأساسي',
  managerName: 'سلطان الزيدي',
  supervisorName: 'أحمد المحمدي'
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<LateRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [structure, setStructure] = useState<GradeLevel[]>([]);

  // --- Persistence ---
  useEffect(() => {
    const load = (key: string, setter: any, defaultVal: any) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setter(JSON.parse(saved));
        } catch (e) {
          console.error(`Error parsing ${key}`, e);
          setter(defaultVal);
        }
      } else {
        setter(defaultVal);
      }
    };
    load('app_students', setStudents, []);
    load('app_records', setRecords, []);
    load('app_settings', setSettings, DEFAULT_SETTINGS);
    load('app_structure', setStructure, []);
  }, []);

  useEffect(() => {
    localStorage.setItem('app_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('app_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('app_structure', JSON.stringify(structure));
  }, [structure]);

  // --- Handlers ---
  const handleAddRecords = (newStudents: Student[]) => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const newRecords: LateRecord[] = newStudents.map(s => ({
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentId: s.id,
      studentName: s.name,
      grade: s.grade,
      className: s.className,
      timestamp: Date.now(),
      dateString: todayStr,
      notes: '',
      phone: s.phone,
      arrivalTime: currentTime,
      isExcused: false,
      actionTaken: 'NONE'
    }));
    setRecords(prev => [...prev, ...newRecords]);
  };

  const handleDeleteRecord = (id: string) => {
    if(confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleUpdateRecord = (id: string, updates: Partial<LateRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleImportData = (data: any) => {
    if (data.settings) setSettings(data.settings);
    if (data.students) setStudents(data.students);
    if (data.records) setRecords(data.records);
    if (data.structure) setStructure(data.structure);
    alert('تم استعادة البيانات بنجاح');
  };

  const handleClearData = () => {
    if(confirm('تحذير: سيتم حذف جميع البيانات. هل أنت متأكد؟')) {
      setStudents([]);
      setRecords([]);
      setStructure([]);
      setSettings(DEFAULT_SETTINGS);
      localStorage.clear();
      alert('تم حذف البيانات');
    }
  };

  // --- Render ---
  const renderView = () => {
    switch (view) {
      case 'HOME':
        return <HomeView 
          settings={settings} 
          students={students} 
          records={records}
          onRemoveRecord={handleDeleteRecord}
          onUpdateRecord={handleUpdateRecord}
        />;
      case 'REGISTER':
        const todayStr = new Date().toLocaleDateString('en-CA');
        const todayRecordIds = new Set(records.filter(r => r.dateString === todayStr).map(r => r.studentId));
        return <RegisterView 
          students={students} 
          onAddRecords={handleAddRecords} 
          existingRecordIds={todayRecordIds} 
          structure={structure} 
        />;
      case 'REPORTS':
        return <ReportsView records={records} settings={settings} onDeleteRecord={handleDeleteRecord} />;
      case 'STUDENTS':
        return <StudentsView 
          students={students} 
          setStudents={setStudents} 
          structure={structure}
          setStructure={setStructure}
        />;
      case 'SETTINGS':
        return <SettingsView 
          settings={settings} setSettings={setSettings} 
          students={students} records={records} 
          onImport={handleImportData} onClearData={handleClearData} 
        />;
      default:
        return <HomeView 
          settings={settings} 
          students={students} 
          records={records} 
          onRemoveRecord={handleDeleteRecord}
          onUpdateRecord={handleUpdateRecord}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col text-gray-900 overflow-hidden font-sans relative">
      
      {/* Main Content Layer */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide w-full pb-24">
           <div className="w-full max-w-3xl mx-auto md:p-6 pt-safe">
              {renderView()}
           </div>
        </div>
      </div>

      {/* Navigation Layer - Fixed at Bottom */}
      <BottomNav currentView={view} setView={setView} />
    </div>
  );
};

export default App;