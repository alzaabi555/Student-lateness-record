import mammoth from 'mammoth';
import { Student } from '../types.ts';

export const parseWordFile = async (file: File): Promise<Student[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Convert Word Doc to HTML to easily parse Tables
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      // Use DOMParser to walk through the HTML structure
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const tables = doc.querySelectorAll('table');
      
      const students: Student[] = [];
      
      // Iterate over all tables found in the document
      tables.forEach((table) => {
        const rows = table.querySelectorAll('tr');
        
        // Skip empty tables
        if (rows.length < 1) return;

        // Try to identify columns based on header (first row) or assume structure
        // Strategy: Look for the column with Arab text (Name) and column with Digits (Phone)
        
        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 1) return;

          const rowData: string[] = [];
          cells.forEach(cell => rowData.push(cell.innerText.trim()));

          // Simple Heuristic:
          // 1. Name is usually the longest string with Arabic characters.
          // 2. Phone is a string with digits, length between 7-15.
          // 3. Grade/Class are shorter strings.

          let name = '';
          let phone = '';
          let grade = '';
          let className = '';

          // Skip header row if it contains "الاسم"
          if (rowData.some(t => t.includes('الاسم') || t.includes('Name'))) {
             return; 
          }

          for (const cellText of rowData) {
            // Check for Phone (Digits, at least 8)
            const phoneMatch = cellText.match(/[\d\+\s-]{8,15}/);
            if (phoneMatch && !phone) {
               // Verify it's not just a serial number (1, 2, 3)
               const cleanNum = cellText.replace(/\D/g, '');
               if (cleanNum.length >= 8) {
                 phone = cleanNum;
                 continue;
               }
            }

            // Check for Name (Arabic text, spaces, length > 5)
            // Exclude purely numeric strings
            if (!name && /^[\u0600-\u06FF\s]{5,}$/.test(cellText)) {
              name = cellText;
              continue;
            }
            
            // Fallback for English names
            if (!name && /^[a-zA-Z\s]{5,}$/.test(cellText)) {
              name = cellText;
              continue;
            }
          }

          // If we found a name, add the student
          if (name) {
            students.push({
              id: `std-word-${Date.now()}-${Math.random()}`,
              name: name,
              grade: grade, // Left empty to be filled by "Manual Import" settings in UI
              className: className, // Left empty to be filled by "Manual Import" settings in UI
              phone: phone
            });
          }
        });
      });

      if (students.length === 0) {
        // Fallback: Try parsing paragraphs as a list (Name - Phone)
        const paragraphs = doc.querySelectorAll('p');
        paragraphs.forEach(p => {
           const text = p.innerText.trim();
           // Regex to find "Name ... Number" or "Number ... Name"
           // Arabic Name capture group
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