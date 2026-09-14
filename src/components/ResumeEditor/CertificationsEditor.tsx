import React from 'react';
import { CertificationItem } from '../../types';
import { Plus, Trash2, Award } from 'lucide-react';

interface Props {
  certifications: CertificationItem[];
  onChange: (updated: CertificationItem[]) => void;
}

export const CertificationsEditor: React.FC<Props> = ({ certifications, onChange }) => {
  const handleAdd = () => {
    const newCert: CertificationItem = {
      id: 'cert_' + Date.now(),
      name: '',
      issuer: '',
      issueDate: '',
      credentialUrl: '',
    };
    onChange([...certifications, newCert]);
  };

  const handleRemove = (id: string) => {
    onChange(certifications.filter((c) => c.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<CertificationItem>) => {
    onChange(certifications.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500">Licenses, professional certifications, or awards.</p>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Certification
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <Award className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs text-slate-500">No certifications added.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div key={cert.id} className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-2.5 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  {cert.name || 'Certification Name'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(cert.id)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Certification Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => handleUpdate(cert.id, { name: e.target.value })}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Issuing Organization <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => handleUpdate(cert.id, { issuer: e.target.value })}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Issue Date</label>
                  <input
                    type="text"
                    value={cert.issueDate}
                    onChange={(e) => handleUpdate(cert.id, { issueDate: e.target.value })}
                    placeholder="e.g. Oct 2023 or 2023"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Credential URL / ID</label>
                  <input
                    type="text"
                    value={cert.credentialUrl || ''}
                    onChange={(e) => handleUpdate(cert.id, { credentialUrl: e.target.value })}
                    placeholder="e.g. verify link or ID"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
