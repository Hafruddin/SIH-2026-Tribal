import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Key, User, Shield, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [otrOrMobile, setOtrOrMobile] = useState('OTR2026001234');
  const [password, setPassword] = useState('Student@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/login', {
        identifier: otrOrMobile.trim(),
        otrOrMobile: otrOrMobile.trim(),
        password: password.trim(),
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        const role = (res.data.user?.role || '').toUpperCase();
        if (role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err: any) {
      if (!err.response) {
        setError(err.message || 'Unable to reach the authentication server. Please verify backend server is running and configured.');
      } else {
        setError(err.response?.data?.error || 'Invalid credentials. Please check your identifier and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const performLoginWithCredentials = async (idVal: string, passVal: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', {
        identifier: idVal.trim(),
        otrOrMobile: idVal.trim(),
        password: passVal.trim(),
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        const role = (res.data.user?.role || '').toUpperCase();
        if (role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err: any) {
      if (!err.response) {
        setError(err.message || 'Unable to reach the authentication server. Please verify backend server is running and configured.');
      } else {
        setError(err.response?.data?.error || 'Invalid credentials. Please check your identifier and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const setDemoStudentCredentials = () => {
    setOtrOrMobile('OTR2026001234');
    setPassword('Student@123');
    performLoginWithCredentials('OTR2026001234', 'Student@123');
  };

  const setDemoAdminCredentials = () => {
    setOtrOrMobile('admin@tribalscholar.demo');
    setPassword('Admin@123');
    performLoginWithCredentials('admin@tribalscholar.demo', 'Admin@123');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 py-12 px-4 max-w-md mx-auto w-full">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-200 space-y-6">
          <div className="text-center border-b pb-4">
            <div className="w-12 h-12 bg-[#8B4513] text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold border-2 border-[#E67E22] shadow-md">
              🏛️
            </div>
            <h2 className="text-2xl font-bold text-[#8B4513]">Student Portal Login</h2>
            <p className="text-xs text-gray-500 mt-1">
              Access your Unified Scholarship Profile, Document Vault, and DBT Disbursal Tracker.
            </p>
          </div>

          {/* Quick One-Click Demo Credentials Buttons */}
          <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 space-y-2">
            <p className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-[#E67E22]" /> Quick Demo Logins (Click to Autofill):
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={setDemoStudentCredentials}
                className="flex-1 bg-white hover:bg-amber-100 text-[#8B4513] border border-amber-300 px-2 py-1.5 rounded text-[11px] font-semibold text-center transition shadow-sm"
              >
                👨‍🎓 Demo Student
              </button>
              <button
                type="button"
                onClick={setDemoAdminCredentials}
                className="flex-1 bg-white hover:bg-blue-100 text-[#006699] border border-blue-300 px-2 py-1.5 rounded text-[11px] font-semibold text-center transition shadow-sm"
              >
                🔑 Demo Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                OTR ID / Registered Mobile / Email
              </label>
              <input
                type="text"
                required
                value={otrOrMobile}
                onChange={e => setOtrOrMobile(e.target.value)}
                placeholder="OTR2026001234 or Mobile"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#8B4513]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Account Password / PIN
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#8B4513]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs font-bold shadow-md"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="text-center border-t pt-4 text-xs text-gray-600">
            Don't have an OTR ID yet?{' '}
            <Link to="/register" className="font-bold text-[#006699] hover:underline">
              New Registration (OTR)
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
