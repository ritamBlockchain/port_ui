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
      {/* ── SLIM PAGE HEADER ── */}
      <section className="relative animate-fade-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#04172F] border border-white/10 shadow-lg shadow-black/10 shrink-0">
              <FaNetworkWired className="text-xl text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest sm:border-l sm:border-white/10 sm:pl-2">
                  {health?.chaincode || 'portchain'} / {health?.channel || 'mychannel'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#04172F]">
                Maritime Ledger <span className="text-slate-300 font-light italic">Dashboard</span>
              </h1>
            </div>
          </div>
          
          <div className="md:text-right border-l-4 border-[#04172F]/5 pl-4 md:border-none md:pl-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated As</p>
            <p className="text-sm font-bold text-[#04172F]">
              <span className="text-sky-600 uppercase tracking-tighter">{role}</span> — {user}
            </p>
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
