'use client';

import { FaUserShield, FaCertificate, FaSignature, FaServer, FaCogs, FaCheckCircle, FaExclamationCircle, FaArrowRight, FaBolt, FaSyncAlt } from 'react-icons/fa';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: credentials } = useQuery({
    queryKey: ['admin-credentials'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/credentials/all');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  const { data: merkleStats, refetch: refetchUnanchored } = useQuery({
    queryKey: ['admin-merkle'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/merkle/unanchored');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  const { data: health } = useQuery({
    queryKey: ['admin-health'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/health');
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 30000,
  });

  const { data: allLeaves, refetch: refetchAll } = useQuery({
    queryKey: ['admin-merkle-all'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/merkle/all');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  const anchorMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/fabric/merkle/anchor', { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (data) => {
      toast.success(`Merkle Root ${data.data.rootId} broadcast successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-merkle'] });
      queryClient.invalidateQueries({ queryKey: ['admin-merkle-all'] });
      refetchUnanchored();
      refetchAll();
    },
    onError: (err: any) => {
      toast.error(`Broadcast Failed: ${err.message}`);
    }
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Network Governance Hero */}
        <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#04172F] via-[#0a2a54] to-[#04172F] p-10 text-white shadow-2xl shadow-black/30 border border-white/5 transition-all duration-500">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center border border-sky-400/30 shadow-inner">
                <FaUserShield className="text-sky-400 text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400/60 leading-none mb-1">Administrative Node</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v{process.env.NEXT_PUBLIC_APP_VERSION || '4.2.0'} PROD</span>
              </div>
            </div>
            <h3 className="text-4xl font-display font-bold mb-4 tracking-tight">Network <span className="text-sky-400 font-light italic">Governance</span></h3>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-10">
              Centralized authority for platform identity management, cryptographic audit anchoring, and secure gateway orchestration.
            </p>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white/5 backdrop-blur-2xl p-4 sm:p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group/stat">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-hover/stat:text-sky-400 transition-colors">Gateway Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${health?.gateway === 'Connected' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'} transition-colors`} />
                <p className="text-xl sm:text-2xl font-display font-bold truncate">{health?.gateway || 'Active'}</p>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-2xl p-4 sm:p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group/stat">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-hover/stat:text-sky-400 transition-colors">Audit Capacity</p>
              <p className="text-xl sm:text-2xl font-display font-bold font-mono">{allLeaves?.length ?? '0'}</p>
            </div>
          </div>
          
          {/* Background Decorative Element */}
          <div className="absolute -right-12 -bottom-12 text-[280px] text-sky-400 opacity-5 pointer-events-none transform rotate-12 group-hover:rotate-6 transition-transform duration-1000">
            <FaUserShield />
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/credentials" className="group relative p-8 bg-white rounded-[2.5rem] border border-[#04172F]/5 shadow-xl hover:shadow-2xl hover:border-sky-500/20 transition-all duration-500 overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-[#04172F] flex items-center justify-center text-3xl mb-8 group-hover:bg-[#04172F] group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-sm border border-sky-100">
                <FaCertificate />
              </div>
              <h4 className="text-2xl font-bold text-[#04172F]">Issue Credentials</h4>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">Sign and issue verifiable maritime certificates to authorized entities.</p>
            </div>
            <div className="relative z-10 mt-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-sky-600">
              Governance Layer <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </div>
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-sky-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </Link>

          <Link href="/merkle" className="group relative p-8 bg-white rounded-[2.5rem] border border-[#04172F]/5 shadow-xl hover:shadow-2xl hover:border-sky-500/20 transition-all duration-500 overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-3xl mb-8 group-hover:bg-[#04172F] group-hover:text-white group-hover:-rotate-6 transition-all duration-500 shadow-sm border border-sky-100">
                <FaSignature />
              </div>
              <h4 className="text-2xl font-bold text-[#04172F]">Anchor Audit</h4>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">Commit cryptographic Merkle roots to L1 for absolute public immutability.</p>
            </div>
            <div className="relative z-10 mt-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-sky-600">
              Trust Layer <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </div>
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-sky-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Registry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-lg font-display font-bold text-[#04172F] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#04172F] flex items-center justify-center text-sm shadow-sm border border-sky-100">
                <FaCertificate />
              </div>
              Recent Certifications
            </h4>
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#04172F] transition-colors border-b border-transparent hover:border-[#04172F]">Global Registry</button>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-[#04172F]/5 shadow-2xl overflow-hidden">
            <div className="divide-y divide-slate-50">
              {credentials?.length ? credentials.slice(0, 5).map((cr: any, idx: number) => (
                <div key={cr.id} className="group p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#04172F] group-hover:scale-110 group-hover:bg-[#04172F] group-hover:text-white transition-all duration-500 shadow-sm">
                      <FaCheckCircle className="text-xl" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#04172F] mb-1">{cr.credentialType}</p>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        {cr.entityName} <span className="w-1 h-1 rounded-full bg-slate-200" /> <span className="font-mono text-slate-500">{cr.entityId}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                      Active
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(cr.issuedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-inner border border-slate-100">
                    <FaCertificate className="text-3xl" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Registry Synchronization Pending</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Anchoring & Trust Metrics */}
        <div className="space-y-6">
          <h4 className="text-lg font-display font-bold text-[#04172F] flex items-center gap-3 px-4">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-sm shadow-sm border border-sky-100">
              <FaSignature />
            </div>
            Trust Metrics
          </h4>
          
          <div className="bg-white rounded-[2.5rem] p-10 border border-[#04172F]/5 shadow-2xl space-y-10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Unanchored Docs</p>
                <p className={`text-5xl font-display font-bold ${merkleStats?.length > 0 ? 'text-amber-500' : 'text-emerald-500'} tracking-tighter`}>
                  {merkleStats?.length || 0}
                </p>
              </div>
              <div className="w-14 h-14 rounded-full border-[6px] border-slate-50 border-t-emerald-500 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                {allLeaves?.length > 0 
                  ? Math.round(((allLeaves.length - (merkleStats?.length || 0)) / allLeaves.length) * 100)
                  : 100}%
              </div>
            </div>
            
            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner group/hash cursor-help">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sky-600"><FaServer /> Latest Merkle Root</span>
                <span className="opacity-0 group-hover/hash:opacity-100 transition-opacity">LEDGER v2</span>
              </p>
              <p className="text-[11px] font-mono break-all text-[#04172F] font-bold leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                {allLeaves?.length > 0 ? allLeaves[0]?.contentHash || '0x7f8e3d...9a2b7c' : '0x0000...0000'}
              </p>
            </div>

            <button 
              onClick={() => anchorMutation.mutate()}
              disabled={anchorMutation.isPending || (merkleStats?.length || 0) === 0}
              className="group w-full relative min-h-[4rem] py-4 bg-[#04172F] text-white rounded-2xl text-xs font-black uppercase tracking-widest sm:tracking-[0.25em] overflow-hidden hover:bg-[#0a2a54] transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-2xl shadow-black/20"
            >
              <div className="relative z-10 flex flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                <div className="flex-shrink-0">
                  {anchorMutation.isPending ? <FaSyncAlt className="animate-spin text-sm" /> : <FaBolt className="text-sky-400 text-sm group-hover:animate-bounce" />}
                </div>
                <span className="text-center leading-tight">Broadcast Audit Root</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            </button>
            
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-[9px] text-center text-slate-400 uppercase font-black tracking-widest">
                Secured by PortChain Protocol
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
