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
        <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
          <span>{dayName}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};