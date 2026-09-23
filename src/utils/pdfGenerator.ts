import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface PdfGenerationResult {
  pdf: jsPDF;
  blobUrl: string;
  blob: Blob;
  filename: string;
  download: () => void;
}

// Helper: find clean white horizontal row to avoid cutting text or headers in half
function findBestBreakRow(
  canvas: HTMLCanvasElement,
  minY: number,
  maxY: number
): number {
  if (maxY <= minY) return maxY;
  const ctx = canvas.getContext('2d');
  if (!ctx) return maxY;

  const searchHeight = maxY - minY;
  try {
    const imgData = ctx.getImageData(0, minY, canvas.width, searchHeight);
    const data = imgData.data;
    const width = canvas.width;

    // Scan inward from margins (ignore outermost 12% on left/right where there's no text)
    const leftX = Math.floor(width * 0.12);
    const rightX = Math.floor(width * 0.88);
    const stepX = 4; // Check every 4th pixel across for speed

    let bestRow = maxY;
    let minDarkPixels = Infinity;

    // Search from maxY (bottom of window) backwards to minY (top of window)
    for (let row = searchHeight - 1; row >= 0; row--) {
      let darkPixels = 0;
      const rowOffset = row * width * 4;

      for (let x = leftX; x < rightX; x += stepX) {
        const idx = rowOffset + x * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        // Any non-white pixel is text, border, icon, or accent color
        if (a > 30 && (r < 242 || g < 242 || b < 242)) {
          darkPixels++;
        }
      }

      // Found a completely white horizontal line! (natural gap between sections or bullet points)
      if (darkPixels === 0) {
        return minY + row;
      }

      if (darkPixels < minDarkPixels) {
        minDarkPixels = darkPixels;
        bestRow = minY + row;
      }
    }

    return bestRow;
  } catch {
    return maxY;
  }
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

  // Page margins in mm — matches the 20mm padding of ResumeDocument
  const marginMm = 20;
  const pxPerMm = canvas.width / a4WidthMm;
  const fullPageHeightPx = Math.floor((a4HeightMm / a4WidthMm) * canvas.width);
  const topMarginPx = Math.round(marginMm * pxPerMm);
  const bottomMarginPx = Math.round(marginMm * pxPerMm);
  const searchWindowPx = Math.round(35 * pxPerMm); // 35mm search window for natural breaks

  // Maximum content height for page 1 (since top padding is already inside canvas)
  const maxPage1ContentHeight = fullPageHeightPx - bottomMarginPx;

  // Maximum content height for page 2+ (reserves topMarginPx at top AND bottomMarginPx at bottom)
  const maxSubsequentContentHeight = fullPageHeightPx - topMarginPx - bottomMarginPx;

  let currentY = 0;
  let pageIndex = 0;

  while (currentY < canvas.height) {
    let sliceHeight: number;
    let destY: number;

    if (pageIndex === 0) {
      // Page 1:
      // The top 20mm is already in canvas from ResumeDocument padding.
      destY = 0;

      const remaining = canvas.height - currentY;
      if (remaining <= fullPageHeightPx) {
        // Fits on Page 1 entirely
        sliceHeight = remaining;
      } else {
        // Multi-page: find the best clean break row before the bottom margin
        const targetBreak = currentY + maxPage1ContentHeight;
        const searchMin = Math.max(currentY + 200, targetBreak - searchWindowPx);
        const breakY = findBestBreakRow(canvas, searchMin, targetBreak);
        sliceHeight = breakY - currentY;
      }
    } else {
      // Page 2+:
      // Content does NOT have top padding, so we place it at destY = topMarginPx.
      // This produces the EXACT SAME header line spacing as the first page!
      destY = topMarginPx;

      const remaining = canvas.height - currentY;
      if (remaining <= maxSubsequentContentHeight) {
        // Fits on this final page
        sliceHeight = remaining;
      } else {
        // More pages follow: find the best clean break row
        const targetBreak = currentY + maxSubsequentContentHeight;
        const searchMin = Math.max(currentY + 200, targetBreak - searchWindowPx);
        const breakY = findBestBreakRow(canvas, searchMin, targetBreak);
        sliceHeight = breakY - currentY;
      }
    }

    // Create a full A4-height white canvas for this page
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = fullPageHeightPx;
    const ctx = pageCanvas.getContext('2d')!;

    // Fill entire page white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    // Draw content slice
    ctx.drawImage(
      canvas,
      0, currentY,              // source x, y
      canvas.width, sliceHeight,// source w, h
      0, destY,                 // dest x, y (topMarginPx for page 2+, 0 for page 1)
      canvas.width, sliceHeight // dest w, h
    );

    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);

    if (pageIndex > 0) {
      pdf.addPage();
    }
    pdf.addImage(pageImgData, 'JPEG', 0, 0, a4WidthMm, a4HeightMm, undefined, 'FAST');

    currentY += sliceHeight;
    pageIndex++;

    // Safety guard against 0-height infinite loops
    if (sliceHeight <= 0) break;
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
