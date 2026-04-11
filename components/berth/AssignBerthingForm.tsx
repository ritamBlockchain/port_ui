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
    <div className="port-card p-6 bg-white border-2 border-indigo-500 shadow-2xl animate-in zoom-in duration-300">
      <div className="flex items-center gap-3 mb-6 border-b border-portmid pb-4">
        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
          <FaBuilding className="text-xl" />
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

        <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
           <input 
            type="checkbox" 
            id="override" 
            checked={formData.isOverride} 
            onChange={(e) => setFormData({...formData, isOverride: e.target.checked})}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
           />
           <label htmlFor="override" className="text-xs font-medium text-indigo-700">Override existing schedules and force priority allocation</label>
        </div>

        <button 
          disabled={assignBerthMutation.isPending}
          type="submit" 
          className="w-full port-btn-primary bg-indigo-600 hover:bg-indigo-700 py-4 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
        >
          {assignBerthMutation.isPending ? <FaAnchor className="animate-spin" /> : <FaCheckCircle />}
          {assignBerthMutation.isPending ? 'Broadcasting to Registry...' : 'Authorize Berth Assignment'}
        </button>
      </form>
    </div>
  );
}
