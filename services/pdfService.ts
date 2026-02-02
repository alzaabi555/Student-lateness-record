import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export const generateAndSharePDF = async (containerId: string, fileName: string): Promise<void> => {
  const container = document.getElementById(containerId);
  if (!container) throw new Error('Element not found');

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    // const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // 1. Check for explicit "pdf-page" elements inside the container
    // This allows the React component to handle the logic of "what goes on which page"
    const pages = container.querySelectorAll('.pdf-page');

    if (pages.length > 0) {
      // MULTI-PAGE LOGIC: Capture each page separately
      for (let i = 0; i < pages.length; i++) {
        const pageElement = pages[i] as HTMLElement;
        
        // Capture logic
        // windowWidth: 1200 ensures the layout thinks it's on a desktop/paper width, avoiding mobile breakpoints
        const canvas = await html2canvas(pageElement, {
          scale: 2, // High resolution
          useCORS: true,
          allowTaint: true,
          scrollY: 0,
          windowWidth: 1200, 
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95); // Slightly compressed JPEG for smaller file size
        const imgProps = pdf.getImageProperties(imgData);
        
        // Calculate height to fit width (maintain aspect ratio)
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Add page if it's not the first one
        if (i > 0) pdf.addPage();
        
        // Add image to PDF (x, y, width, height)
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
      }
    } else {
      // FALLBACK: Single long page logic (Legacy support)
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollY: 0,
        windowWidth: 1200,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }

    // 2. Save and Share logic
    if (Capacitor.isNativePlatform()) {
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      const safeFileName = `${fileName.replace(/\s/g, '_')}_${Date.now()}.pdf`;

      const result = await Filesystem.writeFile({
        path: safeFileName,
        data: pdfBase64,
        directory: Directory.Cache
      });

      await Share.share({
        title: fileName,
        text: `مرفق تقرير: ${fileName}`,
        url: result.uri,
        dialogTitle: 'مشاركة التقرير PDF'
      });
    } else {
      // Browser fallback
      pdf.save(`${fileName}.pdf`);
    }

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};