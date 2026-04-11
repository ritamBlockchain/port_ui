'use client';

import { FaGavel, FaIdCard, FaHospital, FaCheckCircle, FaExclamationCircle, FaArrowRight, FaClock, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/api/auth';

export default function RegulatoryDashboard() {
  const { role } = useAuth();
  
  const { data: pendingApprovals } = useQuery({
    queryKey: ['pending-approvals', role],
    queryFn: async () => {
      const res = await fetch('/api/fabric/pre-arrival/all');
      const json = await res.json();
      if (!json.success) return [];
      
      // Filter submissions where this agency hasn't approved yet
      return json.data?.filter((sub: any) => {
        const myApproval = sub.approvals?.find((a: any) => a.agency === role);
        return !myApproval && sub.status !== 'approved';
      }) || [];
    }
  });

  const config = {
    customs: { icon: FaGavel, color: 'bg-amber-600', label: 'Customs Clearance' },
    immigration: { icon: FaIdCard, color: 'bg-green-600', label: 'Immigration Control' },
    portHealth: { icon: FaHospital, color: 'bg-pink-500', label: 'Port Health Inspection' },
    admin: { icon: FaShieldAlt, color: 'bg-red-600', label: 'Regulatory Oversight' }
  }[role as string] || { icon: FaShieldAlt, color: 'bg-portaccent', label: 'Agency Review' };

  const Icon = config.icon;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="port-card p-8 bg-white border border-portmid/50 flex flex-col md:flex-row items-center gap-8 shadow-sm">
        <div className={`w-20 h-20 rounded-3xl ${config.color} text-white flex items-center justify-center text-4xl shadow-lg`}>
          <Icon />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-3xl font-display text-color-text-primary mb-2">{config.label}</h3>
          <p className="text-color-text-secondary max-w-2xl">
            As an authorized regulatory authority, you are required to review vessel declarations and sign off on compliance via the distributed ledger. 
            Triple-agency approval is mandatory for port entry.
          </p>
        </div>
        <div className="bg-portbase px-6 py-4 rounded-2xl border border-portmid text-center shrink-0">
          <p className="text-4xl font-display text-portaccent">{pendingApprovals?.length || 0}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted mt-1">Pending Actions</p>
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-xl font-display text-color-text-primary flex items-center gap-2">
          <FaClock className="text-amber-500" /> Critical Pending Reviews
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingApprovals?.length ? pendingApprovals.map((sub: any) => (
            <div key={sub.submissionId} className="port-card p-6 bg-white border border-portmid/50 hover:border-portaccent transition-all group group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-portbase rotate-45 translate-x-8 -translate-y-8 group-hover:bg-portaccent transition-colors" />
              
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-portbase flex items-center justify-center text-portaccent font-bold">
                    <FaShip />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm uppercase tracking-tight line-clamp-1">{sub.vesselName}</h5>
                    <p className="text-[10px] text-color-text-muted font-mono">{sub.vesselIMO}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-color-text-muted">
                    <span>ETA</span>
                    <span className="text-color-text-primary">{new Date(sub.etaTimestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-color-text-muted">
                    <span>Purpose</span>
                    <span className="text-color-text-primary">{sub.portCallPurpose}</span>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-color-text-muted">
                    <span>Status</span>
                    <span className="bg-amber-50 text-amber-600 px-2 rounded border border-amber-200">{sub.status}</span>
                  </div>
                </div>

                <Link 
                  href={`/pre-arrival/${sub.submissionId}`}
                  className="mt-auto w-full bg-portbase group-hover:bg-portaccent group-hover:text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-portaccent text-center transition-all flex items-center justify-center gap-2"
                >
                  Verify Compliance <FaArrowRight />
                </Link>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 bg-emerald-50/30 rounded-3xl border-2 border-dashed border-emerald-200 text-center flex flex-col items-center gap-4">
              <FaCheckCircle className="text-5xl text-emerald-400" />
              <div>
                <h4 className="text-xl font-display text-emerald-800">Operational Queue Empty</h4>
                <p className="text-sm text-emerald-600">All current submissions have been processed for your agency.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
