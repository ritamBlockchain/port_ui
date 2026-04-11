'use client';

import { useAuth } from '@/lib/api/auth';
import { usePreArrivalList } from '@/hooks/usePreArrival';
import { FaShip, FaClock, FaCheckCircle, FaExclamationCircle, FaSearch, FaFilter, FaSync } from 'react-icons/fa';
import Link from 'next/link';
import { useState } from 'react';

export default function PreArrivalPage() {
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: submissions, isLoading, isError, refetch } = usePreArrivalList();

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    held: 'bg-rose-100 text-rose-700 border-rose-200',
    flagged: 'bg-orange-100 text-orange-700 border-orange-200',
    compliant: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Submitted: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const isAgency = ['customs', 'portauthority', 'immigration', 'portHealth', 'admin'].includes(role);

  // Filter based on search
  const filteredData = submissions?.filter(sub => 
    sub.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.submissionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.vesselIMO.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display">Pre-Arrival Submissions</h1>
          <p className="text-color-text-secondary">Track and manage vessel entry declarations from Hyperledger Fabric</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => refetch()}
            className="p-2 bg-white border border-portmid rounded-lg text-portaccent hover:bg-portbase transition-all"
            title="Refresh from Blockchain"
          >
            <FaSync className={isLoading ? 'animate-spin' : ''} />
          </button>
          {role === 'shippingagent' && (
            <Link href="/pre-arrival/new" className="port-btn-primary flex items-center gap-2">
              <FaShip /> New Submission
            </Link>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex gap-4 items-center bg-white/50 p-2 rounded-xl border border-portmid shadow-sm">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-color-text-muted" />
          <input 
            type="text" 
            placeholder="Search by Vessel Name, IMO or Submission ID..."
            className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-color-text-secondary hover:text-portaccent">
          <FaFilter /> Filter
        </button>
      </div>

      {/* States: Loading, Error, Data */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-portaccent">
          <FaSync className="text-4xl animate-spin" />
          <p className="font-display">Querying Ledger State...</p>
        </div>
      ) : isError ? (
        <div className="port-card p-10 bg-rose-50 border-rose-200 text-center">
          <FaExclamationCircle className="text-4xl text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-display text-rose-700">Fabric Connection Error</h3>
          <p className="text-sm text-rose-600 mb-4">Could not retrieve data from the blockchain network. Check your gateway configuration.</p>
          <button onClick={() => refetch()} className="port-btn-primary bg-rose-600 hover:bg-rose-700">Retry Connection</button>
        </div>
      ) : filteredData && filteredData.length > 0 ? (
        <div className="port-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-portmid/30 text-xs font-bold uppercase tracking-widest text-color-text-secondary">
                <th className="px-6 py-4">Vessel Details</th>
                <th className="px-6 py-4">Submission ID</th>
                <th className="px-6 py-4">ETA</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-portmid/20">
              {filteredData.map((sub) => (
                <tr key={sub.submissionId} className="hover:bg-white/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-portmid/50 flex items-center justify-center text-portaccent group-hover:scale-110 transition-transform">
                        <FaShip />
                      </div>
                      <div>
                        <p className="font-bold text-color-text-primary uppercase">{sub.vesselName}</p>
                        <p className="text-[10px] text-color-text-muted font-mono">{sub.vesselIMO}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm">{sub.submissionId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{new Date(sub.etaTimestamp).toLocaleDateString()}</span>
                      <span className="text-[10px] text-color-text-muted flex items-center gap-1 uppercase">
                        <FaClock /> {new Date(sub.etaTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs uppercase px-2 py-1 bg-portmid/20 rounded font-bold text-color-text-secondary">
                      {sub.portCallPurpose}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColors[sub.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
                      {sub.status === 'approved' ? <FaCheckCircle /> : <FaExclamationCircle />}
                      <span className="uppercase">{sub.status}</span>
                    </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/pre-arrival/${sub.submissionId}`}
                      className="text-xs font-bold text-portaccent hover:underline uppercase tracking-widest"
                    >
                      {isAgency && sub.status === 'pending' ? 'Review Submission' : 'View Details'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="port-card p-20 text-center flex flex-col items-center gap-4 bg-white/40">
          <FaShip className="text-5xl text-portmid" />
          <h3 className="text-2xl font-display text-color-text-secondary">No Ledger Submissions Found</h3>
          <p className="text-sm text-color-text-muted max-w-md">Connect your shipping agent identity and submit a new declaration to see it on the blockchain.</p>
          {role === 'shippingagent' && (
            <Link href="/pre-arrival/new" className="port-btn-primary mt-4">Start New Declaration</Link>
          )}
        </div>
      )}
    </div>
  );
}
