'use client';

import { usePreArrivalList } from '@/hooks/usePreArrival';
import { useAuth } from '@/lib/api/auth';
import { useState } from 'react';
import { FaBuilding, FaShip, FaPlus, FaCheckCircle, FaExclamationCircle, FaUserClock } from 'react-icons/fa';
import AssignBerthingForm from '@/components/berth/AssignBerthingForm';

export default function BerthManagementPage() {
  const { role } = useAuth();
  const { data: submissions, isLoading } = usePreArrivalList();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const approvedSubmissions = submissions?.filter(s => s.status === 'approved') || [];
  const selectedSubmission = submissions?.find(s => s.submissionId === selectedSubmissionId);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center gap-4 text-portaccent animate-pulse">
        <FaBuilding className="text-6xl animate-bounce" />
        <p className="font-display text-xl uppercase tracking-widest">Scanning Channel for Berth Capacity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-color-text-primary">Berth & Terminal Allocation</h1>
          <p className="text-color-text-secondary">Official port authority portal for managing quay space and vessel docking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vessel List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-indigo-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <FaShip /> Approved Pending Berth
            </h3>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">{approvedSubmissions.length}</span>
          </div>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {approvedSubmissions.length > 0 ? (
              approvedSubmissions.map(s => (
                <button
                  key={s.submissionId}
                  onClick={() => setSelectedSubmissionId(s.submissionId)}
                  className={`w-full port-card p-4 text-left transition-all border-l-4 group ${
                    selectedSubmissionId === s.submissionId 
                      ? 'border-l-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-200' 
                      : 'border-l-transparent hover:border-l-portaccent'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-display text-lg text-color-text-primary">{s.vesselName}</h4>
                      <p className="text-[10px] font-mono text-color-text-muted">{s.vesselIMO}</p>
                    </div>
                    {selectedSubmissionId === s.submissionId && <FaCheckCircle className="text-indigo-500 text-sm" />}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-color-text-secondary font-bold uppercase tracking-tighter">
                    <FaUserClock /> ETA: {new Date(s.etaTimestamp).toLocaleDateString()}
                  </div>
                </button>
              ))
            ) : (
              <div className="port-card p-10 text-center flex flex-col items-center gap-3 bg-white/40 border-dashed">
                <FaExclamationCircle className="text-3xl text-portmid" />
                <p className="text-xs font-bold text-color-text-secondary uppercase">No Pending Approvals</p>
                <p className="text-[10px] text-color-text-muted">Once a vessel is approved by customs and health, it will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Assignment Action Area */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSubmission ? (
            <div className="animate-in slide-in-from-right duration-500">
               <AssignBerthingForm 
                submissionId={selectedSubmission.submissionId} 
                vesselName={selectedSubmission.vesselName}
                vesselIMO={selectedSubmission.vesselIMO}
                onSuccess={() => setSelectedSubmissionId(null)}
               />
            </div>
          ) : (
            <div className="h-full min-h-[400px] port-card border-dashed flex flex-col items-center justify-center text-center p-10 bg-white/60">
               <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-300 mb-4 ring-8 ring-indigo-50/50">
                  <FaBuilding className="text-4xl" />
               </div>
               <h3 className="text-xl font-display text-color-text-secondary mb-2">Select a vessel to allocate space</h3>
               <p className="text-sm text-color-text-muted max-w-sm">Berth allocation is a mandatory step before port services like pilotage or mooring can be started on the ledger.</p>
            </div>
          )}

          <div className="port-card p-6 bg-amber-50 border-amber-200">
             <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700 flex items-center gap-2 mb-3">
                <FaExclamationCircle /> PORT AUTHORITY ADVISORY
             </h4>
             <ul className="text-[10px] text-amber-600 space-y-2 font-medium">
               <li>• Vessel must have triple-approval status before appearing in this registry.</li>
               <li>• Assignment data is immutable and visible to all terminal operators immediately.</li>
               <li>• Ensure the selected time slot aligns with the reported ETA to avoid congestion logs.</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
