'use client';

import { FaGavel, FaIdCard, FaHospital, FaCheckCircle, FaArrowRight, FaClock, FaShieldAlt, FaShip, FaClipboardCheck, FaSearch } from 'react-icons/fa';
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

  const { data: completedApprovals } = useQuery({
    queryKey: ['completed-approvals', role],
    queryFn: async () => {
      const res = await fetch('/api/fabric/pre-arrival/all');
      const json = await res.json();
      if (!json.success) return [];
      
      // Filter submissions where this agency has approved
      return json.data?.filter((sub: any) => {
        const myApproval = sub.approvals?.find((a: any) => a.agency === role);
        return myApproval && myApproval.approved;
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

  // Stakeholder Journey Steps
  const journeySteps = [
    { id: 1, title: 'Review Submission', description: 'Validate cargo & crew', icon: FaSearch, status: 'active' },
    { id: 2, title: 'Approve/Reject', description: 'Sign compliance decision', icon: FaClipboardCheck, status: 'pending' },
    { id: 3, title: 'Track Compliance', description: 'Monitor status updates', icon: FaShieldAlt, status: 'pending' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stakeholder Journey Banner */}
      <div className="port-card p-6 bg-gradient-to-r from-[#1a2f45] to-[#2a4a6f] text-white rounded-2xl shadow-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-bold mb-1">{config.label} Journey</h3>
            <p className="text-sm opacity-80">Accelerated cross-agency validation through automated compliance on the blockchain.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 sm:gap-2">
          {journeySteps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div key={step.id} className="flex-1 flex flex-row sm:flex-col items-center gap-4 sm:gap-0 sm:text-center group">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 transition-all ${
                  step.status === 'active' 
                    ? 'bg-sky-400 text-[#04172F] shadow-lg shadow-sky-400/20 scale-110 sm:mb-4' 
                    : 'bg-white/10 text-white/40 sm:mb-4'
                }`}>
                  <StepIcon className="text-xl sm:text-2xl" />
                </div>
                <div className="flex-1 sm:flex-none">
                  <p className={`text-[11px] font-black uppercase tracking-[0.15em] ${step.status === 'active' ? 'text-sky-400' : 'text-white/80'}`}>{step.title}</p>
                  <p className="text-[10px] opacity-50 mt-1 leading-tight max-w-[120px] mx-auto">{step.description}</p>
                </div>
                {idx < journeySteps.length - 1 && (
                  <>
                    <FaArrowRight className="hidden sm:block text-white/20 text-xs mt-2 absolute transform translate-x-24" />
                    <div className="sm:hidden w-px h-6 bg-gradient-to-b from-white/20 to-transparent mx-auto my-1 absolute left-7 transform translate-y-12" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agency Status Card */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Reviews - Phase 2 */}
        <div className="space-y-6">
          <h4 className="text-xl font-display text-color-text-primary flex items-center gap-2">
            <FaClock className="text-amber-500" /> Phase 2: Pending Reviews
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            {pendingApprovals?.length ? pendingApprovals.map((sub: any) => (
              <div key={sub.submissionId} className="port-card p-6 bg-white border border-portmid/50 hover:border-portaccent transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-portbase rotate-45 translate-x-8 -translate-y-8 group-hover:bg-portaccent transition-colors" />
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-portbase flex items-center justify-center text-portaccent font-bold shrink-0">
                    <FaShip />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-sm uppercase tracking-tight">{sub.vesselName}</h5>
                    <p className="text-[10px] text-color-text-muted font-mono">{sub.vesselIMO}</p>
                  </div>
                  <Link 
                    href={`/pre-arrival/${sub.submissionId}`}
                    className="bg-portbase group-hover:bg-portaccent group-hover:text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-portaccent transition-all flex items-center gap-2 shrink-0"
                  >
                    Review <FaArrowRight />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4 mt-6 pt-6 border-t border-slate-50">
                  <div className="text-left sm:text-center">
                    <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1">ETA</p>
                    <p className="text-xs font-bold text-[#04172F]">{new Date(sub.etaTimestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1">Purpose</p>
                    <p className="text-xs font-bold text-[#04172F] truncate">{sub.portCallPurpose}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 text-left sm:text-center pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50 sm:border-transparent">
                    <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-2">Status</p>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      sub.status === 'compliant' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>{sub.status}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-10 bg-emerald-50/30 rounded-2xl border-2 border-dashed border-emerald-200 text-center flex flex-col items-center gap-3">
                <FaCheckCircle className="text-4xl text-emerald-400" />
                <div>
                  <h4 className="text-lg font-display text-emerald-800">No Pending Reviews</h4>
                  <p className="text-sm text-emerald-600">All submissions have been processed for your agency.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completed Approvals */}
        <div className="space-y-6">
          <h4 className="text-xl font-display text-color-text-primary flex items-center gap-2 text-emerald-600">
            <FaCheckCircle /> Completed Approvals
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            {completedApprovals?.length ? completedApprovals.slice(0, 5).map((sub: any) => (
              <div key={sub.submissionId} className="port-card p-4 bg-emerald-50/30 border border-emerald-100 hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <FaCheckCircle />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase">{sub.vesselName}</p>
                      <p className="text-[10px] text-color-text-muted font-mono">{sub.vesselIMO}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-emerald-200">
                      Approved
                    </span>
                    <p className="text-[10px] text-color-text-muted mt-1">
                      {new Date(sub.approvals?.find((a: any) => a.agency === role)?.timestamp || sub.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-10 bg-portbase/30 rounded-2xl border border-portmid/20 text-center">
                <p className="text-sm text-color-text-muted italic">No completed approvals yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
