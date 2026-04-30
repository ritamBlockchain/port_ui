'use client';

import { FaAnchor, FaMapMarkedAlt, FaFileInvoice, FaShip, FaCheckCircle, FaArrowRight, FaClipboardCheck, FaCertificate, FaBuilding, FaNetworkWired, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';

/* ─── Components ─────────────────────────────────────────── */

function AnimatedNumber({ value }: { value: number | string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
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

export default function PortAuthorityDashboard() {
  const { data: submissions } = useQuery({
    queryKey: ['pa-submissions'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/pre-arrival/all');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  const { data: serviceLogs } = useQuery({
    queryKey: ['pa-service-logs'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/services/all');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  const { data: invoices } = useQuery({
    queryKey: ['pa-invoices'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/invoices/all');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  const activeVessels = submissions?.filter((s: any) => s.status === 'approved') || [];
  const pendingBerth = submissions?.filter((s: any) => s.status === 'approved' && !s.berthId) || [];
  const activeServices = serviceLogs?.filter((l: any) => l.status === 'started') || [];
  const paidInvoices = invoices?.filter((inv: any) => inv.status === 'paid') || [];

  // Stakeholder Journey Steps
  const journeySteps = [
    { id: 1, title: 'Approvals', description: 'Authorize Entries', icon: FaClipboardCheck, status: 'active', color: '#6366f1' },
    { id: 2, title: 'Berths', description: 'Assign Capacity', icon: FaBuilding, status: 'pending', color: '#f59e0b' },
    { id: 3, title: 'Invoicing', description: 'Aggregate Logs', icon: FaFileInvoice, status: 'pending', color: '#10b981' },
    { id: 4, title: 'Credentials', description: 'Verify Vessels', icon: FaCertificate, status: 'pending', color: '#06b6d4' }
  ];

  return (
    <div className="space-y-12 animate-fade-up font-roboto">
      {/* ── STAKEHOLDER JOURNEY BANNER (WHITE THEME) ── */}
      <section className="relative overflow-hidden rounded-[3.5rem] bg-white p-1 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply" 
          style={{ background: 'radial-gradient(circle at 10% 20%, #6366f1 0%, transparent 40%), radial-gradient(circle at 90% 80%, #10b981 0%, transparent 40%)' }} 
        />
        
        <div className="relative z-10 p-10 md:p-14 rounded-[3rem] bg-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-12">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm animate-float">
                  <FaShieldAlt className="text-2xl text-indigo-600" />
                </div>
                <div className="h-px w-10 bg-slate-200" />
                <span className="text-[10px] font-black tracking-[0.3em] text-indigo-600 uppercase">
                  Authorized Port Control
                </span>
              </div>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none mb-4">
                Port Authority <span className="text-slate-200 font-light italic">Journey</span>
              </h3>
              <p className="text-slate-500 text-lg leading-relaxed max-w-xl font-medium">
                Unified orchestration of maritime logistics through immutable ledger transparency and automated multi-agency coordination.
              </p>
            </div>
          </div>

          {/* Journey Steps Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
            {journeySteps.map((step) => {
              const Icon = step.icon;
              const descWords = step.description.split(' ');
              return (
                <div key={step.id} className="group relative">
                  <div className="flex flex-col items-center p-8 sm:p-10 rounded-[3rem] bg-white border border-slate-100 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group-hover:border-slate-200">
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-[2rem] flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110"
                      style={{ background: `${step.color}08`, border: `1px solid ${step.color}15` }}
                    >
                      <Icon className="text-2xl sm:text-3xl" style={{ color: step.color }} />
                    </div>
                    <p className="text-[11px] font-black text-[#04172F] uppercase tracking-[0.2em] text-center mb-3">{step.title}</p>
                    <div className="flex flex-col items-center text-center">
                       {descWords.map((word, i) => (
                         <p key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{word}</p>
                       ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── KEY METRICS (WHITE MODE STAT CARDS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Active Vessels', value: activeVessels.length, icon: FaShip, color: '#6366f1', status: 'In Port' },
          { label: 'Pending Berths', value: pendingBerth.length, icon: FaMapMarkedAlt, color: '#f59e0b', status: 'Awaiting Assignment' },
          { label: 'Live Services', value: activeServices.length, icon: FaFileInvoice, color: '#10b981', status: 'Operational Logs' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="flex justify-between items-center mb-8">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}15` }}
                >
                  <Icon className="text-3xl" style={{ color: stat.color }} />
                </div>
                <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-50 border border-slate-100 text-slate-400">
                  {stat.status}
                </span>
              </div>
              <div>
                <p className="text-5xl font-black text-slate-900 tracking-tighter mb-2">
                  <AnimatedNumber value={stat.value} />
                </p>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── BERTH MANAGEMENT ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h4 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><FaAnchor /></div>
                  Berth Assignment <span className="text-slate-300 font-light text-sm italic">Phase 03</span>
                </h4>
              </div>
              <Link href="/berth" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Manage All Berths</Link>
           </div>
           
           <div className="flex-1 divide-y divide-slate-50">
              {pendingBerth.length ? pendingBerth.map((v: any) => (
                <div key={v.submissionId} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group/vessel">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50/50 flex items-center justify-center text-indigo-600 transition-transform group-hover/vessel:scale-110">
                        <FaShip className="text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover/vessel:text-indigo-600 transition-colors">{v.vesselName}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1">IMO: {v.vesselIMO}</p>
                      </div>
                   </div>
                   <Link 
                    href={`/pre-arrival/${v.submissionId}`}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
                   >
                     Assign Berth <FaArrowRight className="text-[8px]" />
                   </Link>
                </div>
              )) : (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                      <FaCheckCircle className="text-3xl" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 italic">All approved vessels assigned berths.</p>
                </div>
              )}
           </div>
        </div>

        {/* ── FINANCIAL CLEARANCE ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h4 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><FaFileInvoice /></div>
                  Settlement Board
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-300 font-black italic uppercase tracking-widest">Phase 05</span>
                  <Link href="/invoices" className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 hover:bg-emerald-100 transition-colors">Full Board</Link>
                </div>
              </div>
           </div>
           
           <div className="p-8 space-y-8">
              <div className="bg-emerald-50/20 border border-emerald-100/30 rounded-[2rem] p-10 text-center group">
                 <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed max-w-[240px] mx-auto">
                   Aggregated services can be converted into unified <span className="text-emerald-700 font-black">port invoices</span> once logs are verified.
                 </p>
                 <Link href="/invoices" className="inline-flex flex-col items-center justify-center gap-2 px-10 py-6 rounded-3xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-600/30 group/btn active:scale-95">
                    <div className="flex items-center gap-3">
                       <FaFileInvoice className="text-sm" />
                       <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">Generate Service</span>
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">Invoices</span>
                 </Link>
              </div>
              
              <div className="space-y-6">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pb-2 border-b border-slate-50">
                    <span>Recent Settlements</span>
                    <span>Amount (USD)</span>
                 </div>
                 <div className="space-y-4">
                   {paidInvoices.length > 0 ? paidInvoices.slice(0, 3).map((inv: any) => (
                     <div key={inv.invoiceId} className="flex justify-between items-center group/inv">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-transform group-hover/inv:scale-110">
                              <FaCheckCircle className="text-sm" />
                           </div>
                           <div>
                             <span className="text-sm font-black text-slate-900 font-mono tracking-tighter">{inv.vesselIMO}</span>
                             <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Verified Transaction</p>
                           </div>
                        </div>
                        <span className="text-lg font-black text-slate-900 font-roboto tracking-tighter">
                          $ {(inv.totalAmount || 0).toLocaleString()}
                        </span>
                     </div>
                   )) : (
                     <div className="py-10 text-center text-[11px] font-bold text-slate-300 italic uppercase tracking-widest">
                       Waiting for first settlement...
                     </div>
                   )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
