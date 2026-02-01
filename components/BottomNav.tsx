import React from 'react';
import { Home, Users, ClipboardList, FileText, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems: { view: ViewState; label: string; icon: React.ReactNode }[] = [
    { view: 'HOME', label: 'الرئيسية', icon: <Home size={28} /> },
    { view: 'STUDENTS', label: 'الطلاب', icon: <Users size={28} /> },
    { view: 'REGISTER', label: 'تسجيل', icon: <ClipboardList size={28} /> },
    { view: 'REPORTS', label: 'التقارير', icon: <FileText size={28} /> },
    { view: 'SETTINGS', label: 'الإعدادات', icon: <Settings size={28} /> },
  ];

  return (
    /* lg:hidden -> يخفي هذا الشريط تماماً عندما تكون الشاشة كبيرة (ويندوز)
       h-16 -> ارتفاع ثابت للشريط
    */
    <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg pb-safe no-print z-50 h-16">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              title={item.label} // يظهر الاسم عند الضغط المطول فقط
              className={`flex flex-col items-center justify-center w-full h-full transition-all relative ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {/* مؤشر علوي (خط) يظهر فقط فوق الأيقونة النشطة */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-primary rounded-b-full"></span>
              )}

              {/* الأيقونة فقط (بدون نص) مع تكبير بسيط عند التفعيل */}
              <div className={`transform transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {item.icon}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
