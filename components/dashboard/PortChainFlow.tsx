'use client';

import { FaShip, FaGavel, FaBuilding, FaAnchor, FaFileInvoice, FaFileContract, FaCertificate, FaArrowRight, FaClock, FaChevronDown, FaCheckCircle, FaNetworkWired, FaShieldAlt } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';

/* ─── Types ─────────────────────────────────────────────── */
interface PhaseData {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  accent: string;
  glow: string;
  border: string;
  tag: string;
  benefits: string[];
  steps: string[];
}

/* ─── Phase Data ─────────────────────────────────────────── */
const phases: PhaseData[] = [
  {
    id: 1,
    title: 'Pre-Arrival Notification',
    subtitle: '2–7 Days Before Arrival',
    icon: FaShip,
    tag: 'INITIATION',
    accent: '#0284c7',
    glow: 'rgba(2,132,199,0.08)',
    border: 'rgba(2,132,199,0.2)',
    benefits: ['70% faster than manual submission', 'Real-time status tracking', 'Private cargo data encrypted'],
    steps: ['Submit vessel details', 'Upload cargo manifest', 'Provide crew list', 'Automated compliance check']
  },
  {
    id: 2,
    title: 'Multi-Agency Approval',
    subtitle: '1–3 Days',
    icon: FaGavel,
    tag: 'REVIEW',
    accent: '#7c3aed',
    glow: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.2)',
    benefits: ['Single submission replaces multiple forms', 'Immutable approval history', 'Parallel agency review'],
    steps: ['Customs review', 'Immigration review', 'Port Health review', 'All 3 required for approval']
  },
  {
    id: 3,
    title: 'Berth Assignment',
    subtitle: 'Upon Approval',
    icon: FaBuilding,
    tag: 'ASSIGNMENT',
    accent: '#4f46e5',
    glow: 'rgba(79,70,229,0.08)',
    border: 'rgba(79,70,229,0.2)',
    benefits: ['Data-driven berth assignment', 'Transparent assignment history', 'Sensitive operational data protected'],
    steps: ['Select berth by vessel size', 'Set time slot', 'Assign pilotage', 'Confirm assignment']
  },
  {
    id: 4,
    title: 'Port Service Execution',
    subtitle: 'Day of Arrival',
    icon: FaAnchor,
    tag: 'EXECUTION',
    accent: '#d97706',
    glow: 'rgba(217,119,6,0.08)',
    border: 'rgba(217,119,6,0.2)',
    benefits: ['Real-time service status updates', 'Built-in dispute mechanism', 'Automated invoicing trigger'],
    steps: ['Request services (pilotage, tug, etc.)', 'Provider accepts request', 'Service started & logged', 'Service completed']
  },
  {
    id: 5,
    title: 'Invoicing & Settlement',
    subtitle: 'Post-Service',
    icon: FaFileInvoice,
    tag: 'SETTLEMENT',
    accent: '#059669',
    glow: 'rgba(5,150,105,0.08)',
    border: 'rgba(5,150,105,0.2)',
    benefits: ['90% reduction in manual processing', 'Eliminates calculation errors', 'Complete payment audit trail'],
    steps: ['Generate invoice from service logs', 'Apply rates & discounts', 'Calculate tax', 'Confirm payment']
  },
  {
    id: 6,
    title: 'Electronic Bill of Lading',
    subtitle: 'Optional — For Cargo',
    icon: FaFileContract,
    tag: 'DOCUMENTATION',
    accent: '#e11d48',
    glow: 'rgba(225,29,72,0.08)',
    border: 'rgba(225,29,72,0.2)',
    benefits: ['Paperless bill of lading', 'Instant transfer vs 5–7 days', 'Immutable ownership chain'],
    steps: ['Create draft EBL', 'Collaborative revision', 'Commit & issue EBL', 'Transfer to consignee']
  },
  {
    id: 7,
    title: 'Digital Credentials',
    subtitle: 'For Vessels & Companies',
    icon: FaCertificate,
    tag: 'VERIFICATION',
    accent: '#0891b2',
    glow: 'rgba(8,145,178,0.08)',
    border: 'rgba(8,145,178,0.2)',
    benefits: ['Cryptographically verifiable', 'Instant verification', 'Automated expiry tracking'],
    steps: ['Issue credentials (IMO, Safety, etc.)', 'Generate QR code', 'Verify via QR scan', 'Track expiry & revocation']
  }
];



/* ─── Components ─────────────────────────────────────────── */

function AnimatedNumber({ value }: { value: string }) {
  const [display, setDisplay] = useState('0%');
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const num = parseInt(value);
    const suffix = value.replace(/\d/g, '');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        let start = 0;
        const dur = 1500;
        const startTime = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - startTime) / dur, 1);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // Exponential ease out
          setDisplay(`${Math.floor(eased * num)}${suffix}`);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

