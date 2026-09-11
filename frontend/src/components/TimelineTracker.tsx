import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Building2, MapPin, Award, CreditCard, Landmark } from 'lucide-react';

export interface TimelineStage {
  id: string;
  stage: string;
  status: 'Completed' | 'Pending' | 'Current' | 'Deficiency';
  action_by?: string;
  remarks?: string;
  timestamp?: string;
}

interface TimelineTrackerProps {
  currentStatus: string;
  timelineEvents?: TimelineStage[];
}

const STAGES = [
  'Submitted',
  'Institution Verification',
  'District Verification',
  'State Verification',
  'Sanctioned',
  'DBT Processing',
  'Fund Disbursed',
];

export const TimelineTracker: React.FC<TimelineTrackerProps> = ({ currentStatus, timelineEvents = [] }) => {
  const getStageIndex = (statusStr: string) => {
    if (statusStr === 'Disbursed') return 6;
    const idx = STAGES.findIndex(s => statusStr.toLowerCase().includes(s.toLowerCase()));
    return idx >= 0 ? idx : 0;
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-lg font-bold text-[#8B4513] mb-6 flex items-center justify-between border-b pb-3">
        <span>Application Progression Timeline</span>
        <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300">
          Current Status: <strong>{currentStatus}</strong>
        </span>
      </h3>

      {/* Visual Stepper Bar */}
      <div className="relative mb-10 overflow-x-auto pb-4">
        <div className="flex items-center justify-between min-w-[700px]">
          {STAGES.map((stageName, idx) => {
            const isPassed = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const isCompleted = idx < currentIndex || currentStatus === 'Disbursed';

            // Find match in actual events if present
            const eventMatch = timelineEvents.find(e => e.stage.toLowerCase().includes(stageName.toLowerCase()));

            return (
              <div key={stageName} className="flex-1 flex flex-col items-center relative group">
                {/* Connecting Line */}
                {idx < STAGES.length - 1 && (
                  <div
                    className={`absolute top-4 left-[50%] w-full h-1 z-0 transition-colors ${
                      idx < currentIndex ? 'bg-[#006699]' : 'bg-gray-200'
                    }`}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all ${
                    isCompleted
                      ? 'bg-[#006699] text-white ring-4 ring-sky-100'
                      : isCurrent
                      ? 'bg-[#E67E22] text-white ring-4 ring-orange-100 animate-pulse'
                      : 'bg-gray-100 text-gray-400 border border-gray-300'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] font-semibold mt-2 text-center max-w-[90px] leading-tight ${
                    isCurrent ? 'text-[#E67E22]' : isPassed ? 'text-[#006699]' : 'text-gray-400'
                  }`}
                >
                  {stageName}
                </span>

                {eventMatch?.timestamp && (
                  <span className="text-[9px] text-gray-400 mt-0.5">
                    {eventMatch.timestamp.split(' ')[0]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Log Timeline Details */}
      {timelineEvents.length > 0 && (
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Verification & Audit Trail Log
          </h4>
          <div className="space-y-3">
            {timelineEvents.map((evt, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 text-xs flex items-start justify-between gap-4 hover:border-[#006699] transition"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-white rounded-full border border-gray-200 text-[#006699] mt-0.5">
                    {evt.stage.includes('Submitted') && <Clock className="w-4 h-4" />}
                    {evt.stage.includes('Institution') && <Building2 className="w-4 h-4" />}
                    {evt.stage.includes('District') && <MapPin className="w-4 h-4" />}
                    {evt.stage.includes('Sanctioned') && <Award className="w-4 h-4" />}
                    {evt.stage.includes('DBT') && <CreditCard className="w-4 h-4" />}
                    {evt.stage.includes('Disbursed') && <Landmark className="w-4 h-4 text-green-600" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{evt.stage}</p>
                    <p className="text-gray-600 mt-0.5">{evt.remarks}</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Authority: <strong className="text-gray-700">{evt.action_by || 'MoTA Nodal Cell'}</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">
                    {evt.status}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">{evt.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
