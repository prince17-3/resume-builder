import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface PdfGenerationResult {
  pdf: jsPDF;
  blobUrl: string;
  blob: Blob;
  filename: string;
  download: () => void;
}

export async function generateResumePdf(
  element: HTMLElement,
  candidateName: string = 'Resume'
): Promise<PdfGenerationResult> {
  const cleanName = (candidateName || 'Resume').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanName}_Resume.pdf`;

  // Standard A4 dimensions in mm
  const a4WidthMm = 210;
  const a4HeightMm = 297;

  // Handle hidden elements (e.g., if mobile view has preview hidden)
  let targetElement = element;
  let offscreenContainer: HTMLDivElement | null = null;

  if (element.offsetWidth === 0 || !element.offsetParent) {
    offscreenContainer = document.createElement('div');
    offscreenContainer.style.position = 'fixed';
    offscreenContainer.style.top = '-99999px';
    offscreenContainer.style.left = '0';
    offscreenContainer.style.width = '210mm';
    offscreenContainer.style.minHeight = '297mm';
    offscreenContainer.style.zIndex = '-9999';
    offscreenContainer.style.backgroundColor = '#ffffff';

    const clonedResume = element.cloneNode(true) as HTMLElement;
    clonedResume.style.transform = 'none';
    clonedResume.style.display = 'block';
    clonedResume.style.visibility = 'visible';

    offscreenContainer.appendChild(clonedResume);
    document.body.appendChild(offscreenContainer);
    targetElement = clonedResume;
  }

  let canvas: HTMLCanvasElement;
  try {
    // Capture element using html2canvas-pro with high DPI scale
    canvas = await html2canvas(targetElement, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800, // Normalized desktop width for consistent layout
      onclone: (clonedDoc) => {
        // Remove any interactive UI, shadows, or zoom transforms in cloned render
        const clonedElement = clonedDoc.querySelector('.resume-paper-target') as HTMLElement | null;
        if (clonedElement) {
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.margin = '0';
          clonedElement.style.transform = 'none';
          if (clonedElement.parentElement) {
            clonedElement.parentElement.style.transform = 'none';
          }
        }
      },
    });
  } finally {
    if (offscreenContainer && offscreenContainer.parentNode) {
      offscreenContainer.parentNode.removeChild(offscreenContainer);
    }
  }

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgWidth = a4WidthMm;
  const pageHeight = a4HeightMm;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pageHeight;

  // If content spans multiple pages
  while (heightLeft > 5) {
    position = position - pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }

  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  const download = () => {
    try {
      pdf.save(filename);
    } catch {
      triggerDirectDownload(blob, filename);
    }
  };

  return {
    pdf,
    blobUrl,
    blob,
    filename,
    download,
  };
}

export function triggerDirectDownload(blob: Blob, filename: string, pdf?: jsPDF): void {
  if (pdf && typeof pdf.save === 'function') {
    try {
      pdf.save(filename);
      return;
    } catch {
      // fallback to blob link download
    }
  }

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}
