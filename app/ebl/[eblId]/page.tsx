'use client';

import { useEBL } from '@/hooks/useEBL';
import { useParams, useRouter } from 'next/navigation';
import { FaFileInvoice, FaExchangeAlt, FaHistory, FaCheckCircle, FaUserTag, FaSync, FaExclamationCircle, FaShieldAlt, FaMapMarkerAlt, FaTruck } from 'react-icons/fa';
import Link from 'next/link';
import { useState } from 'react';

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === 'none') return 'N/A';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

export default function EBLDetailPage() {
  const { eblId } = useParams();
  const router = useRouter();
  const { ebl, isLoading, isError, transfer, surrender } = useEBL(eblId as string);
  const [isTransferring, setIsTransferring] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [notes, setNotes] = useState('');

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center gap-4 text-portaccent">
        <FaSync className="text-4xl animate-spin" />
        <p className="font-display">Retrieving Cryptographic Title Document...</p>
      </div>
    );
  }

  if (isError || !ebl) {
    return (
      <div className="port-card p-10 bg-rose-50 border-rose-200 text-center">
        <FaExclamationCircle className="text-4xl text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-display text-rose-700">eBL Not Found</h3>
        <p className="text-sm text-rose-600">The Bill of Lading {eblId} could not be located on the current channel.</p>
        <Link href="/ebl" className="mt-6 inline-block text-portaccent font-bold uppercase tracking-widest text-xs">← Back to Registry</Link>
      </div>
    );
  }

  const handleTransfer = () => {
    transfer.mutate({ toHolder: recipient, notes }, {
        onSuccess: () => {
            setIsTransferring(false);
            setRecipient('');
            setNotes('');
        }
    });
  };

  const handleSurrender = () => {
    if (confirm('Are you sure you want to surrender this digital title? This action cannot be undone and marks the cargo as delivered.')) {
        surrender.mutate();
    }
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-tight">eBL Control Panel</h1>
          <p className="text-color-text-secondary">Maritime Title & Possession Management</p>
        </div>
        <Link href="/ebl" className="text-xs font-bold uppercase tracking-widest text-portaccent hover:underline">
          ← Back to Registry
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Document View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="port-card bg-white p-8 border-t-8 border-t-portaccent shadow-2xl relative overflow-hidden">
             <div className="absolute top-4 right-4 opacity-10">
                <FaShieldAlt className="text-6xl" />
             </div>
             
             <div className="flex justify-between items-start mb-8 border-b border-portmid/30 pb-6">
                <div>
                   <h2 className="text-2xl font-display text-color-text-primary">{ebl.blNumber}</h2>
                   <p className="text-[10px] font-mono text-color-text-muted">LEDGER ID: {ebl.eblId}</p>
                </div>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                   <FaCheckCircle /> {ebl.status}
                </span>
             </div>

             <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Port of Loading</label>
                    <p className="font-bold flex items-center gap-2"><FaMapMarkerAlt className="text-portaccent" /> {ebl.portOfLoading}</p>
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Port of Discharge</label>
                    <p className="font-bold flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-600" /> {ebl.portOfDischarge}</p>
                </div>
                <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Vessel Details</label>
                    <p className="text-sm font-bold">{ebl.vesselName} <span className="text-xs text-color-text-secondary font-mono ml-2">({ebl.vesselIMO})</span></p>
                </div>
             </div>

             <div className="bg-portsurface/50 p-6 rounded-xl border border-portmid/50 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-color-text-secondary">Possession Status</h4>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                        <FaUserTag className="text-xl" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-color-text-primary uppercase">Current Title Holder</p>
                        <p className="text-xl font-display text-indigo-700">{ebl.currentHolder}</p>
                    </div>
                </div>
             </div>

             {isTransferring ? (
                <div className="animate-in slide-in-from-top-4 duration-300 p-6 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-4">
                    <h3 className="font-display text-lg text-indigo-900 flex items-center gap-2"><FaExchangeAlt /> Negotiate Transfer</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">New Holder Identity</label>
                            <input 
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className="port-input bg-white border-indigo-200"
                                placeholder="e.g. consignee@org2.example.com"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Transfer Notes (Audit)</label>
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="port-input bg-white border-indigo-200"
                                placeholder="Reason for transfer, bill of exchange reference..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleTransfer}
                                disabled={transfer.isPending}
                                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all text-xs uppercase"
                            >
                                {transfer.isPending ? 'Processing Transaction...' : 'Commit Transfer to Ledger'}
                            </button>
                            <button onClick={() => setIsTransferring(false)} className="px-6 py-3 border border-indigo-200 text-indigo-600 font-bold rounded-xl text-xs uppercase">Cancel</button>
                        </div>
                    </div>
                </div>
             ) : (
                <div className="flex gap-4">
                    {ebl.status !== 'surrendered' ? (
                        <>
                            <button onClick={() => setIsTransferring(true)} className="flex-1 bg-portaccent text-white font-bold py-4 rounded-xl shadow-lg shadow-portaccent/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                                <FaExchangeAlt /> Negotiate / Transfer Title
                            </button>
                            <button 
                                onClick={handleSurrender}
                                disabled={surrender.isPending}
                                className="flex-1 bg-white border-2 border-portmid text-color-text-secondary font-bold py-4 rounded-xl hover:bg-portbase transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                            >
                                {surrender.isPending ? <FaSync className="animate-spin" /> : <FaShieldAlt />} 
                                Surrender Document
                            </button>
                        </>
                    ) : (
                        <div className="w-full py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-center font-bold text-sm uppercase tracking-widest">
                            Document Legally Surrendered - Cargo Delivered
                        </div>
                    )}
                </div>
             )}
          </div>
        </div>

        {/* Audit History Timeline */}
        <div className="space-y-6">
          <div className="port-card p-6 min-h-[400px]">
             <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-color-text-secondary flex items-center gap-2 mb-6">
                <FaHistory /> Transfer History
             </h3>
             <div className="space-y-8 relative">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-dashed bg-portmid/50 border-l border-dashed border-portmid" />
                
                <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 z-10">
                        <FaCheckCircle className="text-[10px]" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-widest">Document Issued</p>
                        <p className="text-xs font-bold mt-1 text-color-text-primary">By: {ebl.issuedBy.split('@')[0]}</p>
                        <p className="text-[10px] text-color-text-muted font-mono mt-0.5 italic">{formatDate(ebl.issuedAt)}</p>
                    </div>
                </div>

                {ebl.transferHistory?.map((tx, idx) => (
                    <div key={idx} className="relative pl-10 animate-in slide-in-from-left duration-300">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white z-10 shadow-sm">
                            <FaExchangeAlt className="text-[10px]" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-indigo-700 tracking-widest">Ownership Transfer</p>
                            <p className="text-xs font-bold mt-1 text-color-text-primary">To: {tx.to.split('@')[0]}</p>
                            <p className="text-[10px] text-color-text-secondary font-medium mt-1 leading-relaxed italic">"{tx.notes || 'No remarks provided'}"</p>
                            <p className="text-[8px] text-color-text-muted font-mono mt-1 uppercase tracking-tighter">TXID: {tx.txId.substring(0, 16)}...</p>
                        </div>
                    </div>
                ))}

                {ebl.status === 'transferred' && (
                    <div className="relative pl-10 border-l-2 border-indigo-200 ml-[15px] pt-4 mt-[-20px] pb-4">
                        <p className="text-[10px] text-indigo-600 font-bold italic animate-pulse">Waiting for further negotiation...</p>
                    </div>
                )}
             </div>
          </div>

          <div className="port-card p-6 bg-amber-50 border-amber-200">
              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700 flex items-center gap-2 mb-2">
                 <FaExclamationCircle /> Dispute Notice
              </h4>
              <p className="text-[10px] text-amber-600 font-medium leading-relaxed">
                 Any party with a demonstrated legal interest in the cargo may raise a dispute against this eBL. This will freeze further transfers until resolved by the Port Authority.
              </p>
              <button className="mt-4 w-full py-2 border border-amber-300 text-amber-700 text-[10px] font-bold uppercase rounded hover:bg-amber-100 transition-all">
                 Raise Service Dispute
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
