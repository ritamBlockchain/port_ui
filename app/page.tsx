'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/api/auth';
import { FaShip, FaFileAlt, FaCheckCircle, FaAnchor, FaNetworkWired, FaShieldAlt, FaExternalLinkAlt, FaDatabase } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';

// Dashboard Components
import ShippingAgentDashboard from '@/components/dashboard/ShippingAgentDashboard';
import RegulatoryDashboard from '@/components/dashboard/RegulatoryDashboard';
import PortAuthorityDashboard from '@/components/dashboard/PortAuthorityDashboard';
import ServiceProviderDashboard from '@/components/dashboard/ServiceProviderDashboard';
import CarrierDashboard from '@/components/dashboard/CarrierDashboard';
import TradeFinanceDashboard from '@/components/dashboard/TradeFinanceDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import PortChainFlow from '@/components/dashboard/PortChainFlow';

/* ─── Components ─────────────────────────────────────────── */

function AnimatedNumber({ value }: { value: number | string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (typeof value === 'string' && value === '...') return;

    const target = typeof value === 'string' ? parseInt(value.replace(/[^\d]/g, '')) : value;
    const suffix = typeof value === 'string' ? value.replace(/\d/g, '') : '';

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        let start = 0;
        const dur = 1500;
        const startTime = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - startTime) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          setDisplay(`${Math.floor(eased * (target || 0))}${suffix}`);
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

export default function Dashboard() {
  const { role, user } = useAuth();

  // Live Counts from Ledger
  const { data: submissions } = useQuery({
    queryKey: ['pre-arrival-stats-count'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/pre-arrival/all');
      const json = await res.json();
      return json.success ? json.data?.length || 0 : 0;
    }
  });

  const { data: ebls } = useQuery({
    queryKey: ['ebl-stats-count'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/ebl/get');
      const json = await res.json();
      return json.success ? json.data?.length || 0 : 0;
    }
  });

  const { data: unanchored, isLoading: loadingAudit } = useQuery({
    queryKey: ['unanchored-count'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/merkle/unanchored');
      const json = await res.json();
      return json.success ? json.data?.length || 0 : 0;
    }
  });

  const { data: serviceLogs } = useQuery({
    queryKey: ['services-count'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/services/all');
      const json = await res.json();
      return json.success ? json.data?.length || 0 : 0;
    }
  });

  const { data: health } = useQuery({
    queryKey: ['fabric-health-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/health');
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 30000,
  });

  const stats = [
    { label: 'Submissions', value: submissions ?? 0, icon: FaShip, color: '#3b82f6', glow: 'rgba(59,130,246,0.1)' },
    { label: 'eBLs Issued', value: ebls ?? 0, icon: FaFileAlt, color: '#6366f1', glow: 'rgba(99,102,241,0.1)' },
    { label: 'Ledger Audit', value: unanchored ?? 0, icon: FaCheckCircle, color: '#10b981', glow: 'rgba(16,185,129,0.1)' },
    { label: 'Service Logs', value: serviceLogs ?? 0, icon: FaAnchor, color: '#f59e0b', glow: 'rgba(245,158,11,0.1)' },
  ];

  // Role-to-Component Mapping
  const renderRoleDashboard = () => {
    switch (role) {
      case 'shippingagent':
        return <ShippingAgentDashboard />;
      case 'customs':
      case 'immigration':
      case 'portHealth':
        return <RegulatoryDashboard />;
      case 'portauthority':
        return <PortAuthorityDashboard />;
      case 'serviceprovider':
        return <ServiceProviderDashboard />;
      case 'carrier':
        return <CarrierDashboard />;
      case 'shipper':
      case 'consignee':
      case 'banktrade':
        return <TradeFinanceDashboard />;
      case 'registrar':
      case 'admin':
      case 'verifier':
        return <AdminDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="space-y-8 pb-10 px-4 md:px-0 selection:bg-indigo-100 selection:text-indigo-900">
      {/* ── WELCOME HERO SECTION ── */}
      <section className="relative animate-in fade-in slide-in-from-top-6 duration-1000">
        <div className="relative group overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#04172F] via-[#0a2a54] to-[#04172F] p-8 sm:p-12 text-white shadow-2xl shadow-black/30 border border-white/5 transition-all duration-700">
          {/* Subtle Animated Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">Network Live</span>
                <span className="w-px h-3 bg-white/10 mx-1" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{health?.chaincode || 'portchain'} / {health?.channel || 'mychannel'}</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-medium text-slate-400 font-display">Welcome back, <span className="text-white font-bold capitalize">{role.replace(/([A-Z])/g, ' $1').trim()}</span></h2>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] font-display">
                  Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-white to-sky-400 bg-size-300 animate-gradient">PortChain</span> Protocol
                </h1>
                <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed mx-auto lg:mx-0 font-medium">
                  The blockchain-powered maritime ledger for secure cargo titles, automated compliance, and seamless agency orchestration.
                </p>
              </div>
            </div>
            {/* PortChain SVG Illustration */}
            <div className="relative w-full max-w-[400px] lg:max-w-none lg:w-[45%] flex justify-center lg:justify-end animate-float">
               <svg viewBox="0 0 500 500" className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  {/* Ship Hull */}
                  <path d="M50,350 L450,350 L400,420 L100,420 Z" fill="#04172F" stroke="#38bdf8" strokeWidth="2" />
                  <path d="M80,300 L420,300 L450,350 L50,350 Z" fill="#0a2a54" stroke="#38bdf8" strokeWidth="1" />
                  
                  {/* Floating Blockchain Blocks (PortChain Nodes) */}
                  <g className="animate-pulse">
                    <rect x="180" y="180" width="60" height="60" rx="12" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4 4" />
                    <rect x="260" y="140" width="60" height="60" rx="12" fill="#38bdf8" fillOpacity="0.1" stroke="#38bdf8" strokeWidth="3" />
                    <rect x="220" y="100" width="60" height="60" rx="12" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="8 4" />
                  </g>
                  
                  {/* Connection Lines */}
                  <line x1="210" y1="210" x2="290" y2="170" stroke="#38bdf8" strokeWidth="2" opacity="0.4" />
                  <line x1="290" y1="170" x2="250" y2="130" stroke="#38bdf8" strokeWidth="2" opacity="0.4" />
                  
                  {/* Abstract Waves */}
                  <path d="M0,450 Q125,430 250,450 T500,450" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.2">
                    <animate attributeName="d" dur="5s" repeatCount="indefinite" values="M0,450 Q125,430 250,450 T500,450; M0,450 Q125,470 250,450 T500,450; M0,450 Q125,430 250,450 T500,450" />
                  </path>
                  <path d="M0,470 Q125,450 250,470 T500,470" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.1">
                    <animate attributeName="d" dur="7s" repeatCount="indefinite" values="M0,470 Q125,450 250,470 T500,470; M0,470 Q125,490 250,470 T500,470; M0,470 Q125,450 250,470 T500,470" />
                  </path>
                  
                  {/* Container Stack (The "Ledger") */}
                  <rect x="120" y="260" width="40" height="40" rx="4" fill="#38bdf8" />
                  <rect x="170" y="260" width="40" height="40" rx="4" fill="#04172F" stroke="#38bdf8" />
                  <rect x="220" y="260" width="40" height="40" rx="4" fill="#38bdf8" />
                  <rect x="270" y="260" width="40" height="40" rx="4" fill="#04172F" stroke="#38bdf8" />
                  <rect x="320" y="260" width="40" height="40" rx="4" fill="#38bdf8" />
                  
                  <rect x="145" y="220" width="40" height="40" rx="4" fill="#04172F" stroke="#38bdf8" />
                  <rect x="195" y="220" width="40" height="40" rx="4" fill="#38bdf8" />
                  <rect x="245" y="220" width="40" height="40" rx="4" fill="#04172F" stroke="#38bdf8" />
                  <rect x="295" y="220" width="40" height="40" rx="4" fill="#38bdf8" />
               </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS GRID (WOW REDESIGN) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Submissions', value: submissions ?? 0, icon: FaShip, color: '#04172F', footer: 'Active Ledger Entries' },
          { label: 'eBLs Issued', value: ebls ?? 0, icon: FaFileAlt, color: '#04172F', footer: 'Digitized Titles' },
          { label: 'Ledger Audit', value: unanchored ?? 0, icon: FaCheckCircle, color: '#04172F', footer: 'Unanchored Leaves' },
          { label: 'Service Logs', value: serviceLogs ?? 0, icon: FaAnchor, color: '#04172F', footer: 'Total Activity' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative flex flex-col justify-between bg-white p-6 rounded-[2rem] border border-[#04172F]/10 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] hover:border-[#04172F]/20 transition-all duration-500 overflow-hidden min-h-[160px]"
            >
              {/* Notched Color Edge */}
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-16 rounded-l-2xl transition-all duration-500 group-hover:h-20"
                style={{ backgroundColor: stat.color }}
              />

              <div className="flex justify-between items-start mb-4">
                <div className="text-slate-400 group-hover:text-slate-900 transition-colors">
                  <Icon className="text-xl" />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">
                    <AnimatedNumber value={stat.value} />
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                  {stat.footer}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FLOW VISUALIZATION ── */}
      <div className="animate-fade-up overflow-x-auto pb-4" style={{ animationDelay: '400ms' }}>
        <div className="min-w-[800px] lg:min-w-0">
          <PortChainFlow />
        </div>
      </div>

      {/* ── ROLE DASHBOARDS ── */}
      <div className="animate-fade-up" style={{ animationDelay: '500ms' }}>
        {renderRoleDashboard()}
      </div>

      {/* ── FOOTER TELEMETRY ── */}
      <footer className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-fade-up gap-6" style={{ animationDelay: '600ms' }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full lg:w-auto">
          <span className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${health?.gateway === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            Gateway: <span className="text-slate-900">{health?.gateway || 'Checking...'}</span>
          </span>
          <div className="hidden sm:block h-4 w-px bg-slate-100" />
          <span className="flex items-center gap-3">
            <FaNetworkWired className="text-sky-500" />
            Org: <span className="text-slate-900">{health?.org || '...'}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <span className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex-1 sm:flex-none text-center sm:text-left">
            Chaincode: <span className="text-slate-900">{health?.chaincode || '...'}</span>
          </span>
          <span className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex-1 sm:flex-none text-center sm:text-left">
            Channel: <span className="text-slate-900">{health?.channel || '...'}</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
