import { read, utils } from 'xlsx';
import { Student } from '../types.ts';

export const parseExcelFile = async (file: File): Promise<Student[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = utils.sheet_to_json(worksheet);

        const students: Student[] = jsonData.map((row: any, index) => {
          // Flexible mapping: try to find common Arabic or English headers
          const name = row['الاسم'] || row['Name'] || row['اسم الطالب'] || 'غير معروف';
          const grade = row['الصف'] || row['Grade'] || row['المرحلة'] || '';
          const className = row['الفصل'] || row['Class'] || row['الشعبة'] || '';
          
          // Try to find phone number
          let phone = row['الهاتف'] || row['رقم الهاتف'] || row['الجوال'] || row['Phone'] || row['Mobile'] || '';
          phone = String(phone).trim();

          return {
            id: `student-${Date.now()}-${index}`,
            name: String(name).trim(),
            grade: String(grade).trim(),
            className: String(className).trim(),
            phone: phone
          };
        }).filter(s => s.name !== 'غير معروف');

        resolve(students);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};