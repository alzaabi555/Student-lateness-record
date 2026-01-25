import React from 'react';
import { AppSettings, Student, LateRecord } from '../types';
import { Save, Download, Upload, Trash, Image as ImageIcon, X } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  students: Student[];
  records: LateRecord[];
  onImport: (data: any) => void;
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  settings, setSettings, students, records, onImport, onClearData 
}) => {

  const handleExport = () => {
    const data = {
      version: 1,
      timestamp: new Date().toISOString(),
      settings,
      students,
      records
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_school_records_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        onImport(json);
      } catch (err) {
        alert('فشل في قراءة ملف النسخة الاحتياطية');
      }
    };
    reader.readAsText(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB Limit
      alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings({ ...settings, logoDataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSettings({ ...settings, logoDataUrl: undefined });
  };

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">الإعدادات والبيانات</h2>

      {/* General Settings */}
      <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <Save size={18} />
          بيانات المدرسة
        </h3>
        
        {/* Logo Upload Section */}
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3 w-full text-right">شعار المدرسة</label>
          
          {settings.logoDataUrl ? (
            <div className="relative group">
              <img 
                src={settings.logoDataUrl} 
                alt="School Logo" 
                className="w-24 h-24 object-contain bg-white rounded-full shadow-md border"
              />
              <button 
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition"
                title="حذف الشعار"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-2">
              <ImageIcon size={32} />
            </div>
          )}

          <div className="mt-4">
             <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition shadow-sm">
               <span>{settings.logoDataUrl ? 'تغيير الشعار' : 'رفع شعار'}</span>
               <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
             </label>
             <p className="text-xs text-gray-400 mt-2 text-center">أقصى حجم 2MB</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-500 mb-1">اسم المدرسة</label>
            <input 
              type="text" 
              value={settings.schoolName}
              onChange={(e) => setSettings({...settings, schoolName: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">اسم مدير المدرسة</label>
            <input 
              type="text" 
              value={settings.managerName}
              onChange={(e) => setSettings({...settings, managerName: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">اسم مشرف السجل</label>
            <input 
              type="text" 
              value={settings.supervisorName}
              onChange={(e) => setSettings({...settings, supervisorName: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </section>

      {/* Backup & Restore */}
      <section className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-700">النسخ الاحتياطي والأرشفة</h3>
        <p className="text-sm text-gray-500">قم بتنزيل نسخة كاملة من البيانات لحفظها خارجيًا.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 p-4 rounded-lg hover:bg-blue-100 transition"
          >
            <Download size={20} />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg hover:bg-green-100 transition cursor-pointer">
            <Upload size={20} />
            <span>استعادة نسخة احتياطية</span>
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4 bg-red-50 p-6 rounded-xl border border-red-100">
        <h3 className="font-bold text-red-700 flex items-center gap-2">
          <Trash size={18} />
          منطقة الخطر
        </h3>
        <p className="text-sm text-red-600">سيؤدي هذا إلى حذف جميع سجلات الطلاب والتأخير بشكل دائم.</p>
        <button 
          onClick={onClearData}
          className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition w-full md:w-auto"
        >
          حذف جميع البيانات
        </button>
      </section>
    </div>
  );
};