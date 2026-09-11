import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { JagoVoiceAssistant } from '../components/JagoVoiceAssistant';
import { HelpCircle, AlertCircle, CheckCircle2, FileText, Send, Clock } from 'lucide-react';

export const GrievancePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [category, setCategory] = useState('Application issue');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      axios.get('/api/grievances')
        .then(res => setGrievances(res.data.grievances || []))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/api/grievances', {
        category,
        subject,
        description,
      });

      if (res.data.success) {
        setSubmittedTicket(res.data.ticketNo);
        setSubject('');
        setDescription('');
        if (isAuthenticated) {
          axios.get('/api/grievances').then(r => setGrievances(r.data.grievances || []));
        }
      }
    } catch (err) {
      alert('Grievance submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="bg-amber-100 text-[#8B4513] text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
            MoTA Grievance Redressal Cell
          </span>
          <h2 className="text-3xl font-extrabold text-[#8B4513] mt-2">
            Submit a Helpdesk Ticket
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Facing application delay, document verification issue, or payment discrepancy? Submit a ticket for 48-hour Nodal Officer resolution.
          </p>
        </div>

        {submittedTicket && (
          <div className="bg-green-50 p-6 rounded-xl border border-green-300 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
            <h3 className="font-bold text-green-900 text-base">Grievance Ticket Created!</h3>
            <p className="text-xs text-green-700">
              Ticket Number: <strong className="font-mono text-sm">{submittedTicket}</strong>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Submission Form */}
          <form onSubmit={handleSubmitGrievance} className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 space-y-4">
            <h3 className="text-lg font-bold text-[#8B4513] border-b pb-3 flex items-center gap-2">
              <Send className="w-5 h-5 text-[#E67E22]" /> Register Grievance
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Issue Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513]"
              >
                <option value="Application issue">Application Delay / Issue</option>
                <option value="Document issue">Document Verification Issue</option>
                <option value="Verification issue">Institutional Nodal Verification Delay</option>
                <option value="Payment issue">DBT Payment / Bank Credit Issue</option>
                <option value="Technical issue">Technical / OTR Portal Error</option>
                <option value="Other">Other Query</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Brief</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Income certificate expiry query"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Description</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your issue in detail including college name or application ID..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513]"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-xs font-bold shadow-md">
              {loading ? 'Registering Ticket...' : 'Submit Grievance Ticket'}
            </button>
          </form>

          {/* Ticket History */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 space-y-4">
            <h3 className="text-lg font-bold text-[#8B4513] border-b pb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#E67E22]" /> Ticket History
            </h3>

            {grievances.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">
                No active grievance tickets found.
              </p>
            ) : (
              <div className="space-y-3">
                {grievances.map(grv => (
                  <div key={grv.id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-[#006699]">{grv.ticket_no}</span>
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {grv.status}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900">{grv.subject}</p>
                    <p className="text-gray-600 text-[11px]">{grv.description}</p>
                    {grv.resolution && (
                      <div className="bg-white p-2 rounded border border-gray-200 text-green-800 text-[11px] mt-1">
                        <strong>Resolution:</strong> {grv.resolution}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <JagoVoiceAssistant />
      <Footer />
    </div>
  );
};
