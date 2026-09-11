import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Shield, Users, BookOpen, CheckCircle2, AlertCircle, IndianRupee, PieChart, BarChart3, ArrowRight } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'applications' | 'students' | 'grievances'>('applications');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }

    Promise.all([
      axios.get('/api/admin/dashboard'),
      axios.get('/api/admin/students'),
      axios.get('/api/admin/applications'),
      axios.get('/api/admin/grievances'),
    ]).then(([dashRes, stdRes, appRes, grvRes]) => {
      setMetrics(dashRes.data.metrics);
      setStudents(stdRes.data.students || []);
      setApplications(appRes.data.applications || []);
      setGrievances(grvRes.data.grievances || []);
    }).catch(err => {
      console.error(err);
    }).finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin]);

  if (loading || !metrics) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20 text-gray-500 font-semibold text-sm">
          Loading Admin Control Portal...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-6">
        {/* Admin Title Bar */}
        <div className="bg-gradient-to-r from-[#004466] via-[#006699] to-[#8B4513] text-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white text-[#006699] flex items-center justify-center font-black text-xl">
              🔑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">MoTA National Admin Control Portal</h2>
                <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                  DEMO ANALYTICS
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Ministry of Tribal Affairs • Nodal Authority Dashboard & ST Coverage Analytics
              </p>
            </div>
          </div>

          <Link
            to="/admin/analytics"
            className="btn-accent text-xs font-bold px-4 py-2.5 shadow-md flex items-center gap-2 hover:scale-105 transition"
          >
            <BarChart3 className="w-4 h-4" /> ST Coverage Gap Analytics
          </Link>
        </div>

        {/* 6 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase">Total Students</p>
            <h3 className="text-2xl font-black text-[#8B4513] mt-1">{metrics.totalStudents}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase">Active Applications</p>
            <h3 className="text-2xl font-black text-[#006699] mt-1">{metrics.totalApplications}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase">Pending Verifications</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{metrics.pendingVerifications}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase">Approved Sanctioned</p>
            <h3 className="text-2xl font-black text-green-700 mt-1">{metrics.approvedSanctioned}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase">DBT Disbursed</p>
            <h3 className="text-xl font-black text-green-800 mt-1">{metrics.disbursedFormatted || '₹18.42 Cr'}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase">Open Grievances</p>
            <h3 className="text-2xl font-black text-red-600 mt-1">{metrics.openGrievances}</h3>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-white px-4 rounded-t-xl overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3.5 px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'applications' ? 'border-[#006699] text-[#006699]' : 'border-transparent text-gray-500'
            }`}
          >
            <BookOpen className="w-4 h-4" /> All Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-3.5 px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'students' ? 'border-[#006699] text-[#006699]' : 'border-transparent text-gray-500'
            }`}
          >
            <Users className="w-4 h-4" /> Registered ST Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('grievances')}
            className={`py-3.5 px-4 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'grievances' ? 'border-[#006699] text-[#006699]' : 'border-transparent text-gray-500'
            }`}
          >
            <AlertCircle className="w-4 h-4" /> Helpdesk Tickets ({grievances.length})
          </button>
        </div>

        {/* TAB 1: APPLICATIONS QUEUE */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-b-xl shadow-md border border-t-0 border-gray-200 overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 font-bold uppercase border-b">
                  <tr>
                    <th className="p-4">Application ID</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">OTR ID</th>
                    <th className="p-4">State</th>
                    <th className="p-4">Scheme</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4 text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-mono font-bold text-[#006699]">{app.application_no}</td>
                      <td className="p-4 font-bold text-gray-900">{app.student_name}</td>
                      <td className="p-4 font-mono text-gray-600">{app.otr_id}</td>
                      <td className="p-4 text-gray-700">{app.state}</td>
                      <td className="p-4 font-semibold text-gray-800">{app.scheme_name}</td>
                      <td className="p-4">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-300">
                          {app.current_status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-500">{app.submitted_at?.split(' ')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS REGISTERED */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-b-xl shadow-md border border-t-0 border-gray-200 overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 font-bold uppercase border-b">
                  <tr>
                    <th className="p-4">OTR ID</th>
                    <th className="p-4">Full Student Name</th>
                    <th className="p-4">State & District</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">PVTG Status</th>
                    <th className="p-4">Annual Income</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map(std => (
                    <tr key={std.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-mono font-bold text-[#8B4513]">{std.otr_id}</td>
                      <td className="p-4 font-bold text-gray-900">{std.full_name}</td>
                      <td className="p-4 text-gray-600">{std.state} ({std.district})</td>
                      <td className="p-4 text-gray-700">{std.category}</td>
                      <td className="p-4">
                        {std.pvtg_status ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            PVTG ({std.pvtg_group_name || 'Priority'})
                          </span>
                        ) : (
                          <span className="text-gray-400">Standard ST</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">₹{std.annual_income?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GRIEVANCES */}
        {activeTab === 'grievances' && (
          <div className="bg-white rounded-b-xl shadow-md border border-t-0 border-gray-200 p-6 space-y-4 text-xs">
            {grievances.map(grv => (
              <div key={grv.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-[#006699] text-sm">{grv.ticket_no}</span>
                  <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {grv.status}
                  </span>
                </div>
                <p className="font-bold text-gray-900 text-sm">{grv.subject}</p>
                <p className="text-gray-600">Student: <strong>{grv.student_name} ({grv.otr_id})</strong></p>
                <p className="text-gray-700">{grv.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
