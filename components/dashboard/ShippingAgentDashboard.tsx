'use client';

import { FaShip, FaFileInvoiceDollar, FaPlus, FaArrowRight, FaClock, FaCheckCircle, FaAnchor, FaClipboardCheck, FaRoute } from 'react-icons/fa';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

export default function ShippingAgentDashboard() {
  const { data: mySubmissions } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/pre-arrival/all');
      const json = await res.json();
      return json.success ? json.data?.slice(0, 5) || [] : [];
    }
  });

  const { data: myInvoices } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/invoices/all');
      const json = await res.json();
      return json.success ? json.data?.filter((inv: any) => inv.status === 'issued').slice(0, 5) || [] : [];
    }
  });

  const { data: serviceRequests } = useQuery({
    queryKey: ['my-service-requests'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/services/all');
      const json = await res.json();
      return json.success ? json.data?.slice(0, 5) || [] : [];
    }
  });

  // Stakeholder Journey Steps
  const journeySteps = [
    { id: 1, title: 'Submit Pre-Arrival', description: 'Declare vessel, cargo & crew', icon: FaPlus, status: 'active' },
    { id: 2, title: 'Monitor Approvals', description: 'Track agency compliance', icon: FaClipboardCheck, status: 'pending' },
    { id: 3, title: 'Request Services', description: 'Pilotage, tug, mooring', icon: FaAnchor, status: 'pending' },
    { id: 4, title: 'Pay Invoices', description: 'Settle port charges', icon: FaFileInvoiceDollar, status: 'pending' }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Stakeholder Journey Banner */}
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#04172F] via-[#0a2a54] to-[#04172F] p-10 text-white shadow-2xl shadow-black/30 border border-white/5 transition-all duration-500">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-400/30">
                <FaAnchor className="text-sky-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400/60">Vessel Operations</span>
            </div>
            <h3 className="text-4xl font-display font-bold mb-3 tracking-tight">Shipping Agent <span className="text-sky-400 font-light italic">Journey</span></h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Streamlined port clearance orchestration through unified blockchain participation and real-time compliance tracking.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            {journeySteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative group/step">
                  <div className={`flex flex-col items-center text-center p-4 rounded-3xl border transition-all duration-300 ${
                    step.status === 'active' 
                      ? 'bg-white/10 border-sky-400/30 shadow-lg shadow-sky-500/10' 
                      : 'bg-white/5 border-white/5 opacity-60'
                  }`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover/step:scale-110 ${
                      step.status === 'active' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40' : 'bg-white/10 text-white/40'
                    }`}>
                      <Icon className="text-xl" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-tight mb-1">{step.title}</p>
                    <p className="text-[9px] text-slate-400 leading-tight opacity-0 group-hover/step:opacity-100 transition-opacity absolute -bottom-8 bg-[#04172F] p-2 rounded-lg border border-white/10 z-20 w-32 shadow-2xl pointer-events-none">
                      {step.description}
                    </p>
                  </div>
                  {idx < journeySteps.length - 1 && (
                    <FaArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-white/10 text-xs" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute -right-12 -bottom-12 text-[280px] text-sky-400 opacity-5 pointer-events-none transform rotate-12 group-hover:rotate-6 transition-transform duration-1000">
          <FaAnchor />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/pre-arrival/new" className="group relative p-10 bg-gradient-to-br from-[#04172F] to-[#1a2f45] rounded-[2.5rem] text-white shadow-2xl hover:shadow-sky-500/10 transition-all duration-500 overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-3xl mb-8 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-sky-500/30">
              <FaPlus />
            </div>
            <h4 className="text-2xl font-bold mb-2">Submit Pre-Arrival</h4>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">Initialize vessel declaration and cargo manifest on the ledger.</p>
          </div>
          <div className="relative z-10 mt-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-sky-400">
            Phase 1: Digital Port Entry <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
          </div>
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-sky-500 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
        </Link>

        <div className="port-card p-10 bg-white rounded-[2.5rem] border border-[#04172F]/5 shadow-xl flex flex-col justify-between group">
           <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-sm">
                  <FaAnchor />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending Operations</span>
              </div>
              <p className="text-4xl font-display font-bold text-[#04172F] mb-2 tracking-tighter">
                {serviceRequests?.length || 0} <span className="text-base font-medium text-slate-400 ml-2">Service Requests</span>
              </p>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">Manage active pilotage, tugging, and mooring requests for your vessels.</p>
           </div>
           <Link href="/services" className="text-[10px] font-black text-[#04172F] uppercase tracking-[0.2em] flex items-center gap-2 group-hover:gap-4 transition-all border-t border-slate-50 pt-6">
              View Operational Pipeline <FaArrowRight />
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Submissions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-lg font-display font-bold text-[#04172F] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#04172F] flex items-center justify-center text-sm shadow-sm border border-sky-100">
                <FaClipboardCheck />
              </div>
              Manifest Status
            </h4>
            <Link href="/pre-arrival" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#04172F] transition-colors">Global Registry</Link>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-[#04172F]/5 shadow-2xl overflow-hidden">
            <div className="divide-y divide-slate-50">
              {mySubmissions?.length ? mySubmissions.slice(0, 5).map((sub: any, idx: number) => (
                <div key={sub.submissionId} className="group p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#04172F] group-hover:scale-110 group-hover:bg-[#04172F] group-hover:text-white transition-all duration-500 shadow-sm">
                      <FaShip className="text-lg" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#04172F] mb-0.5">{sub.vesselName}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        {sub.submissionId} <span className="w-1 h-1 rounded-full bg-slate-200" /> {sub.voyageNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase border shadow-sm ${
                      sub.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      sub.status === 'compliant' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                      'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {sub.status}
                    </span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                      {new Date(sub.submittedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center">
                   <FaClipboardCheck className="text-4xl text-slate-100 mx-auto mb-4" />
                   <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No Active Submissions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Requests */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-lg font-display font-bold text-[#04172F] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm shadow-sm border border-amber-100">
                <FaAnchor />
              </div>
              Port Services
            </h4>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-[#04172F]/5 shadow-2xl overflow-hidden">
            <div className="divide-y divide-slate-50">
              {serviceRequests?.length ? serviceRequests.slice(0, 5).map((req: any, idx: number) => (
                <div key={req.requestId} className="group p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all animate-in fade-in duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-sm">
                      <FaAnchor className="text-lg" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#04172F] mb-0.5">{req.serviceType}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {req.requestId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase border shadow-sm ${
                      req.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                      req.status === 'started' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                      'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center text-slate-300 italic">No services requested</div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-lg font-display font-bold text-[#04172F] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shadow-sm border border-emerald-100">
                <FaFileInvoiceDollar />
              </div>
              Financial Settlements
            </h4>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-[#04172F]/5 shadow-2xl overflow-hidden">
             <div className="divide-y divide-slate-50">
                {myInvoices?.length ? myInvoices.slice(0, 5).map((inv: any, idx: number) => (
                  <div key={inv.invoiceId} className="group p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all animate-in fade-in slide-in-from-right duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm">
                          <FaFileInvoiceDollar className="text-lg" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-[#04172F] mb-0.5">{inv.invoiceId}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                             <FaClock /> Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-base font-display font-bold text-emerald-700 mb-0.5">
                         {(inv.totalAmount || 0).toLocaleString()} <span className="text-[10px] text-slate-400 ml-1">{inv.currency || 'USD'}</span>
                       </p>
                       <Link href="/invoices" className="text-[9px] font-black text-[#04172F] hover:underline uppercase tracking-widest">Pay Invoice</Link>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center">
                     <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">All accounts settled</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
