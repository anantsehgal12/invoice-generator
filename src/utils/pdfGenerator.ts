import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface PDFGeneratorOptions {
  filename?: string;
  scale?: number;
  quality?: number;
  margin?: number;
}

export const generatePDF = async (
  element: HTMLElement,
  options: PDFGeneratorOptions = {}
): Promise<void> => {
  const {
    filename = 'invoice.pdf',
    scale = 3, // Increased scale for better quality
    quality = 1,
    margin = 10
  } = options;

  try {
    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      height: element.scrollHeight,
      width: element.scrollWidth,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 15000, // Increased timeout for images
      onclone: (doc) => {
        const style = doc.createElement('style');
        style.setAttribute('data-pdf-overrides', 'true');
        style.textContent = `
          .pdf-safe, .pdf-safe * {
            color-scheme: light !important;
            box-shadow: none !important;
            background-image: none !important;
            text-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .pdf-safe {
            background-color: #ffffff !important;
            color: #111827 !important;
          }

          /* Text colors - comprehensive mapping */
          .pdf-safe .text-gray-900,
          .pdf-safe .text-gray-900 * { color: #111827 !important; }
          .pdf-safe .text-gray-800,
          .pdf-safe .text-gray-800 * { color: #1f2937 !important; }
          .pdf-safe .text-gray-700,
          .pdf-safe .text-gray-700 * { color: #374151 !important; }
          .pdf-safe .text-gray-600,
          .pdf-safe .text-gray-600 * { color: #4b5563 !important; }
          .pdf-safe .text-gray-500,
          .pdf-safe .text-gray-500 * { color: #6b7280 !important; }
          .pdf-safe .text-gray-400,
          .pdf-safe .text-gray-400 * { color: #9ca3af !important; }
          .pdf-safe .text-blue-600,
          .pdf-safe .text-blue-600 * { color: #2563eb !important; }
          .pdf-safe .text-blue-300,
          .pdf-safe .text-blue-300 * { color: #93c5fd !important; }
          .pdf-safe .text-green-600,
          .pdf-safe .text-green-600 * { color: #16a34a !important; }
          .pdf-safe .text-red-600,
          .pdf-safe .text-red-600 * { color: #dc2626 !important; }
          .pdf-safe .text-red-300,
          .pdf-safe .text-red-300 * { color: #fca5a5 !important; }
          .pdf-safe .text-black,
          .pdf-safe .text-black * { color: #000000 !important; }
          .pdf-safe .text-white,
          .pdf-safe .text-white * { color: #ffffff !important; }
          .pdf-safe .text-slate-200,
          .pdf-safe .text-slate-200 * { color: #000000 !important; }

          /* Background colors */
          .pdf-safe .bg-white,
          .pdf-safe .bg-white * { background-color: #ffffff !important; }
          .pdf-safe .bg-slate-800,
          .pdf-safe .bg-slate-800 * { background-color: #1e293b !important; }
          .pdf-safe .bg-gray-50,
          .pdf-safe .bg-gray-50 * { background-color: #f9fafb !important; }
          .pdf-safe .bg-gray-100,
          .pdf-safe .bg-gray-100 * { background-color: #f3f4f6 !important; }
          .pdf-safe .bg-gray-200,
          .pdf-safe .bg-gray-200 * { background-color: #e5e7eb !important; }

          /* Borders */
          .pdf-safe .border-gray-300,
          .pdf-safe .border-gray-300 * { border-color: #d1d5db !important; }


          /* Force all text to be black for PDF */
          .pdf-safe * { color: #000000 !important; }

          /* Specific overrides for invoice elements */
          .pdf-safe h1, .pdf-safe h2, .pdf-safe h3, .pdf-safe h4 { color: #000000 !important; }
          .pdf-safe table th { background-color: #1e293b !important; color: #ffffff !important; }
          .pdf-safe .bg-slate-800 { background-color: #1e293b !important; }
          .pdf-safe .text-blue-300 { color: #1456a0 !important; }

          /* Ensure proper table styling */
          .pdf-safe table, .pdf-safe th, .pdf-safe td {
            border: 1px solid #334155 !important;
            border-collapse: collapse !important;
          }
        `;
        doc.head.appendChild(style);
      }
    });

    const imgData = canvas.toDataURL('image/png', quality);

    // Create A4 portrait PDF strictly
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    // Compute image size in mm keeping aspect ratio
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;
    const imgWidthMm = availableWidth; // fit width to page
    const imgHeightMm = (imgHeightPx * imgWidthMm) / imgWidthPx; // scale height accordingly

    // Add first page
    pdf.addImage(
      imgData,
      'PNG',
      margin,
      margin,
      imgWidthMm,
      imgHeightMm,
      undefined,
      'FAST'
    );

    // Paginate if content height exceeds one page
    let heightLeft = imgHeightMm - availableHeight;
    let position = margin; // top margin for first page

    while (heightLeft > 0) {
      pdf.addPage(); // same A4 portrait
      position = margin - (imgHeightMm - heightLeft); // shift up to show next slice
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position,
        imgWidthMm,
        imgHeightMm,
        undefined,
        'FAST'
      );
      heightLeft -= availableHeight;
    }

    // Save the PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const downloadPDF = async (
  element: HTMLElement,
  filename: string = 'document.pdf'
): Promise<void> => {
  await generatePDF(element, { filename });
};

// Helper function to ensure element is ready for PDF generation
export const prepareElementForPDF = async (element: HTMLElement): Promise<void> => {
  // Ensure all images are loaded
  const images = element.getElementsByTagName('img');
  const imagePromises = Array.from(images).map((img) => {
    return new Promise<HTMLImageElement>((resolve) => {
      if (img.complete) {
        resolve(img);
      } else {
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
      }
    });
  });
  
  await Promise.all(imagePromises);
  // Add any additional preparation logic here
};
