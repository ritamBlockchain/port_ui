'use client';

import { useQuery } from '@tanstack/react-query';
import { FaCertificate, FaIdCard, FaCheckCircle, FaExclamationTriangle, FaPlus, FaQrcode, FaArrowRight, FaSync } from 'react-icons/fa';
import Link from 'next/link';

export default function CredentialsPage() {
  const { data: credentials, isLoading, isError, refetch } = useQuery({
    queryKey: ['credentials-list'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/credentials/all');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display">Credential Registry</h1>
          <p className="text-color-text-secondary">Verifiable digital identities and compliance certificates</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => refetch()} className="p-2 border border-portmid rounded-lg text-portaccent">
                <FaSync className={isLoading ? 'animate-spin' : ''} />
            </button>
            <Link href="/credentials/revocations" className="px-4 py-2 border border-rose-200 text-rose-600 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-rose-50 transition-all">
                <FaExclamationTriangle /> Revocation List
            </Link>
            <Link href="/credentials/issue" className="port-btn-primary flex items-center gap-2">
            <FaPlus /> Issue New Credential
            </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-portaccent">
          <FaSync className="text-4xl animate-spin" />
          <p className="font-display">Querying Cryptographic Master Index...</p>
        </div>
      ) : isError ? (
        <div className="port-card p-10 bg-rose-50 border-rose-200 text-center">
            <FaExclamationTriangle className="text-4xl text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-display text-rose-700">Ledger Error</h3>
            <p className="text-sm text-rose-600">Failed to fetch the verifiable credential registry from Hyperledger Fabric.</p>
        </div>
      ) : credentials && credentials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((cred: any) => {
            // Normalize ID from did:portchain: format if needed
            const displayId = cred.id.includes(':') ? cred.id.split(':').pop() : cred.id;
            
            return (
              <div key={cred.id} className="relative port-card p-6 flex flex-col gap-4 group hover:ring-2 hover:ring-portaccent transition-all animate-in zoom-in-95 duration-300">
                <div className={`absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity`}>
                  <FaCertificate className="text-[120px] -rotate-12 translate-x-8 -translate-y-8" />
                </div>

                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-portaccent/10 flex items-center justify-center text-portaccent">
                    <FaIdCard className="text-xl" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                    cred.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                  }`}>
                    {cred.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-xl text-color-text-primary truncate">{cred.credentialType}</h3>
                  <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest">{cred.entityName}</p>
                </div>

                <div className="mt-4 space-y-2 pt-4 border-t border-portmid/30">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-color-text-muted italic">
                    <span>Issued By</span>
                    <span className="truncate ml-2">{cred.issuingAuthority}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-color-text-secondary">
                    <span>Expires On</span>
                    <span className={cred.status === 'expired' ? 'text-rose-500 font-bold' : ''}>{new Date(cred.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex gap-2">
                  <Link 
                    href={`/credentials/${displayId}`}
                    className="flex-1 bg-white border border-portmid text-color-text-secondary font-bold text-[10px] uppercase tracking-widest py-2 rounded-lg hover:bg-portbase transition-all flex items-center justify-center gap-2"
                  >
                    <FaQrcode /> Verify VC
                  </Link>
                  <button className="w-10 h-10 rounded-lg bg-portaccent/10 text-portaccent flex items-center justify-center hover:bg-portaccent hover:text-white transition-all">
                    <FaArrowRight className="text-sm" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="port-card p-20 text-center flex flex-col items-center gap-4 bg-white/40">
          <FaCertificate className="text-5xl text-portmid" />
          <h3 className="text-2xl font-display text-color-text-secondary">No Live Credentials</h3>
          <p className="text-sm text-color-text-muted max-w-md">No verifiable certificates have been issued on this channel yet. Use the "Issue New Credential" button to create one.</p>
        </div>
      )}

      {/* Verification Service Info */}
      <div className="bg-[#1a2f45] text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-8 border border-white/10">
        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-4xl text-white outline outline-8 outline-white/5">
          <FaCheckCircle />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-display mb-2">Zero-Knowledge Verification</h2>
          <p className="text-sm opacity-80 max-w-2xl leading-relaxed">
            All PortChain credentials utilize the W3C Verifiable Credentials standard. Parties can verify the authenticity of a certificate without contacting the issuing authority, directly against the ledger state.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <button className="bg-white text-[#1a2f45] px-6 py-2 rounded-lg font-bold text-sm tracking-wide hover:bg-opacity-90 transition-all uppercase">Verify External VC</button>
          <button className="bg-white/10 text-white border border-white/20 px-6 py-2 rounded-lg font-bold text-sm tracking-wide hover:bg-white/20 transition-all uppercase">Download Manifest</button>
        </div>
      </div>
    </div>
  );
}
