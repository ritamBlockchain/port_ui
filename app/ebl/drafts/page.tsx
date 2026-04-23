'use client';

import { useDraftList } from '@/hooks/useEBL';
import { FaFileSignature, FaClock, FaCheckCircle, FaTimesCircle, FaArrowRight, FaSync, FaExclamationCircle, FaUserEdit } from 'react-icons/fa';
import Link from 'next/link';

export default function DraftList() {
  const { data: drafts, isLoading, isError, refetch } = useDraftList();

  const statusMap = {
    draft: { icon: FaClock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    committed: { icon: FaCheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    issued: { icon: FaCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    rejected: { icon: FaTimesCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display uppercase">eBL Collaborative Drafts</h1>
          <p className="text-color-text-secondary">Manage and revise title documents before final ledger commitment</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => refetch()} className="p-2 border border-portmid rounded-lg text-portaccent">
                <FaSync className={isLoading ? 'animate-spin' : ''} />
            </button>
            <Link href="/ebl/draft" className="port-btn-primary flex items-center gap-2">
                <FaFileSignature /> Initiate New Draft
            </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-portaccent">
          <FaSync className="text-4xl animate-spin" />
          <p className="font-display">Retrieving collaborative drafts...</p>
        </div>
      ) : isError ? (
        <div className="port-card p-10 bg-rose-50 border-rose-200 text-center">
          <FaExclamationCircle className="text-4xl text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-display text-rose-700">Service Interrupted</h3>
          <p className="text-sm text-rose-600">Could not retrieve digital drafts from the network.</p>
        </div>
      ) : drafts && drafts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deduplicate records to prevent React key errors during ledger synchronization */}
          {Array.from(new Map(drafts.map((d: any) => [d.draftId || d.eblId || d.ID || d.id, d])).values()).map((draft: any, index) => {
            const currentId = draft.draftId || draft.eblId || draft.ID || draft.id;
            const status = statusMap[draft.status as keyof typeof statusMap] || statusMap.draft;
            const StatusIcon = status.icon;
            
            return (
              <div key={`${currentId}-${index}`} className="port-card group hover:shadow-xl transition-all animate-in zoom-in-95 duration-300 overflow-hidden border-t-4 border-t-portaccent">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="font-display text-lg text-color-text-primary">{draft.blNumber || 'UNNAMED_DRAFT'}</h3>
                        <p className="text-[10px] font-mono text-color-text-muted mt-1 tracking-widest">{currentId}</p>
                     </div>
                     <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${status.bg} ${status.color} ${status.border}`}>
                        <StatusIcon /> {draft.status || 'draft'}
                     </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-color-text-muted font-bold uppercase tracking-tighter">Vessel Submission</span>
                        <span className="font-mono text-portaccent">{draft.submissionId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-color-text-muted font-bold uppercase tracking-tighter">Current Revision</span>
                        <span className="bg-portmid/20 px-2 py-0.5 rounded text-color-text-primary font-bold">v{draft.version || 1}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-color-text-muted font-bold uppercase tracking-tighter">Drafted By</span>
                        <span className="text-indigo-600 font-medium">@{(draft.createdBy || 'system').split('@')[0]}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link 
                        href={`/ebl/drafts/${currentId}`}
                        className="flex-1 bg-portsurface text-portaccent border border-portmid/30 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-portaccent hover:text-white transition-all group"
                    >
                        <FaUserEdit /> {draft.status === 'draft' ? 'Review & Revise' : 'View Details'}
                        <FaArrowRight className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>
                
                <div className="bg-portbase/50 px-6 py-2 border-t border-portmid/30 flex justify-between items-center italic">
                   <p className="text-[8px] text-color-text-muted uppercase tracking-widest">Last Modified: {draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : 'Recently'}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="port-card p-20 text-center flex flex-col items-center gap-4 bg-white/40">
          <FaFileSignature className="text-5xl text-portmid" />
          <h3 className="text-2xl font-display text-color-text-secondary">No Pending Drafts</h3>
          <p className="text-sm text-color-text-muted max-w-md">There are currently no collaborative eBL drafts waiting for revision or commitment.</p>
        </div>
      )}
    </div>
  );
}
