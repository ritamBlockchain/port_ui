'use client';

import { FaShip, FaGavel, FaBuilding, FaAnchor, FaFileInvoice, FaFileContract, FaCertificate, FaCheckCircle, FaArrowRight, FaArrowDown, FaClock, FaShieldAlt } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';

interface PhaseData {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  benefits: string[];
  steps: string[];
}

const phases: PhaseData[] = [
  {
    id: 1,
    title: 'Pre-Arrival Notification',
    subtitle: '2-7 Days Before Arrival',
    icon: FaShip,
    color: 'bg-blue-500',
    benefits: ['70% faster than manual submission', 'Real-time status tracking', 'Private cargo data encrypted'],
    steps: ['Submit vessel details', 'Upload cargo manifest', 'Provide crew list', 'Automated compliance check']
  },
  {
    id: 2,
    title: 'Multi-Agency Approval',
    subtitle: '1-3 Days',
    icon: FaGavel,
    color: 'bg-purple-500',
    benefits: ['Single submission replaces multiple forms', 'Immutable approval history', 'Parallel agency review'],
    steps: ['Customs review', 'Immigration review', 'Port Health review', 'All 3 required for approval']
  },
  {
    id: 3,
    title: 'Berth Assignment',
    subtitle: 'Upon Approval',
    icon: FaBuilding,
    color: 'bg-indigo-500',
    benefits: ['Data-driven berth assignment', 'Transparent assignment history', 'Sensitive operational data protected'],
    steps: ['Select berth based on vessel size', 'Set time slot', 'Assign pilotage requirements', 'Confirm assignment']
  },
  {
    id: 4,
    title: 'Port Service Request & Execution',
    subtitle: 'Day of Arrival',
    icon: FaAnchor,
    color: 'bg-amber-500',
    benefits: ['Real-time service status updates', 'Built-in dispute mechanism', 'Automated invoicing trigger'],
    steps: ['Request services (pilotage, tug, etc.)', 'Provider accepts request', 'Service started & logged', 'Service completed']
  },
  {
    id: 5,
    title: 'Automated Invoicing & Settlement',
    subtitle: 'Post-Service',
    icon: FaFileInvoice,
    color: 'bg-emerald-500',
    benefits: ['90% reduction in manual processing', 'Eliminates calculation errors', 'Complete payment audit trail'],
    steps: ['Generate invoice from service logs', 'Apply rates & discounts', 'Calculate tax', 'Confirm payment']
  },
  {
    id: 6,
    title: 'Electronic Bill of Lading',
    subtitle: 'Optional - For Cargo',
    icon: FaFileContract,
    color: 'bg-rose-500',
    benefits: ['Paperless bill of lading', 'Instant transfer vs 5-7 days', 'Immutable ownership chain'],
    steps: ['Create draft EBL', 'Collaborative revision', 'Commit & issue EBL', 'Transfer to consignee']
  },
  {
    id: 7,
    title: 'Digital Credentials',
    subtitle: 'For Vessels & Companies',
    icon: FaCertificate,
    color: 'bg-cyan-500',
    benefits: ['Cryptographically verifiable', 'Instant verification', 'Automated expiry tracking'],
    steps: ['Issue credentials (IMO, Safety, etc.)', 'Generate QR code', 'Verify via QR scan', 'Track expiry & revocation']
  }
];