function PhaseCard({ phase, index, active, completed }: { phase: PhaseData; index: number; active: number; completed: number }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = phase.icon;

  return (
    <div className="relative flex gap-6 group">
      {/* Timeline Column */}
      <div className="flex flex-col items-center flex-shrink-0 w-12">
        <div
          className="z-10 flex items-center justify-center transition-all duration-500 border-2 rounded-full"
          style={{
            width: 48, height: 48,
            borderColor: expanded ? phase.accent : '#e2e8f0',
            background: expanded ? phase.glow : '#ffffff',
            boxShadow: expanded ? `0 0 15px ${phase.glow}` : 'none'
          }}
        >
          <Icon style={{ fontSize: 18, color: expanded ? phase.accent : '#94a3b8' }} />
        </div>
        {index < phases.length - 1 && (
          <div
            className="w-0.5 flex-1 transition-colors duration-500"
            style={{
              background: `linear-gradient(to bottom, ${expanded ? phase.accent : '#e2e8f0'}, #f8fafc)`
            }}
          />
        )}
      </div>

      {/* Content Column */}
      <div className="flex-1 pb-6">
        <div
          className="transition-all duration-300 border cursor-pointer rounded-xl bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
          style={{
            boxShadow: expanded ? `0 10px 40px -10px rgba(0,0,0,0.05)` : 'none',
          }}
          onClick={() => setExpanded(!expanded)}
        >
          {/* Header Row */}
          <div className="flex items-center gap-4 p-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Phase 0{phase.id}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-bold border"
                  style={{ color: phase.accent, borderColor: phase.border, background: phase.glow }}
                >
                  {phase.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900 font-roboto">
                {phase.title}
              </h3>
              <p className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                <FaClock className="text-[10px]" /> {phase.subtitle}
              </p>
            </div>

            {/* Stats Badge */}
            <div className="flex items-center gap-6 pr-4">
              <div className="text-right">
                <p className="text-xl font-black leading-none font-roboto" style={{ color: phase.accent }}>{active}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Pending</p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-right">
                <p className="text-xl font-black leading-none text-emerald-600 font-roboto">{completed}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Settled</p>
              </div>
              <FaChevronDown
                className={`text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                style={{ fontSize: 12 }}
              />
            </div>
          </div>

          {/* Expanded Content */}
          <div
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{ maxHeight: expanded ? 400 : 0 }}
          >
            <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/30">
              <div className="grid grid-cols-2 gap-8 mt-5">
                {/* Benefits */}
                <div>
                  <h4 className="flex items-center gap-2 mb-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    <FaShieldAlt className="text-slate-400" /> Strategic Impact
                  </h4>
                  <ul className="space-y-2">
                    {phase.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
                        <div className="w-1.5 h-1.5 mt-1.5 rounded-full" style={{ background: phase.accent }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Steps */}
                <div>
                  <h4 className="flex items-center gap-2 mb-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    <FaNetworkWired className="text-slate-400" /> Ledger Workflow
                  </h4>
                  <div className="space-y-3">
                    {phase.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-5 h-5 text-[9px] font-bold border rounded-full border-slate-200 text-slate-500">
                          0{i + 1}
                        </div>
                        <span className="text-xs text-slate-500">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verification Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 text-[9px] font-medium text-slate-400 italic">
                <span className="flex items-center gap-1">
                  <FaCheckCircle className="text-emerald-500" /> Cryptographically secured via PortChain Protocol
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const getPhaseStatus = (phaseId: number) => {
    switch (phaseId) {
      case 1: return {
        active: submissions?.filter((s: any) => ['pending', 'submitted'].includes(s.status?.toLowerCase())).length || 0,
        completed: submissions?.filter((s: any) => !['pending', 'submitted'].includes(s.status?.toLowerCase())).length || 0,
      };
      case 2: return {
        active: submissions?.filter((s: any) => s.status?.toLowerCase() === 'compliant').length || 0,
        completed: submissions?.filter((s: any) => s.status?.toLowerCase() === 'approved').length || 0,
      };
      case 3: return {
        active: submissions?.filter((s: any) => s.status?.toLowerCase() === 'approved' && !s.berthId).length || 0,
        completed: submissions?.filter((s: any) => s.berthId).length || 0,
      };
      case 4: return {
        active: serviceLogs?.filter((l: any) => l.status === 'started').length || 0,
        completed: serviceLogs?.filter((l: any) => l.status === 'completed' || l.status === 'resolved').length || 0,
      };
      case 5: return {
        active: invoices?.filter((i: any) => i.status === 'issued').length || 0,
        completed: invoices?.filter((i: any) => i.status === 'paid').length || 0,
      };
      case 6: return {
        active: ebls?.filter((e: any) => e.status === 'draft').length || 0,
        completed: ebls?.filter((e: any) => e.status === 'issued').length || 0,
      };
      default: return { active: 0, completed: 0 };
    }
  };

  return (
    <div className="w-full text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* ── HEADER ── */}
        <header className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Subtle background effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/[0.03] blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/[0.03] blur-[100px] -ml-32 -mb-32" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 shadow-sm animate-[float_4s_ease-in-out_infinite]">
                  <FaNetworkWired className="text-2xl text-sky-600" />
                </div>
                <div className="h-px w-12 bg-slate-200" />
                <span className="text-[10px] font-black tracking-[0.3em] text-sky-600 uppercase">
                  Network Active / LATEST
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 font-roboto mb-4">
                PortChain <span className="text-slate-400 font-light">Protocol</span>
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed max-w-xl">
                Redefining global maritime logistics through immutable ledger transparency and automated multi-agency orchestration.
              </p>
            </div>


          </div>


        </header>

        {/* ── FLOW TIMELINE ── */}
        <section className="relative pl-4 md:pl-0">
          {/* Timeline Background Line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-slate-200 hidden md:block" />

          <div className="space-y-2">
            {phases.map((phase, idx) => {
              const st = getPhaseStatus(phase.id);
              return (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  index={idx}
                  active={st.active}
                  completed={st.completed}
                />
              );
            })}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="mt-10 py-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Mainnet Verified
            </div>
          </div>

          <p className="text-[10px] font-medium text-center md:text-right max-w-xs leading-relaxed">
            Proprietary Enterprise Software. All ledger interactions are cryptographically signed and stored in perpetuity.
          </p>
        </footer>
      </div>
    </div>
  );
}
