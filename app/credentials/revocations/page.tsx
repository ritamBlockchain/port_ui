'use client';

import { useQuery } from '@tanstack/react-query';
import { FaBan, FaSync, FaExclamationCircle } from 'react-icons/fa';
import Link from 'next/link';

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === 'none') return 'N/A';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

export default function RevocationListPage() {
  const { data: revocations, isLoading, isError, refetch } = useQuery({
    queryKey: ['revocation-list'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/credentials/revocation-list');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display">Credential Revocation List</h1>
          <p className="text-color-text-secondary">Official registry of revoked credentials</p>
        </div>
        <button onClick={() => refetch()} className="p-2 border border-portmid rounded-lg text-portaccent">
          <FaSync className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-portaccent">
          <FaSync className="text-4xl animate-spin" />
          <p className="font-display">Loading Revocation List...</p>
        </div>
      ) : isError ? (
        <div className="port-card p-10 bg-rose-50 border-rose-200 text-center">
          <FaExclamationCircle className="text-4xl text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-display text-rose-700">Ledger Error</h3>
          <p className="text-sm text-rose-600">Failed to fetch revocation list from Hyperledger Fabric.</p>
        </div>
      ) : revocations && revocations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {revocations.map((rev: any) => (
            <div key={rev.credentialId} className="port-card p-6 bg-rose-50 border-rose-200 border-l-8 border-l-rose-500 flex items-center justify-between animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <FaBan className="text-xl" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-rose-900">{rev.credentialId}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-xs font-bold text-rose-700">{rev.credentialType}</p>
                    <p className="text-[10px] text-rose-600">{rev.entityId}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-700">Revoked At</p>
                <p className="text-xs font-medium text-rose-800">{formatDate(rev.revokedAt)}</p>
                <p className="text-[10px] text-rose-600 mt-1">By: {rev.revokedBy.split('@')[0]}</p>
                <p className="text-[8px] text-rose-500 italic mt-1 max-w-xs truncate">{rev.revocationReason}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="port-card p-20 text-center flex flex-col items-center gap-4 bg-white/40">
          <FaBan className="text-5xl text-portmid" />
          <h3 className="text-2xl font-display text-color-text-secondary">No Revoked Credentials</h3>
          <p className="text-sm text-color-text-muted max-w-md">No credentials have been revoked on this channel yet.</p>
          <Link href="/credentials" className="mt-4 text-portaccent font-bold uppercase tracking-widest text-xs">← Back to Registry</Link>
        </div>
      )}
    </div>
  );
}
