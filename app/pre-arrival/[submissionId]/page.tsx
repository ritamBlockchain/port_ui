'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePreArrival } from '@/hooks/usePreArrival';
import { useAuth } from '@/lib/api/auth';
import { FaArrowLeft, FaShip, FaUserCircle, FaBox, FaHistory, FaCheckCircle, FaExclamationTriangle, FaShieldAlt, FaAnchor } from 'react-icons/fa';
import Link from 'next/link';
import HashDisplay from '@/components/shared/HashDisplay';
import ApprovalPanel from '@/components/pre-arrival/ApprovalPanel';

export default function PreArrivalDetailPage() {
  const { submissionId } = useParams();
  const router = useRouter();
  const { role } = useAuth();
  const { submission, isLoading, error, validateCompliance } = usePreArrival(submissionId as string);

  if (isLoading) return (
    <div className="py-20 flex flex-col items-center gap-4 text-portaccent animate-pulse">
      <FaShip className="text-6xl animate-bounce" />
      <p className="font-display text-xl">Retrieving Private Data Collection...</p>
    </div>
  );

  if (error || !submission) return (
    <div className="port-card p-10 bg-rose-50 border-rose-200 text-center">
      <FaExclamationTriangle className="text-4xl text-rose-500 mx-auto mb-4" />
      <h3 className="text-xl font-display text-rose-700">Record Not Found</h3>
      <p className="text-sm text-rose-600 mb-6 font-mono">{submissionId}</p>
      <Link href="/pre-arrival" className="port-btn-primary bg-rose-600 hover:bg-rose-700">Back to Registry</Link>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Link href="/pre-arrival" className="text-xs font-bold text-portaccent flex items-center gap-1 hover:underline uppercase tracking-widest">
            <FaArrowLeft /> Registry
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-display text-color-text-primary">Submission Review</h1>
            <span className={`px-4 py-1 rounded-full text-xs font-bold border uppercase tracking-widest ${
              submission.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              {submission.status}
            </span>
          </div>
          <div className="flex gap-4 text-[10px] font-bold text-color-text-muted uppercase tracking-tighter">
            <span>ID: {submission.submissionId}</span>
            <span>Agent: {submission.submittedBy}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="bg-white px-4 py-2 border border-portmid rounded-xl shadow-sm text-right">
            <p className="text-[10px] text-color-text-muted uppercase tracking-widest font-bold">Ledger Timestamp</p>
            <p className="text-sm font-medium">{new Date(submission.submittedAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase">
            <FaShieldAlt /> Valid Merkle Root
          </div>
        </div>
      </div>

      {submission.berthAssignment && (
        <div className="port-card p-4 bg-indigo-900 text-white flex flex-col md:flex-row justify-between items-center gap-4 animate-in slide-in-from-top duration-500 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-12 translate-x-16" />
            <div className="flex items-center gap-4 z-10">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                    <FaAnchor />
                </div>
                <div>
                    <h3 className="font-display text-lg leading-tight">Berth Allocated</h3>
                    <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">{submission.berthAssignment.berthName || 'Official Quay'}</p>
                </div>
            </div>
            
            <div className="flex gap-8 z-10">
                <div className="text-center border-l border-white/20 pl-6">
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Berth ID</p>
                    <p className="font-mono font-bold">{submission.berthAssignment.berthId}</p>
                </div>
                <div className="text-center border-l border-white/20 pl-6">
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Time Slot</p>
                    <p className="font-bold">{submission.berthAssignment.timeSlot || 'TBD'}</p>
                </div>
                <div className="text-center border-l border-white/20 pl-6">
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1">Assignment ID</p>
                    <p className="font-mono text-[10px] opacity-70">{submission.berthAssignment.assignmentId}</p>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <section className="port-card p-8 bg-white space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest italic">Vessel Name</p>
                <p className="text-lg font-display text-portaccent">{submission.vesselName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest italic">IMO Number</p>
                <p className="text-base font-mono font-bold">{submission.vesselIMO}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest italic">Call Sign</p>
                <p className="text-base font-bold">{submission.callSign}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest italic">Flag</p>
                <p className="text-base font-bold">{submission.flag}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-portmid/30 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest italic">Estimated Arrival (ETA)</p>
                    <p className="text-xl font-medium text-color-text-primary">{new Date(submission.etaTimestamp).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest italic">Port Call Purpose</p>
                    <p className="text-xl font-medium text-color-text-primary capitalize">{submission.portCallPurpose}</p>
                </div>
            </div>
          </section>

          {/* Cargo Manifest (Private Data Indicator) */}
          <section className="port-card bg-portsurface/30 overflow-hidden">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-display text-xl flex items-center gap-2">
                <FaBox /> Cargo Manifest
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Private Data Collection</span>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-portmid/20 text-[10px] font-bold uppercase tracking-widest text-color-text-secondary">
                  <tr>
                    <th className="px-6 py-4">Container No</th>
                    <th className="px-6 py-4">HS Code</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Weight (KG)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-portmid/10 text-sm">
                  {submission.cargoManifest ? (Array.isArray(submission.cargoManifest) ? submission.cargoManifest : JSON.parse(submission.cargoManifest as any)).map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-white/40">
                      <td className="px-6 py-4 font-mono font-bold">{item.containerNo}</td>
                      <td className="px-6 py-4">{item.hsCode}</td>
                      <td className="px-6 py-4">{item.description}</td>
                      <td className="px-6 py-4 text-right">{item.weight}</td>
                    </tr>
                  )) : (
                      <tr><td colSpan={4} className="px-6 py-4 text-center text-color-text-muted">No cargo data provided</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Crew Information */}
          <section className="port-card overflow-hidden">
             <div className="p-6 bg-emerald-700 text-white flex items-center gap-2">
                <FaUserCircle className="text-xl" />
                <h3 className="font-display text-xl">Crew Listing</h3>
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {submission.crewList ? (Array.isArray(submission.crewList) ? submission.crewList : JSON.parse(submission.crewList as any)).map((crew: any, i: number) => (
                    <div key={i} className="flex flex-col p-4 bg-portbase border border-portmid rounded-xl">
                        <span className="text-sm font-bold text-color-text-primary">{crew.name}</span>
                        <div className="flex justify-between mt-2 text-[10px] font-bold uppercase text-color-text-muted">
                            <span>{crew.rank}</span>
                            <span>{crew.passportNo}</span>
                        </div>
                    </div>
                )) : (
                    <p className="text-center py-4 text-color-text-muted col-span-2">No crew members listed</p>
                )}
             </div>
          </section>
        </div>

        {/* Audit & Approvals (Sidebar) */}
        <div className="space-y-8">
            {submission.status === 'pending' && (
               <button 
                onClick={() => validateCompliance.mutate()}
                disabled={validateCompliance.isPending}
                className="w-full port-card p-4 bg-indigo-50 border-2 border-indigo-200 text-indigo-700 flex items-center justify-center gap-3 hover:bg-indigo-100 transition-all font-display shadow-lg shadow-indigo-100/50 group"
              >
                <FaShieldAlt className={`group-hover:rotate-12 transition-transform ${validateCompliance.isPending ? 'animate-spin' : ''}`} />
                {validateCompliance.isPending ? 'Verifying Cargo Manifest...' : 'Trigger Compliance Check'}
              </button>
            )}
            {submission.status === 'approved' && ['admin', 'portauthority'].includes(role) && (
              <Link 
                href="/berth" 
                className="port-card p-4 bg-indigo-600 text-white flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all font-display shadow-lg shadow-indigo-100"
              >
                <FaAnchor /> Assign Berth Portfolio
              </Link>
            )}
            <ApprovalPanel submissionId={submission.submissionId} approvals={submission.approvals} currentStatus={submission.status} />

            <section className="port-card p-6 space-y-4">
                <h3 className="font-display text-xl flex items-center gap-2 border-b border-portmid pb-2">
                    <FaHistory className="text-portaccent" /> Audit History
                </h3>
                <div className="space-y-4">
                    <div className="relative pl-6 border-l-2 border-dashed border-portmid">
                         <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-portaccent" />
                         <p className="text-xs font-bold text-color-text-primary uppercase tracking-widest">Submitted to Ledger</p>
                         <p className="text-[10px] text-color-text-muted">{new Date(submission.submittedAt).toLocaleString()}</p>
                    </div>
                    {submission.approvals.map((app, i) => (
                        <div key={i} className="relative pl-6 border-l-2 border-dashed border-portmid">
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${app.approved ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <p className="text-xs font-bold text-color-text-primary uppercase tracking-widest">{app.agency} Review</p>
                            <p className="text-[10px] text-color-text-muted">{app.comments || 'No comments'}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}
