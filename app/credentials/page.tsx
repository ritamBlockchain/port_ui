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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display text-color-text-primary">Credential Registry</h1>
          <p className="text-color-text-secondary text-sm sm:text-base">Verifiable digital identities and compliance certificates</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button onClick={() => refetch()} className="p-3 border border-portmid rounded-xl text-portaccent hover:bg-portbase transition-all">
                <FaSync className={isLoading ? 'animate-spin' : ''} />
            </button>
            <Link href="/credentials/revocations" className="flex-1 lg:flex-none px-4 py-3 border border-rose-200 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-rose-50 transition-all">
                <FaExclamationTriangle /> Revocations
            </Link>
            <Link href="/credentials/issue" className="flex-[2] lg:flex-none px-6 py-3 bg-[#04172F] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#0a2a54] transition-all shadow-xl shadow-black/10">
                <FaPlus /> Issue New
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
      <div className="bg-[#04172F] text-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row items-center gap-10 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-[2rem] bg-white/5 backdrop-blur-xl flex items-center justify-center text-4xl sm:text-5xl text-sky-400 border border-white/10 shadow-inner relative z-10">
          <FaCheckCircle />
        </div>
        <div className="flex-1 text-center lg:text-left relative z-10">
          <h2 className="text-2xl sm:text-3xl font-display mb-4">Zero-Knowledge Verification</h2>
          <p className="text-sm sm:text-base opacity-60 max-w-2xl leading-relaxed">
            All PortChain credentials utilize the W3C Verifiable Credentials standard. Parties can verify the authenticity of a certificate without contacting the issuing authority, directly against the ledger state.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto relative z-10">
          <button className="flex-1 px-8 py-4 bg-sky-400 text-[#04172F] rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-sky-300 transition-all uppercase shadow-lg shadow-sky-400/20">Verify External VC</button>
          <button className="flex-1 px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all uppercase">Download Manifest</button>
        </div>
      </div>
    </div>
  );
}
