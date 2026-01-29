import React from 'react';

interface HeaderProps {
  currentDate?: string;
  managerName?: string;
  setManagerName?: (name: string) => void;
  schoolName?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentDate, schoolName = "اسم المدرسة" }) => {
  const dateObj = new Date();
  const dayName = dateObj.toLocaleDateString('ar-SA', { weekday: 'long' });
  const formattedDate = dateObj.toLocaleDateString('ar-SA', { year: 'numeric', month: 'numeric', day: 'numeric' });

  return (
    <div className="w-full mb-6 border-b-2 border-primary pb-4">
      <div className="text-center">
        {/* Main Title Centered and Large */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
          سجل المتأخرين اليومي
        </h1>
        {/* School Name Below */}
        <h2 className="text-xl font-medium text-gray-700 mb-4">
          {schoolName}
        </h2>

        {/* Date Info Small */}
        <div className="fixed md:sticky top-0 z-40 md:z-30 bg-[#1e3a8a] text-white shadow-lg px-4 pt-[env(safe-area-inset-top)] pb-6 transition-all duration-300 rounded-b-[2.5rem] md:rounded-none md:shadow-md w-full md:w-auto left-0 right-0 md:left-auto md:right-auto">
          <span>{dayName}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};
