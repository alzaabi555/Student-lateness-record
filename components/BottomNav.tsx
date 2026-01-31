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
    { view: 'STUDENTS', label: 'الطلاب', icon: <Users size={24} /> },
    { view: 'REGISTER', label: 'تسجيل', icon: <ClipboardList size={24} /> },
    { view: 'REPORTS', label: 'التقارير', icon: <FileText size={24} /> },
    { view: 'SETTINGS', label: 'الإعدادات', icon: <Settings size={24} /> },
  ];

  return (
    // Changed "fixed bottom-0" to absolute positioning inside the App container to stick to the mobile frame
    // This makes it look like a phone app even on desktop
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg pb-safe no-print z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              currentView === item.view ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};