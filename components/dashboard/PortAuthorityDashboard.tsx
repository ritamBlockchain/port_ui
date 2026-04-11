'use client';

import { FaAnchor, FaMapMarkedAlt, FaFileInvoice, FaShip, FaCheckCircle, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="port-card p-6 bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <FaShip className="text-3xl opacity-30" />
              <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-bold uppercase">In Port</span>
           </div>
           <div className="mt-8">
              <p className="text-4xl font-display">{activeVessels.length}</p>
              <p className="text-xs opacity-80 uppercase font-bold tracking-widest">Active Vessel Entries</p>
           </div>
        </div>

        <div className="port-card p-6 bg-amber-500 text-white shadow-xl shadow-amber-500/20 flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <FaMapMarkedAlt className="text-3xl opacity-30" />
              <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-bold uppercase">Pending Berth</span>
           </div>
           <div className="mt-8">
              <p className="text-4xl font-display">{pendingBerth.length}</p>
              <p className="text-xs opacity-80 uppercase font-bold tracking-widest">Awaiting Assignment</p>
           </div>
        </div>

        <div className="port-card p-6 bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 flex flex-col justify-between">
           <div className="flex justify-between items-start">
              <FaFileInvoice className="text-3xl opacity-30" />
              <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-bold uppercase">Services</span>
           </div>
           <div className="mt-8">
              <p className="text-4xl font-display">{activeServices.length}</p>
              <p className="text-xs opacity-80 uppercase font-bold tracking-widest">Live Service Logs</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="port-card bg-white border border-portmid/50 overflow-hidden shadow-sm">
           <div className="p-6 border-b border-portmid/20 flex justify-between items-center">
              <h4 className="text-lg font-display flex items-center gap-2">
                <FaAnchor className="text-indigo-600" /> Berth Management
              </h4>
              <Link href="/pre-arrival" className="text-xs font-bold text-portaccent uppercase hover:underline">View All</Link>
           </div>
           <div className="divide-y divide-portmid/10">
              {pendingBerth.length ? pendingBerth.map((v: any) => (
                <div key={v.submissionId} className="p-4 flex items-center justify-between hover:bg-portbase/30 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <FaShip />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase">{v.vesselName}</p>
                        <p className="text-[10px] text-color-text-muted font-mono">{v.vesselIMO}</p>
                      </div>
                   </div>
                   <Link 
                    href={`/pre-arrival/${v.submissionId}`}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
                   >
                     Assign <FaArrowRight />
                   </Link>
                </div>
              )) : (
                <div className="p-10 text-center flex flex-col items-center gap-2 text-color-text-muted">
                    <FaCheckCircle className="text-3xl text-emerald-500" />
                    <p className="text-sm italic">All approved vessels assigned berths</p>
                </div>
              )}
           </div>
        </div>

        <div className="port-card bg-white border border-portmid/50 overflow-hidden shadow-sm">
           <div className="p-6 border-b border-portmid/20 flex justify-between items-center text-emerald-600">
              <h4 className="text-lg font-display flex items-center gap-2 uppercase">
                <FaFileInvoice /> Financial Clearance
              </h4>
              <Link href="/invoices" className="text-xs font-bold text-emerald-600 uppercase hover:underline">Invoicing Board</Link>
           </div>
           <div className="p-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
                 <p className="text-sm text-emerald-700 mb-4 font-medium leading-relaxed">
                   Aggregated services can be converted into unified port invoices once logs are marked as completed.
                 </p>
                 <Link href="/invoices" className="port-btn-primary bg-emerald-600 hover:bg-emerald-700 w-full flex items-center justify-center gap-3 py-4 shadow-lg shadow-emerald-600/20">
                    <FaFileInvoice /> Generate Service Invoices
                 </Link>
              </div>
              
              <div className="mt-8 space-y-4">
                 <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-color-text-muted pb-2 border-b border-portmid/20">
                    <span>Recent Settlements</span>
                    <span>Amount</span>
                 </div>
                 {paidInvoices.length > 0 ? paidInvoices.slice(0, 3).map((inv: any) => (
                   <div key={inv.invoiceId} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px]">
                            <FaCheckCircle />
                         </div>
                         <span className="text-sm font-mono">{inv.vesselIMO}</span>
                      </div>
                      <span className="text-sm font-mono font-bold">{inv.currency || 'USD'} {(inv.totalAmount || 0).toLocaleString()}</span>
                   </div>
                 )) : (
                   <p className="text-center py-4 text-sm italic text-color-text-muted">No settled invoices yet</p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
