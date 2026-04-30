'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FaBuilding, FaShip, FaClock, FaAnchor, FaCheckCircle } from 'react-icons/fa';

interface AssignBerthingFormProps {
  submissionId: string;
  vesselName: string;
  vesselIMO: string;
  onSuccess?: () => void;
}

export default function AssignBerthingForm({ submissionId, vesselName, vesselIMO, onSuccess }: AssignBerthingFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    berthId: 'BERTH-A',
    berthName: 'Alpha North Quay',
    timeSlot: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
    pilotageInfo: 'Harbor Pilot Req',
    isOverride: false
  });

  const assignBerthMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/fabric/berth/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success(`Berth ${formData.berthId} assigned to ${vesselName}`);
      queryClient.invalidateQueries({ queryKey: ['pre-arrival', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['pre-arrival-list'] });
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error(`Assignment Failed: ${err.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignmentId = `ASGN_${Date.now()}`;
    assignBerthMutation.mutate({
      assignmentId,
      submissionId,
      vesselIMO,
      ...formData
    });
  };

  return (
    <div className="port-card p-10 bg-white border-none shadow-[0_32px_64px_-16px_rgba(4,23,47,0.15)] animate-in zoom-in duration-500 rounded-[2.5rem]">
      <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-8">
        <div className="w-14 h-14 bg-sky-50 text-[#04172F] rounded-2xl flex items-center justify-center border border-sky-100 shadow-inner">
          <FaBuilding className="text-2xl" />
        </div>
        <div>
          <h3 className="text-xl font-display text-color-text-primary">Assign Berth Portfolio</h3>
          <p className="text-[10px] text-color-text-secondary uppercase font-bold tracking-widest">Vessel: {vesselName} ({vesselIMO})</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-secondary">Berth ID</label>
            <select 
              value={formData.berthId}
              onChange={(e) => setFormData({...formData, berthId: e.target.value})}
              className="port-input w-full"
            >
              <option value="BERTH-A">BERTH Alpha</option>
              <option value="BERTH-B">BERTH Beta</option>
              <option value="BERTH-C">BERTH Gamma</option>
              <option value="BERTH-HOTEL">HOTEL Anchorage</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-secondary">Berth Name / Location</label>
            <input 
              value={formData.berthName}
              onChange={(e) => setFormData({...formData, berthName: e.target.value})}
              className="port-input w-full"
              placeholder="e.g. Quay 12 South"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-secondary">Arrival Time Slot</label>
            <input 
              type="datetime-local"
              value={formData.timeSlot}
              onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
              className="port-input w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-secondary">Pilotage Instructions</label>
            <input 
              value={formData.pilotageInfo}
              onChange={(e) => setFormData({...formData, pilotageInfo: e.target.value})}
              className="port-input w-full"
              placeholder="e.g. Pilot boarding at buoy 1"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:bg-slate-100/50 group/check">
           <input 
            type="checkbox" 
            id="override" 
            checked={formData.isOverride} 
            onChange={(e) => setFormData({...formData, isOverride: e.target.checked})}
            className="w-5 h-5 text-[#04172F] rounded-lg border-slate-300 focus:ring-sky-500 transition-all cursor-pointer"
           />
           <label htmlFor="override" className="text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer group-hover/check:text-[#04172F] transition-colors">Force Priority Allocation (Override Schedules)</label>
        </div>

        <button 
          disabled={assignBerthMutation.isPending}
          type="submit" 
          className="group w-full relative min-h-[4.5rem] py-4 bg-[#04172F] text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.25em] overflow-hidden hover:bg-[#0a2a54] transition-all disabled:opacity-20 shadow-2xl shadow-black/20"
        >
          <div className="relative z-10 flex flex-row items-center justify-center gap-4">
            {assignBerthMutation.isPending ? <FaAnchor className="animate-spin text-lg" /> : <FaCheckCircle className="text-sky-400 text-lg group-hover:scale-110 transition-transform" />}
            <span>{assignBerthMutation.isPending ? 'Broadcasting to Registry...' : 'Authorize Berth Assignment'}</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
        </button>
      </form>
    </div>
  );
}
