'use client';

import { useAuth } from '@/lib/api/auth';
import { FaAnchor, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function BerthPanel({ submissionId, currentBerth, status }: { submissionId: string, currentBerth?: string, status: string }) {
  const { role } = useAuth();
  const [berthId, setBerthId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const queryClient = useQueryClient();

  const canAssign = (role === 'portauthority' || role === 'admin') && status === 'approved';

  const handleAssign = async () => {
    if (!berthId) return;
    setIsAssigning(true);
    try {
      const res = await fetch('/api/fabric/berth/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, berthId, isOverride: false })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success(`Berth ${berthId} assigned successfully`);
      queryClient.invalidateQueries({ queryKey: ['pre-arrival', submissionId] });
    } catch (err: any) {
      toast.error(`Berth assignment failed: ${err.message}`);
    } finally {
      setIsAssigning(false);
    }
  };

  if (currentBerth) {
    return (
      <div className="port-card p-6 bg-emerald-50 border-emerald-200 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-600/20">
          <FaAnchor />
        </div>
        <div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Assigned Berth</p>
           <p className="text-xl font-display text-emerald-900">{currentBerth}</p>
        </div>
        <FaCheckCircle className="ml-auto text-emerald-500 text-2xl" />
      </div>
    );
  }

  if (!canAssign) return null;

  return (
    <div className="port-card overflow-hidden shadow-lg border-2 border-indigo-600/20 bg-white">
      <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
        <h3 className="font-display text-lg flex items-center gap-2">
          <FaMapMarkerAlt /> Berth Allocation
        </h3>
        <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-bold uppercase tracking-widest">
          Phase 3 Action
        </span>
      </div>
      
      <div className="p-6 space-y-4">
        <p className="text-sm text-color-text-secondary">Allocate a physical terminal spot for the vessel. This enables port service logging.</p>
        <div className="flex gap-2">
           <input 
            type="text" 
            placeholder="Enter Berth ID (e.g. B-24)"
            className="port-input flex-1"
            value={berthId}
            onChange={(e) => setBerthId(e.target.value)}
           />
           <button 
            disabled={isAssigning || !berthId}
            onClick={handleAssign}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest"
           >
             {isAssigning ? 'Linking...' : 'Assign'}
           </button>
        </div>
      </div>
    </div>
  );
}
