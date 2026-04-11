'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { FaSignature, FaCube, FaLink, FaClock, FaShieldAlt, FaExternalLinkAlt, FaSyncAlt, FaSync } from 'react-icons/fa';
import HashDisplay from '@/components/shared/HashDisplay';
import { useState } from 'react';
import { toast } from 'sonner';

export default function MerkleAuditPage() {
  const { data: leaves, isLoading, isError, refetch } = useQuery({
    queryKey: ['merkle-audit-list'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/merkle/all');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
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
      toast.success(`Merkle Root ${data.data.rootId} successfully anchored to Polygon PoS`);
      refetch();
    },
    onError: (err: any) => {
      toast.error(`Anchor Failed: ${err.message}`);
    }
  });

  const handleAnchor = () => {
    anchorMutation.mutate();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display flex items-center gap-3">
            <FaSignature className="text-indigo-600" /> Merkle Audit Trail
          </h1>
          <p className="text-color-text-secondary">Verifiable cryptographic proof of document integrity across networks</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => refetch()} 
            className="p-3 border border-portmid rounded-xl hover:bg-portbase transition-all"
          >
            <FaSync className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleAnchor}
            disabled={anchorMutation.isPending || !leaves?.length}
            className="bg-[#1a2f45] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg hover:bg-portaccent transition-all active:scale-95 disabled:opacity-50"
          >
            {anchorMutation.isPending ? <FaSyncAlt className="animate-spin" /> : <FaCube />} 
            Anchor Pending Leaves
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="port-card p-6 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-0 shadow-lg shadow-indigo-200">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Pending Anchor</p>
            <p className="text-5xl font-display my-2">
              {leaves?.filter((l: any) => !l.anchored).length || 0}
            </p>
            <p className="text-xs opacity-90">Cryptographic leaves waiting for L2 settlement.</p>
          </div>

          <div className="port-card p-6 border-l-4 border-l-emerald-500">
            <h4 className="text-xs font-bold uppercase tracking-widest text-color-text-secondary mb-4">Network Status</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Fabric Org1</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Polygon Amoy</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Merkle Worker</span>
                <span className="animate-pulse w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-display text-color-text-primary">Recent Document Leaves</h3>
            <span className="text-[10px] bg-portmid/30 px-2 py-1 rounded text-color-text-secondary uppercase font-bold tracking-tighter">Automatic Snapshot: Real-time</span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
               <div className="py-20 text-center font-display uppercase tracking-widest text-xs text-portaccent animate-pulse">Syncing Merkle Forest...</div>
            ) : isError ? (
               <div className="port-card p-10 bg-rose-50 text-rose-600 text-center text-xs font-bold uppercase tracking-widest">Connection to Ledger Registry Terminated</div>
            ) : leaves && leaves.length > 0 ? (
                leaves.map((leaf: any) => (
                    <div key={leaf.leafId} className="port-card p-6 hover:border-portaccent transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                      <div className="flex gap-4 items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${leaf.anchored ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                          {leaf.anchored ? <FaLink /> : <FaShieldAlt className="animate-pulse" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-color-text-primary capitalize">{(leaf.docType || 'unknown').replace('_', ' ')}</p>
                            <span className="text-[10px] font-mono text-color-text-muted">{leaf.docId || leaf.leafId}</span>
                          </div>
                          <p className="text-[10px] text-color-text-secondary italic uppercase tracking-widest mt-0.5">Leaf ID: {leaf.leafId.split(':').slice(-1)[0]}</p>
                        </div>
                      </div>
      
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <HashDisplay label="Content SHA-256" hash={leaf.contentHash} />
                      </div>
      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-tighter">Status</p>
                          <p className={`text-xs font-bold uppercase tracking-widest ${leaf.anchored ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {leaf.anchored ? 'Anchored' : 'Unanchored'}
                          </p>
                        </div>
                        <button className="w-8 h-8 rounded-full border border-portmid flex items-center justify-center text-color-text-muted hover:bg-portaccent hover:text-white hover:border-portaccent transition-all group-hover:rotate-12">
                          <FaExternalLinkAlt className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))
            ) : (
                <div className="port-card p-20 text-center bg-white/40 flex flex-col items-center gap-4">
                    <FaSignature className="text-5xl text-portmid" />
                    <h3 className="text-xl font-display text-color-text-secondary">No Cryptographic Leaves</h3>
                    <p className="text-sm text-color-text-muted">Perform an action like submitting a pre-arrival to generate a new Merkle leaf.</p>
                </div>
            )}
          </div>
          
          <div className="bg-white/30 border border-dashed border-portmid p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <FaCube className="text-3xl text-portmid/50 mb-2" />
            <p className="text-xs text-color-text-muted font-medium italic">
              "The Merkle Forest protocol periodically rolls up all state-changing transactions into a single root hash, which is anchored to the Polygon PoS public blockchain for cross-network verification."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
