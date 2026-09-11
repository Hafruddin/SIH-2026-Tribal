import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { JagoVoiceAssistant } from '../components/JagoVoiceAssistant';
import { ReadAloudButton } from '../components/ReadAloudButton';
import { TimelineTracker } from '../components/TimelineTracker';
import {
  FileText, ShieldCheck, CreditCard, Bell, User, BookOpen, AlertCircle, CheckCircle2,
  Upload, ExternalLink, RefreshCw, IndianRupee, Clock, PlusCircle
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'applications' | 'vault' | 'payments' | 'profile' | 'notifications'>('applications');
  const [student, setStudent] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedAppTimeline, setSelectedAppTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profRes, appRes, docRes, payRes, notifRes] = await Promise.all([
        axios.get('/api/student/profile'),
        axios.get('/api/applications'),
        axios.get('/api/documents'),
        axios.get('/api/payments'),
        axios.get('/api/notifications'),
      ]);

      setStudent(profRes.data.student);
      setApplications(appRes.data.applications || []);
      setDocuments(docRes.data.documents || []);
      setPayments(payRes.data.payments || []);
      setNotifications(notifRes.data.notifications || []);

      if (appRes.data.applications?.length > 0) {
        fetchTimeline(appRes.data.applications[0].id);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (appId: string) => {
    try {
      const res = await axios.get(`/api/applications/${appId}`);
      setSelectedAppTimeline(res.data);
    } catch (e) {}
  };

  const totalFunds = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingDocsCount = documents.filter(d => d.verification_status !== 'VERIFIED').length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin text-[#8B4513] mr-3" />
          <span className="font-semibold text-sm">Loading Student Portal Dashboard...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-6">
        {/* Student Profile Header Bar */}
        <div className="bg-gradient-to-r from-[#8B4513] via-[#5C2E0B] to-[#004466] text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-[#E67E22] text-white font-bold text-2xl rounded-full flex items-center justify-center border-2 border-white shadow-md">
              {student?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold">{student?.full_name || 'Aarav Kumar'}</h2>
                <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ST Verified
                </span>
              </div>
              <p className="text-xs text-orange-200 mt-0.5">
                OTR Lifetime Portal ID: <strong className="font-mono text-white text-sm">{student?.otr_id || 'OTR2026001234'}</strong> | Domicile: <strong>{student?.state}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-white/10 px-3.5 py-2 rounded-lg border border-white/20 text-center">
              <span className="text-[10px] text-gray-200 block uppercase font-medium">Profile Integrity</span>
              <span className="text-sm font-extrabold text-green-300">100% Completed</span>
            </div>

            <Link
              to="/schemes"
              className="btn-accent text-xs font-bold py-2.5 px-4 shadow-md hover:scale-105 transition"
            >
              <PlusCircle className="w-4 h-4" /> Apply Scheme
            </Link>
          </div>
        </div>

        {/* Four Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Active Applications</p>
              <h3 className="text-2xl font-black text-[#8B4513] mt-1">{applications.length}</h3>
            </div>
            <div className="w-10 h-10 bg-amber-100 text-[#8B4513] rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Scholarships Disbursed</p>
              <h3 className="text-2xl font-black text-[#006699] mt-1">{payments.length}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 text-[#006699] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Pending Actions</p>
              <h3 className={`text-2xl font-black mt-1 ${pendingDocsCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {pendingDocsCount}
              </h3>
            </div>
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Total Funds Received</p>
              <h3 className="text-2xl font-black text-green-700 mt-1">₹{totalFunds.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-white px-4 rounded-t-xl overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3.5 px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'applications' ? 'border-[#8B4513] text-[#8B4513]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> My Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`py-3.5 px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vault' ? 'border-[#8B4513] text-[#8B4513]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Document Vault ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3.5 px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'payments' ? 'border-[#8B4513] text-[#8B4513]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <CreditCard className="w-4 h-4" /> DBT Disbursal ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3.5 px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'notifications' ? 'border-[#8B4513] text-[#8B4513]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications ({notifications.length})
          </button>
        </div>

        {/* TAB 1: APPLICATIONS TABLE & TRACKER */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-b-xl shadow-md border border-t-0 border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider border-b">
                    <tr>
                      <th className="p-4">Scheme Name</th>
                      <th className="p-4">Application ID</th>
                      <th className="p-4">Academic Year</th>
                      <th className="p-4">Current Status</th>
                      <th className="p-4">Last Updated</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-bold text-gray-900">{app.scheme_name}</td>
                        <td className="p-4 font-mono font-semibold text-[#006699]">{app.application_no}</td>
                        <td className="p-4 text-gray-600">{app.academic_year}</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              app.current_status === 'Disbursed' || app.current_status === 'Sanctioned'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {app.current_status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">{app.updated_at.split(' ')[0]}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => fetchTimeline(app.id)}
                            className="bg-[#006699] hover:bg-[#004466] text-white px-3 py-1.5 rounded text-xs font-semibold"
                          >
                            View Timeline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timeline Stepper Component for Selected Application */}
            {selectedAppTimeline && (
              <TimelineTracker
                currentStatus={selectedAppTimeline.application.current_status}
                timelineEvents={selectedAppTimeline.timeline}
              />
            )}
          </div>
        )}

        {/* TAB 2: DOCUMENT VAULT & REUSE */}
        {activeTab === 'vault' && (
          <div className="bg-white p-6 rounded-b-xl shadow-md border border-t-0 border-gray-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#8B4513] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  Digital Document Vault
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verify once. Securely reuse these verified documents across all 5 MoTA scholarship schemes.
                </p>
              </div>

              <div className="flex gap-3">
                <Link to="/student/documents" className="btn-primary text-xs px-4 py-2">
                  <Upload className="w-4 h-4" /> Upload Document
                </Link>
                <Link to="/student/documents" className="btn-outline text-xs px-4 py-2">
                  Fetch from DigiLocker
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map(doc => (
                <div key={doc.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {doc.doc_type}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1">{doc.doc_name}</h4>
                    <p className="text-gray-500 text-[11px]">Verified by: {doc.verified_by}</p>
                    <p className="text-[10px] text-gray-400">Uploaded: {doc.uploaded_at.split(' ')[0]}</p>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-300">
                      ✓ {doc.verification_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DBT DISBURSAL PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="bg-white p-6 rounded-b-xl shadow-md border border-t-0 border-gray-200 space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold text-[#8B4513] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Direct Benefit Transfer (DBT) Payment Records
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Funds are transferred directly to your Aadhaar-seeded bank account.
              </p>
            </div>

            <div className="space-y-4">
              {payments.map(pay => (
                <div key={pay.id} className="p-4 bg-green-50/60 rounded-xl border border-green-200 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="bg-green-700 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                      DBT Disbursed
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1">{pay.scheme_name}</h4>
                    <p className="text-gray-600 mt-0.5">Sanction Order: <strong className="font-mono">{pay.sanction_no}</strong></p>
                    <p className="text-gray-500 text-[11px]">Bank UTR: <span className="font-mono font-bold text-gray-700">{pay.utr_no}</span></p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-2xl font-black text-green-800">
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-0.5">{pay.disbursed_at}</p>
                    <p className="text-[11px] text-green-700 font-semibold">{pay.bank_status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white p-6 rounded-b-xl shadow-md border border-t-0 border-gray-200 space-y-4">
            <h3 className="text-lg font-bold text-[#8B4513] border-b pb-3">Notification History</h3>
            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif.id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm">{notif.title_en}</span>
                    <span className="text-[10px] text-gray-400">{notif.created_at}</span>
                  </div>
                  <p className="text-gray-600">{notif.message_en}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <JagoVoiceAssistant />
      <Footer />
    </div>
  );
};
