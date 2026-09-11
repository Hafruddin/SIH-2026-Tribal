import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BarChart3, AlertTriangle, CheckCircle2, MapPin, Users, PieChart } from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [coverageData, setCoverageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/analytics')
      .then(res => setCoverageData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !coverageData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-500 py-20 font-semibold text-sm">
          Generating ST Coverage Analytics...
        </div>
        <Footer />
      </div>
    );
  }

  const { overallSummary, stateBreakdown } = coverageData;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
        <div className="bg-gradient-to-r from-[#8B4513] via-[#5C2E0B] to-[#004466] text-white p-6 sm:p-8 rounded-xl shadow-lg space-y-3">
          <div className="flex items-center space-x-2">
            <span className="bg-[#E67E22] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
              Matching Engine Active
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-[#E67E22]" /> ST Scholarship Coverage Gap Detection
          </h2>
          <p className="text-xs text-orange-200 leading-relaxed max-w-3xl">
            Backend matching engine cross-referencing school UDISE+ and APAAR database headcounts with OTR registrations to identify unreached ST students across tribal belts.
          </p>
        </div>

        {/* Overall National Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase">Enrolled ST Headcount (UDISE+)</p>
            <h3 className="text-3xl font-black text-[#8B4513] mt-2">
              {overallSummary.totalEnrolledSTStudents?.toLocaleString('en-IN')}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase">Registered on OTR Portal</p>
            <h3 className="text-3xl font-black text-[#006699] mt-2">
              {overallSummary.registeredOnOTR?.toLocaleString('en-IN')}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase">Active Beneficiaries</p>
            <h3 className="text-3xl font-black text-green-700 mt-2">
              {overallSummary.scholarshipBeneficiaries?.toLocaleString('en-IN')}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase">National Coverage Rate</p>
            <h3 className="text-3xl font-black text-[#E67E22] mt-2">
              {overallSummary.nationalCoverageRate}%
            </h3>
          </div>
        </div>

        {/* State Breakdown Analytics Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
          <h3 className="text-lg font-bold text-[#8B4513] border-b pb-3 flex items-center justify-between">
            <span>State-wise Tribal Scholarship Penetration Breakdown</span>
            <span className="text-xs font-semibold text-gray-500">
              Unreached ST Pockets Highlighted
            </span>
          </h3>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase border-b">
                <tr>
                  <th className="p-4">State</th>
                  <th className="p-4">Enrolled ST Headcount</th>
                  <th className="p-4">OTR Registrations</th>
                  <th className="p-4">Scholarship Beneficiaries</th>
                  <th className="p-4">Unreached ST Pockets</th>
                  <th className="p-4 text-right">Coverage Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stateBreakdown.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#8B4513]" /> {row.state}
                    </td>
                    <td className="p-4 font-semibold text-gray-800">{row.totalEnrolledSTStudents?.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-gray-700 font-mono">{row.registeredOnOTR?.toLocaleString('en-IN')}</td>
                    <td className="p-4 font-bold text-green-700">{row.scholarshipBeneficiaries?.toLocaleString('en-IN')}</td>
                    <td className="p-4 font-bold text-red-600">
                      {row.unreachedSTStudents?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#006699] h-2 rounded-full"
                            style={{ width: `${row.coveragePercentage}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-gray-900">{row.coveragePercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
