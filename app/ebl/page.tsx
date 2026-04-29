'use client';

import { useAuth } from '@/lib/api/auth';
import { useEBLList } from '@/hooks/useEBL';
import { FaFileInvoice, FaExchangeAlt, FaHistory, FaCheckCircle, FaUserTag, FaSync, FaExclamationCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function EBLPage() {
  const { role } = useAuth();
  const { data: ebls, isLoading, isError, refetch } = useEBLList();

  const statusColors = {
    draft: 'bg-slate-100 text-slate-600',
    issued: 'bg-emerald-100 text-emerald-700 font-bold',
    transferred: 'bg-indigo-100 text-indigo-700 font-bold',
    surrendered: 'bg-amber-100 text-amber-700',
    void: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display leading-tight">Electronic Bills of Lading</h1>
          <p className="text-color-text-secondary text-sm sm:text-base">Direct ledger settlement for maritime title documents</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="p-2.5 border border-portmid rounded-xl text-portaccent hover:bg-portbase transition-colors flex-shrink-0">
                <FaSync className={isLoading ? 'animate-spin' : ''} />
            </button>
            {['carrier', 'admin'].includes(role) && (
            <Link href="/ebl/draft" className="port-btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5">
                <FaFileInvoice /> <span className="whitespace-nowrap">Issue New eBL</span>
            </Link>
            )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-portaccent">
          <FaSync className="text-4xl animate-spin" />
          <p className="font-display">Searching Ledger for eBLs...</p>
        </div>
      ) : isError ? (
        <div className="port-card p-10 bg-rose-50 border-rose-200 text-center">
          <FaExclamationCircle className="text-4xl text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-display text-rose-700">Ledger Unreachable</h3>
          <p className="text-sm text-rose-600">Failed to connect to the eBL smart contract on the Hyperledger network.</p>
        </div>
      ) : ebls && ebls.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Deduplicate records to prevent React key errors during ledger synchronization */}
          {Array.from(new Map(ebls.map(ebl => [ebl.eblId, ebl])).values()).map((ebl, index) => (
            <div key={`${ebl.eblId}-${index}`} className="port-card group hover:shadow-lg transition-all border-l-4 border-l-portaccent animate-in slide-in-from-right duration-300 font-sans">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                      <FaFileInvoice className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-color-text-primary">{ebl.blNumber}</h3>
                      <p className="text-xs font-mono text-color-text-muted uppercase tracking-widest">{ebl.eblId}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-8 items-center">
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted mb-1">Route</p>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span>{ebl.portOfLoading}</span>
                        <FaExchangeAlt className="text-[10px] text-portaccent" />
                        <span>{ebl.portOfDischarge}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted mb-1">Current Holder</p>
                      <div className="flex items-center gap-1.5 text-xs bg-portmid/20 px-3 py-1 rounded-full text-color-text-secondary font-medium">
                        <FaUserTag /> {ebl.currentHolder ? ebl.currentHolder.split('@')[0] : 'Unassigned'}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted mb-1">Status</p>
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full border border-current ${statusColors[ebl.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
                        {ebl.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                      <Link 
                        href={`/ebl/${ebl.eblId}`}
                        className="port-btn-primary py-1.5 text-xs font-bold uppercase tracking-widest"
                      >
                        Management Panel
                      </Link>
                      <p className="text-[8px] text-color-text-muted uppercase tracking-tighter italic">Last Updated: {new Date(ebl.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-portmid/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-color-text-muted">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1"><FaHistory /> {ebl.transferHistory?.length || 0} Transfers Recorded</span>
                    <span className="flex items-center gap-1 text-emerald-600"><FaCheckCircle /> Cryptographically Issued</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-portbase px-2 py-0.5 rounded border border-portmid">Vessel: {ebl.vesselName}</span>
                    <span className="bg-portbase px-2 py-0.5 rounded border border-portmid">Type: {ebl.blType}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="port-card p-20 text-center flex flex-col items-center gap-4 bg-white/40">
          <FaFileInvoice className="text-5xl text-portmid" />
          <h3 className="text-2xl font-display text-color-text-secondary">No eBLs Issued</h3>
          <p className="text-sm text-color-text-muted max-w-md">The electronic Bill of Lading registry is currently empty on this channel.</p>
        </div>
      )}
    </div>
  );
}
