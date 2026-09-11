import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { JagoVoiceAssistant } from '../components/JagoVoiceAssistant';
import {
  ShieldCheck, Upload, Download, RefreshCw, CheckCircle2, AlertCircle,
  FileText, ExternalLink, X, Plus
} from 'lucide-react';

export const DocumentVaultPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docType, setDocType] = useState('Bonafide Certificate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // DigiLocker modal state
  const [digiLockerModalOpen, setDigiLockerModalOpen] = useState(false);
  const [availableDigiDocs, setAvailableDigiDocs] = useState<any[]>([]);
  const [importingUri, setImportingUri] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('docType', docType);
    formData.append('docName', selectedFile.name);

    try {
      await axios.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadModalOpen(false);
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      alert('Upload failed. Ensure file is under 5MB and in PDF, JPG, or PNG format.');
    } finally {
      setUploading(false);
    }
  };

  const openDigiLockerModal = async () => {
    setDigiLockerModalOpen(true);
    try {
      const res = await axios.get('/api/documents/digilocker/available');
      setAvailableDigiDocs(res.data.availableDocuments || []);
    } catch (e) {}
  };

  const handleImportDigiLocker = async (doc: any) => {
    setImportingUri(doc.uri);
    try {
      await axios.post('/api/documents/digilocker/import', {
        docUri: doc.uri,
        docType: doc.docType,
        docName: doc.name,
      });
      setDigiLockerModalOpen(false);
      fetchDocuments();
    } catch (err) {
      alert('DigiLocker import failed');
    } finally {
      setImportingUri(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
        {/* Title Header */}
        <div className="bg-gradient-to-r from-[#8B4513] via-[#5C2E0B] to-[#004466] text-white p-6 sm:p-8 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Cryptographically Secured
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">Student Digital Document Vault</h2>
            <p className="text-xs text-orange-200 mt-1">
              "Verify once. Reuse securely." All uploaded or DigiLocker-imported documents are automatically linked to your lifetime OTR profile.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="btn-accent text-xs px-4 py-2.5 font-bold shadow-md flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" /> Upload Document
            </button>

            <button
              onClick={openDigiLockerModal}
              className="bg-white hover:bg-gray-100 text-[#006699] text-xs px-4 py-2.5 rounded-md font-bold shadow-md flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" /> Fetch from DigiLocker
            </button>
          </div>
        </div>

        {/* Reusability Banner */}
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#8B4513] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-sm font-bold text-[#8B4513]">Document Reuse Protection Active:</strong>
            <p className="mt-0.5 leading-relaxed">
              When applying for another scholarship (e.g. Post-Matric or Top Class Education), your verified ST Certificate, Income Certificate, and Marksheets are automatically reused without requiring re-upload.
            </p>
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#8B4513] mb-2" />
            Loading Document Vault...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(doc => (
              <div key={doc.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between hover:shadow-lg transition">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
                      {doc.doc_type}
                    </span>
                    <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-300">
                      ✓ {doc.verification_status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug">{doc.doc_name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{doc.file_name}</p>

                  <div className="bg-gray-50 p-3 rounded-lg text-[11px] space-y-1 text-gray-600 border border-gray-100">
                    <p><strong>Verified By:</strong> {doc.verified_by}</p>
                    <p><strong>Source:</strong> {doc.digilocker_imported ? 'DigiLocker Import' : 'Manual Vault Upload'}</p>
                    <p><strong>Uploaded:</strong> {doc.uploaded_at.split(' ')[0]}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                  <span className="text-[#006699] font-bold flex items-center gap-1">
                    ✓ Reusable across 5 Schemes
                  </span>
                  <a href={doc.file_url} download className="text-gray-600 hover:text-[#8B4513] font-semibold flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> View/PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* UPLOAD MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-[#8B4513]">Upload Document to Vault</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Document Category</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs"
                >
                  <option value="Bonafide Certificate">Bonafide Certificate</option>
                  <option value="ST Certificate">ST Community Certificate</option>
                  <option value="Income Certificate">Income Certificate FY 2026-27</option>
                  <option value="Class 10/12 Marksheet">Class 10/12 Marksheet</option>
                  <option value="Fee Receipt">College Fee Receipt</option>
                  <option value="Bank Passbook">Bank Passbook (Aadhaar Seeded)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select File (PDF, JPG, PNG &lt; 5MB)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setUploadModalOpen(false)} className="btn-outline text-xs px-4 py-2">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="btn-primary text-xs px-6 py-2">
                  {uploading ? 'Uploading & Verifying...' : 'Upload & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGILOCKER MOCK AUTHORIZATION MODAL */}
      {digiLockerModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-bold text-base text-[#006699]">DigiLocker Authorization Adapter</h3>
                  <p className="text-[10px] text-gray-500">Official Government DigiLocker Verification Portal (Mock Demo)</p>
                </div>
              </div>
              <button onClick={() => setDigiLockerModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              DigiLocker has authorized access for student OTR: <strong className="font-mono text-[#8B4513]">{user?.otrId || 'OTR2026001234'}</strong>. Select documents to import cryptographically verified certificates directly into your vault:
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {availableDigiDocs.map((doc, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs flex justify-between items-center gap-3">
                  <div>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {doc.docType}
                    </span>
                    <h4 className="font-bold text-gray-900 mt-1">{doc.name}</h4>
                    <p className="text-[10px] text-gray-500">Issuer: {doc.issuer}</p>
                  </div>

                  <button
                    onClick={() => handleImportDigiLocker(doc)}
                    disabled={importingUri === doc.uri}
                    className="btn-primary text-xs px-3 py-1.5 font-bold whitespace-nowrap"
                  >
                    {importingUri === doc.uri ? 'Importing...' : 'Import to Vault'}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-3 rounded text-[11px] text-blue-900 border border-blue-200">
              <strong>Notice:</strong> Documents imported via DigiLocker carry digital cryptographic signatures and are automatically classified as <strong>VERIFIED</strong>.
            </div>
          </div>
        </div>
      )}

      <JagoVoiceAssistant />
      <Footer />
    </div>
  );
};
