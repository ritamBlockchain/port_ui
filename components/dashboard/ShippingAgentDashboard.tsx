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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stakeholder Journey Banner */}
      <div className="port-card p-6 bg-gradient-to-r from-[#1a2f45] to-[#2a4a6f] text-white rounded-2xl shadow-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-bold mb-1">Shipping Agent Journey</h3>
            <p className="text-sm opacity-80">Complete port clearance in 1.5 days (70% faster than traditional 5 days)</p>
          </div>
          <div className="bg-portaccent/20 px-4 py-2 rounded-xl border border-portaccent/30">
            <p className="text-2xl font-display font-bold text-portaccent">70%</p>
            <p className="text-[10px] uppercase tracking-widest text-portaccent">Time Saved</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          {journeySteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex-1 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${step.status === 'active' ? 'bg-portaccent text-white' : 'bg-white/10 text-white/60'}`}>
                  <Icon className="text-lg" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider">{step.title}</p>
                <p className="text-[10px] opacity-60 mt-1">{step.description}</p>
                {idx < journeySteps.length - 1 && <FaArrowRight className="text-white/20 text-xs mt-2" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/pre-arrival/new" className="port-card p-8 bg-gradient-to-br from-portaccent to-indigo-700 text-white group hover:shadow-2xl hover:shadow-portaccent/20 transition-all border-none">
          <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              <FaPlus />
            </div>
            <FaShip className="text-4xl opacity-20 group-hover:scale-125 transition-transform" />
          </div>
          <h3 className="text-2xl font-display mb-2">Submit Pre-Arrival</h3>
          <p className="text-sm opacity-80 leading-relaxed max-w-xs">Declare vessel entry, cargo manifest, and crew list to port authorities.</p>
          <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-t border-white/10 pt-4">
            Phase 1: Pre-Arrival Notification <FaArrowRight />
          </div>
        </Link>

        <Link href="/services" className="port-card p-8 bg-white border border-portmid group hover:border-amber-500 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-2xl text-amber-600">
              <FaAnchor />
            </div>
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Day of Arrival
            </span>
          </div>
          <h3 className="text-2xl font-display text-color-text-primary mb-2">Request Port Services</h3>
          <p className="text-sm text-color-text-secondary leading-relaxed max-w-xs">Request pilotage, tug assistance, mooring, stevedoring, and other services.</p>
          <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 border-t border-portmid/30 pt-4">
            Phase 4: Service Request <FaArrowRight />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Submissions */}
        <div className="port-card p-6 bg-white overflow-hidden border border-portmid/50 shadow-sm">
          <h4 className="text-lg font-display mb-6 flex items-center gap-2">
            <FaShip className="text-portaccent" /> Pre-Arrival Status
          </h4>
          <div className="space-y-4">
            {mySubmissions?.length ? mySubmissions.map((sub: any) => (
              <div key={sub.submissionId} className="flex items-center justify-between p-4 bg-portbase/50 rounded-xl border border-portmid/20 hover:border-portaccent/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-portaccent shadow-sm">
                    <FaShip />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-tight">{sub.vesselName}</p>
                    <p className="text-[10px] text-color-text-muted font-mono">{sub.submissionId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    sub.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                    sub.status === 'compliant' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                    'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {sub.status}
                  </span>
                  <p className="text-[10px] text-color-text-muted mt-1 uppercase font-bold tracking-tighter">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-center py-10 text-color-text-muted text-sm italic">No submissions found</p>
            )}
          </div>
        </div>

        {/* Service Requests */}
        <div className="port-card p-6 bg-white border border-portmid/50 shadow-sm">
          <h4 className="text-lg font-display mb-6 flex items-center gap-2 text-amber-600">
            <FaAnchor /> Service Requests
          </h4>
          <div className="space-y-4">
            {serviceRequests?.length ? serviceRequests.map((req: any) => (
              <div key={req.requestId} className="flex items-center justify-between p-4 bg-amber-50/30 rounded-xl border border-amber-100 hover:border-amber-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-sm">
                    <FaAnchor />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase">{req.serviceType}</p>
                    <p className="text-[10px] text-color-text-muted font-mono">{req.requestId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    req.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                    req.status === 'started' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                    'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-center py-10 text-color-text-muted text-sm italic">No service requests</p>
            )}
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="port-card p-6 bg-white border border-portmid/50 shadow-sm">
          <h4 className="text-lg font-display mb-6 flex items-center gap-2 text-emerald-600">
            <FaFileInvoiceDollar /> Pending Invoices
          </h4>
          <div className="space-y-4">
            {myInvoices?.length ? myInvoices.map((inv: any) => (
              <div key={inv.invoiceId} className="flex items-center justify-between p-4 bg-emerald-50/30 rounded-xl border border-emerald-100 hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                    <FaFileInvoiceDollar />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{inv.invoiceId}</p>
                    <p className="text-[10px] text-color-text-muted uppercase font-bold tracking-tighter flex items-center gap-1">
                      <FaClock /> Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-700">{inv.currency || 'USD'} {(inv.totalAmount || 0).toLocaleString()}</p>
                  <Link href={`/invoices`} className="text-[10px] font-bold text-portaccent hover:underline uppercase tracking-widest mt-1 block">
                    Pay Now
                  </Link>
                </div>
              </div>
            )) : (
              <p className="text-center py-10 text-color-text-muted text-sm italic">No pending invoices</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
