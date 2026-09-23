import React, { forwardRef } from 'react';
import { ResumeConfig, ResumeData } from '../types';
import { ModernTemplate } from './templates/ModernTemplate';
import { ExecutiveTemplate } from './templates/ExecutiveTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { TechTemplate } from './templates/TechTemplate';
import { NordicTemplate } from './templates/NordicTemplate';

interface ResumeDocumentProps {
  data: ResumeData;
  config: ResumeConfig;
  className?: string;
}

export const ResumeDocument = forwardRef<HTMLDivElement, ResumeDocumentProps>(
  ({ data, config, className = '' }, ref) => {
    const fontClass =
      config.fontStyle === 'serif'
        ? 'font-serif-elegant'
        : config.fontStyle === 'mono'
        ? 'font-mono-code'
        : 'font-sans-clean';

    const renderTemplate = () => {
      switch (config.templateId) {
        case 'executive':
          return <ExecutiveTemplate data={data} config={config} />;
        case 'creative':
          return <CreativeTemplate data={data} config={config} />;
        case 'tech':
          return <TechTemplate data={data} config={config} />;
        case 'nordic':
          return <NordicTemplate data={data} config={config} />;
        case 'modern':
        default:
          return <ModernTemplate data={data} config={config} />;
      }
    };

    return (
      <div
        ref={ref}
        id="resume-document-root"
        className={`resume-paper-target bg-white text-slate-900 mx-auto shadow-2xl transition-all duration-200 ${fontClass} ${className}`}
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '20mm 20mm',
          boxSizing: 'border-box',
          // Force light mode colors inside resume paper
          colorScheme: 'light',
        }}
      >
        {renderTemplate()}
      </div>
    );
  }
);

ResumeDocument.displayName = 'ResumeDocument';