export default function PortChainFlow() {
  const { data: submissions } = useQuery({
    queryKey: ['flow-submissions'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/pre-arrival/all');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  const { data: serviceLogs } = useQuery({
    queryKey: ['flow-services'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/services/all');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  const { data: invoices } = useQuery({
    queryKey: ['flow-invoices'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/invoices/all');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  const { data: ebls } = useQuery({
    queryKey: ['flow-ebls'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/ebl/get');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  // Calculate phase status
  const getPhaseStatus = (phaseId: number) => {
    switch (phaseId) {
      case 1:
        const pending = submissions?.filter((s: any) => s.status === 'pending').length || 0;
        const compliant = submissions?.filter((s: any) => s.status === 'compliant').length || 0;
        return { active: pending + compliant, completed: compliant };
      case 2:
        const approved = submissions?.filter((s: any) => s.status === 'approved').length || 0;
        return { active: approved, completed: approved };
      case 3:
        const withBerth = submissions?.filter((s: any) => s.berthId).length || 0;
        return { active: withBerth, completed: withBerth };
      case 4:
        const started = serviceLogs?.filter((l: any) => l.status === 'started').length || 0;
        const completed = serviceLogs?.filter((l: any) => l.status === 'completed').length || 0;
        return { active: started + completed, completed };
      case 5:
        const issued = invoices?.filter((i: any) => i.status === 'issued').length || 0;
        const paid = invoices?.filter((i: any) => i.status === 'paid').length || 0;
        return { active: issued + paid, completed: paid };
      case 6:
        const issuedEBL = ebls?.filter((e: any) => e.status === 'issued').length || 0;
        return { active: issuedEBL, completed: issuedEBL };
      case 7:
        return { active: 0, completed: 0 }; // Credentials data not fetched
      default:
        return { active: 0, completed: 0 };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Flow Header */}
      <div className="port-card p-8 bg-gradient-to-r from-[#1a2f45] to-[#2a4a6f] text-white rounded-3xl shadow-2xl border border-white/10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-portaccent/20 flex items-center justify-center text-2xl text-portaccent border border-portaccent/30">
            <FaShip />
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold">PortChain Complete Flow</h2>
            <p className="text-sm opacity-80">End-to-end blockchain-powered port operations</p>
          </div>
        </div>
        
        {/* Quantified Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-display font-bold text-portaccent">70%</p>
            <p className="text-[10px] uppercase tracking-widest opacity-80 mt-1">Faster Clearance</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-display font-bold text-portaccent">90%</p>
            <p className="text-[10px] uppercase tracking-widest opacity-80 mt-1">Less Manual Work</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-display font-bold text-portaccent">60%</p>
            <p className="text-[10px] uppercase tracking-widest opacity-80 mt-1">Faster Payment</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-display font-bold text-portaccent">40%</p>
            <p className="text-[10px] uppercase tracking-widest opacity-80 mt-1">Cost Reduction</p>
          </div>
        </div>
      </div>

      {/* Phase Flow */}
      <div className="space-y-4">
        {phases.map((phase, idx) => {
          const Icon = phase.icon;
          const status = getPhaseStatus(phase.id);
          
          return (
            <div key={phase.id} className="port-card bg-white border border-portmid/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
              <div className="p-6 flex items-start gap-6">
                {/* Phase Icon & Number */}
                <div className="flex-shrink-0">
                  <div className={`${phase.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg relative`}>
                    <Icon className="text-2xl" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold text-portaccent shadow-md border-2 border-portaccent">
                      {phase.id}
                    </div>
                  </div>
                </div>

                {/* Phase Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-display font-bold text-color-text-primary">{phase.title}</h3>
                      <p className="text-sm text-color-text-secondary flex items-center gap-2 mt-1">
                        <FaClock className="text-xs" /> {phase.subtitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-3">
                        <div className="text-center px-3">
                          <p className="text-lg font-display font-bold text-portaccent">{status.active}</p>
                          <p className="text-[10px] uppercase tracking-wider text-color-text-muted">Active</p>
                        </div>
                        <div className="w-px h-10 bg-portmid/30" />
                        <div className="text-center px-3">
                          <p className="text-lg font-display font-bold text-emerald-600">{status.completed}</p>
                          <p className="text-[10px] uppercase tracking-wider text-color-text-muted">Completed</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted mb-2">Key Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.benefits.map((benefit, bIdx) => (
                        <span key={bIdx} className="bg-portbase/50 px-3 py-1 rounded-full text-xs font-medium text-portaccent border border-portmid/30">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted mb-2">Process Steps</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.steps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 text-xs text-color-text-secondary">
                          <span className="w-5 h-5 rounded-full bg-portaccent/10 flex items-center justify-center text-portaccent font-bold text-[10px]">
                            {sIdx + 1}
                          </span>
                          <span>{step}</span>
                          {sIdx < phase.steps.length - 1 && <FaArrowRight className="text-[10px] text-portmid/50" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Line */}
              {idx < phases.length - 1 && (
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-center gap-2 text-portmid/40">
                    <div className="flex-1 h-px bg-portmid/30" />
                    <FaArrowDown className="text-sm" />
                    <div className="flex-1 h-px bg-portmid/30" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
