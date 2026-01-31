import mammoth from 'mammoth';
import { Student } from '../types';

export const parseWordFile = async (file: File): Promise<Student[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const tables = doc.querySelectorAll('table');
      
      const students: Student[] = [];
      
      tables.forEach((table) => {
        const rows = table.querySelectorAll('tr');
        
        if (rows.length < 1) return;
        
        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 1) return;

          const rowData: string[] = [];
          cells.forEach(cell => rowData.push(cell.innerText.trim()));

          let name = '';
          let phone = '';
          let grade = '';
          let className = '';

          if (rowData.some(t => t.includes('الاسم') || t.includes('Name'))) {
             return; 
          }

          for (const cellText of rowData) {
            const phoneMatch = cellText.match(/[\d\+\s-]{8,15}/);
            if (phoneMatch && !phone) {
               const cleanNum = cellText.replace(/\D/g, '');
               if (cleanNum.length >= 8) {
                 phone = cleanNum;
                 continue;
               }
            }

            if (!name && /^[\u0600-\u06FF\s]{5,}$/.test(cellText)) {
              name = cellText;
              continue;
            }
            
            if (!name && /^[a-zA-Z\s]{5,}$/.test(cellText)) {
              name = cellText;
              continue;
            }
          }

          if (name) {
            students.push({
              id: `std-word-${Date.now()}-${Math.random()}`,
              name: name,
              grade: grade, 
              className: className, 
              phone: phone
            });
          }
        });
      });

      if (students.length === 0) {
        const paragraphs = doc.querySelectorAll('p');
        paragraphs.forEach(p => {
           const text = p.innerText.trim();
           const nameMatch = text.match(/([\u0600-\u06FF\s]{5,})/);
           const phoneMatch = text.match(/(\d{8,})/);

           if (nameMatch && phoneMatch) {
              students.push({
                id: `std-word-p-${Date.now()}-${Math.random()}`,
                name: nameMatch[0].trim(),
                grade: '',
                className: '',
                phone: phoneMatch[0].trim()
              });
           }
        });
      }

      resolve(students);
    } catch (error) {
      console.error("Word parsing error", error);
      reject(error);
    }
  });
};