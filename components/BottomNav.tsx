import React from 'react';
import { Home, Users, ClipboardList, FileText, Settings } from 'lucide-react';
import { ViewState } from '../types.ts';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems: { view: ViewState; label: string; icon: React.ReactNode }[] = [
    { view: 'HOME', label: 'الرئيسية', icon: <Home size={24} /> },
    { view: 'REGISTER', label: 'تسجيل', icon: <ClipboardList size={24} /> },
    { view: 'STUDENTS', label: 'الطلاب', icon: <Users size={24} /> },
    { view: 'REPORTS', label: 'التقارير', icon: <FileText size={24} /> },
    { view: 'SETTINGS', label: 'الإعدادات', icon: <Settings size={24} /> },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe z-50 no-print">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto md:max-w-none">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors active:scale-95 ${
              currentView === item.view ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`transition-all duration-200 ${currentView === item.view ? "bg-blue-50 p-1.5 rounded-xl -translate-y-1" : ""}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${currentView === item.view ? 'font-bold' : ''}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};