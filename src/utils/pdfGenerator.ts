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
    canvas = await html2canvas(targetElement, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800,
      onclone: (clonedDoc) => {
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

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgWidth = a4WidthMm;

  // Page margins in mm — same on all sides, like a Word document default
  const marginMm = 18; // ~18mm ≈ 0.7 inch top/bottom margin per page

  // Convert margin from mm → canvas pixels using the canvas's own width-to-mm ratio
  const pxPerMm = canvas.width / a4WidthMm;
  const marginPx = Math.round(marginMm * pxPerMm);

  // How many canvas pixels of *content* fit inside one page after removing top+bottom margins
  const contentHeightPx = Math.floor((a4HeightMm / a4WidthMm) * canvas.width) - marginPx * 2;
  const totalPages = Math.ceil(canvas.height / contentHeightPx);

  // Content area height in mm (page height minus both margins)
  const contentHeightMm = a4HeightMm - marginMm * 2;

  // Full page canvas height in px (unchanged — always the full A4 proportional height)
  const fullPageHeightPx = Math.floor((a4HeightMm / a4WidthMm) * canvas.width);

  for (let page = 0; page < totalPages; page++) {
    // Source slice: where in the original canvas this page's content starts
    const srcY = page * contentHeightPx;
    const srcH = Math.min(contentHeightPx, canvas.height - srcY);

    // Create a full A4-height white canvas
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = fullPageHeightPx;
    const ctx = pageCanvas.getContext('2d')!;

    // Fill entire page white (covers margins + any short last-page content)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    // Draw content starting at marginPx from the top, leaving equal bottom margin
    ctx.drawImage(
      canvas,
      0, srcY,           // source: x, y in the full canvas
      canvas.width, srcH, // source: width, height to copy
      0, marginPx,        // dest: x, y on the page canvas (top margin offset)
      canvas.width, srcH  // dest: width, height (same scale — no stretch)
    );

    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.97);

    if (page > 0) pdf.addPage();
    // Place content image inset by marginMm on all sides within the PDF page
    pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, a4HeightMm, undefined, 'FAST');
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

  return { pdf, blobUrl, blob, filename, download };
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
