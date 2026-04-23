'use client';

import { useDraftEBL, useEBL } from '@/hooks/useEBL';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaClock, FaCheckCircle, FaTimesCircle, FaSync, 
  FaArrowLeft, FaShieldAlt, FaSave, FaBan, FaStamp 
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DraftManagementPage() {
  const { draftId } = useParams();
  const router = useRouter();
  const { draft, isLoading, isError, performAction } = useDraftEBL(draftId as string);
  const { issue } = useEBL();
  
  const [snapshot, setSnapshot] = useState<any>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (draft && draft.revisions?.length > 0) {
      const latest = draft.revisions[draft.revisions.length - 1];
      setSnapshot(JSON.parse(latest.snapshot));
    }
  }, [draft]);

  if (isLoading) return <div className="py-20 text-center animate-pulse font-display text-portaccent">Decrypting Draft Data...</div>;
  
  if (isError || !draft) {
    return (
      <div className="py-20 text-center space-y-4">
        <FaTimesCircle className="mx-auto text-4xl text-rose-500" />
        <h2 className="text-xl font-display text-rose-600">Draft Not Found</h2>
        <p className="text-sm text-color-text-secondary">This draft may have been issued or you lack permission to view it.</p>
        <Link href="/ebl/drafts" className="inline-block port-btn-primary mt-4">Return to Drafts</Link>
      </div>
    );
  }

  const handleAction = (action: string, extra: any = {}) => {
    performAction.mutate({ action, snapshot, ...extra });
  };

  const handleIssue = () => {
     // Prepare issuance data from draft snapshot
     const issueData = {
        eblId: draft.eblId,
        submissionId: draft.submissionId,
        voyageNumber: 'V-2024-DEF',
        portOfLoading: 'Port KL',
        portOfDischarge: 'Port Rotterdam',
        placeOfReceipt: 'Cyberjaya',
        placeOfDelivery: 'Rotterdam',
        freightPayment: 'prepaid',
        blType: 'original',
        shipper: snapshot.shipper,
        consignee: snapshot.consignee,
        notifyParty: snapshot.notifyParty,
        goodsDetails: snapshot.goodsDetails
     };
     
     issue.mutate(issueData, {
        onSuccess: () => router.push('/ebl')
     });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Link href="/ebl/drafts" className="text-xs font-bold uppercase tracking-widest text-portaccent flex items-center gap-2">
           <FaArrowLeft /> Back to Drafts
        </Link>
        <span className="bg-portbase px-4 py-1 rounded-full text-[10px] font-mono text-portaccent border border-portmid">
           DRAFT_UID: {draftId}
        </span>
      </div>

      <div className="port-card bg-white p-8 border-l-8 border-l-portaccent shadow-2xl">
         <div className="flex justify-between items-start mb-8">
            <div>
               <h1 className="text-3xl font-display">{draft.blNumber}</h1>
               <p className="text-xs text-color-text-secondary mt-1 uppercase tracking-widest font-bold">Revision v{draft.version} — Current Status: <span className="text-portaccent">{draft.status}</span></p>
            </div>
            {draft.status === 'draft' && (
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleAction('revise', { notes })}
                        className="bg-portsurface text-indigo-600 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                    >
                        <FaSave /> Save Revision
                    </button>
                    <button 
                         onClick={() => handleAction('commit')}
                         className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        <FaStamp /> Commit Draft
                    </button>
                    <button 
                         onClick={() => {
                            const reason = prompt('Reason for rejection?');
                            if(reason) handleAction('reject', { reason });
                         }}
                         className="bg-rose-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2"
                    >
                        <FaBan /> Reject
                    </button>
                </div>
            )}
            {draft.status === 'committed' && (
                <button 
                    onClick={handleIssue}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-emerald-200 hover:scale-105 transition-all flex items-center gap-3"
                >
                    <FaShieldAlt /> Issue Cryptographic Title
                </button>
            )}
         </div>

         {snapshot && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-portbase/30 p-8 rounded-2xl border border-portmid/30">
                <div className="space-y-4">
                    <h4 className="text-[10px] uppercase font-bold text-color-text-muted tracking-widest flex items-center gap-2">
                       <FaShieldAlt /> Document Stakeholders
                    </h4>
                    <div>
                        <label className="text-[9px] font-bold text-indigo-700 uppercase">Shipper Entity</label>
                        <input value={snapshot.shipper} onChange={(e) => setSnapshot({...snapshot, shipper: e.target.value})} className="port-input bg-white text-sm" disabled={draft.status !== 'draft'}/>
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-indigo-700 uppercase">Consignee Entity</label>
                        <input value={snapshot.consignee} onChange={(e) => setSnapshot({...snapshot, consignee: e.target.value})} className="port-input bg-white text-sm" disabled={draft.status !== 'draft'}/>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] uppercase font-bold text-color-text-muted tracking-widest flex items-center gap-2">
                       <FaSync /> Cargo Manifest Audit
                    </h4>
                    <div>
                        <label className="text-[9px] font-bold text-emerald-700 uppercase">Goods Description</label>
                        <textarea 
                            value={snapshot.goodsDetails} 
                            onChange={(e) => setSnapshot({...snapshot, goodsDetails: e.target.value})}
                            className="port-input bg-white text-sm min-h-[100px]"
                            disabled={draft.status !== 'draft'}
                        />
                    </div>
                </div>
            </div>
         )}

         {draft.status === 'draft' && (
            <div className="mt-6">
                <label className="text-[10px] font-bold uppercase text-color-text-muted">Revision Remarks (Audit Trail)</label>
                <input 
                    placeholder="e.g. Corrected consignee address as per instructions..." 
                    className="port-input mt-1 italic text-xs" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>
         )}
      </div>

      {/* Revision History */}
      <div className="port-card p-6 bg-portsurface/50 border-dashed border-portmid">
         <h4 className="text-[10px] uppercase font-bold text-color-text-muted mb-6 tracking-widest flex items-center gap-2">
            <FaClock /> Cryptographic Revision History
         </h4>
         <div className="space-y-4">
            {draft.revisions?.slice().reverse().map((rev: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start border-b border-portmid/20 pb-4 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-portmid/20 flex items-center justify-center text-[10px] font-bold">
                        v{rev.version}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-color-text-primary">Action by @{rev.revisedBy.split('@')[0]}</p>
                        <p className="text-[10px] text-color-text-muted italic">"{rev.notes}"</p>
                        <p className="text-[8px] font-mono text-color-text-muted mt-1">{new Date(rev.revisedAt).toLocaleString()}</p>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}
