import React from 'react';
import { Download, Printer, X, FileCheck, ExternalLink } from 'lucide-react';
import { PdfGenerationResult, triggerDirectDownload } from '../utils/pdfGenerator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pdfResult: PdfGenerationResult | null;
  candidateName: string;
}

export const PdfViewerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  pdfResult,
  candidateName,
}) => {
  if (!isOpen || !pdfResult) return null;

  const handleDownload = () => {
    if (pdfResult.download) {
      pdfResult.download();
    } else {
      triggerDirectDownload(pdfResult.blob, pdfResult.filename, pdfResult.pdf);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 no-print">
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl h-[90vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Generated PDF Preview</h3>
              <p className="text-xs text-slate-500">{pdfResult.filename}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
              title="Print directly or save as vector PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / PDF Object Viewer */}
        <div className="flex-1 bg-slate-800 p-2 overflow-hidden flex flex-col items-center justify-center relative">
          <iframe
            src={`${pdfResult.blobUrl}#view=FitH&toolbar=1`}
            title="Resume PDF Viewer"
            className="w-full h-full rounded-lg border border-slate-700 bg-white"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready for view and instant download.</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={pdfResult.blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
            >
              Open in new tab <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={handleDownload}
              className="text-slate-900 font-semibold hover:text-blue-600"
            >
              Save file
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
