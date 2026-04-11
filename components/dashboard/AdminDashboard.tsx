'use client';

import { FaUserShield, FaCertificate, FaSignature, FaServer, FaCogs, FaCheckCircle, FaExclamationCircle, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

export default function AdminDashboard() {
  const { data: credentials } = useQuery({
    queryKey: ['admin-credentials'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/credentials/all');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  const { data: merkleStats } = useQuery({
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

  const { data: allLeaves } = useQuery({
    queryKey: ['admin-merkle-all'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/merkle/all');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="port-card p-8 bg-[#1a2f45] text-white space-y-6 border-none relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-3xl font-display mb-2">Network Governance</h3>
              <p className="text-sm opacity-70 max-w-md leading-relaxed">
                Platform administration, identity management, and cryptographic anchoring tasks are centralized here.
              </p>
           </div>
           
           <div className="relative z-10 grid grid-cols-2 gap-4">
               <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/5">
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Gateway Status</p>
                 <p className="text-2xl font-display">{health?.gateway || '...'}</p>
               </div>
               <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/5">
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Total Merkle Leaves</p>
                 <p className="text-2xl font-display font-mono">{allLeaves?.length ?? '...'}</p>
               </div>
           </div>
           
           <div className="absolute right-0 bottom-0 text-[180px] opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
              <FaUserShield />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Link href="/credentials" className="port-card p-6 bg-white border border-portmid hover:border-purple-600 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
                 <FaCertificate />
              </div>
              <h4 className="font-bold text-color-text-primary">Issue Credentials</h4>
              <p className="text-xs text-color-text-secondary mt-1">Sign and issue verifiable ship/crew certificates.</p>
           </Link>

           <Link href="/merkle" className="port-card p-6 bg-white border border-portmid hover:border-portaccent transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl mb-4 group-hover:bg-portaccent group-hover:text-white transition-all">
                 <FaSignature />
              </div>
              <h4 className="font-bold text-color-text-primary">Anchor Audit Log</h4>
              <p className="text-xs text-color-text-secondary mt-1">Commit Merkle roots to L1/L2 for public immutability.</p>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <h4 className="text-lg font-display text-color-text-primary flex items-center gap-2">
              <FaCertificate className="text-purple-600" /> Recent Credentials Issued
           </h4>
           <div className="port-card bg-white border border-portmid/50 overflow-hidden shadow-sm">
              <div className="divide-y divide-portmid/10">
                 {credentials?.length ? credentials.slice(0, 5).map((cr: any) => (
                   <div key={cr.id} className="p-4 flex items-center justify-between hover:bg-portbase/20 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-sm">
                            <FaCheckCircle />
                         </div>
                         <div>
                            <p className="text-sm font-bold">{cr.credentialType}</p>
                            <p className="text-[10px] text-color-text-muted uppercase font-bold tracking-tighter">{cr.entityName} • {cr.entityId}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-50 text-emerald-600">
                            Active
                         </span>
                         <p className="text-[10px] text-color-text-muted mt-1 uppercase font-bold tracking-tighter">
                            {new Date(cr.issuedAt).toLocaleDateString()}
                         </p>
                      </div>
                   </div>
                 )) : (
                   <p className="p-10 text-center text-sm italic text-color-text-muted">No credentials found in registry</p>
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <h4 className="text-lg font-display text-color-text-primary flex items-center gap-2">
              <FaSignature className="text-indigo-600" /> Anchoring Health
           </h4>
           <div className="port-card p-6 bg-white border border-portmid/50 space-y-6">
              <div className="flex justify-between items-center">
                 <span className="text-xs font-bold uppercase tracking-widest text-color-text-secondary">Unanchored Docs</span>
                 <span className={`text-sm font-mono font-bold ${merkleStats?.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {merkleStats?.length || 0}
                 </span>
              </div>
              
              <div className="bg-portbase rounded-xl p-4 border border-portmid">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted mb-2">Last Anchored Leaf Hash</p>
                 <p className="text-[10px] font-mono break-all opacity-80">
                   {allLeaves?.length > 0 ? allLeaves[allLeaves.length - 1]?.contentHash?.substring(0, 16) + '...' : 'No leaves recorded'}
                 </p>
               </div>

              {merkleStats?.length > 0 && (
                <button className="w-full bg-portaccent text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-portaccent/20">
                   Broadcast Merkle Root
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
