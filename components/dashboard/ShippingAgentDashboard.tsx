'use client';

import { FaShip, FaFileInvoiceDollar, FaPlus, FaArrowRight, FaClock } from 'react-icons/fa';
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/pre-arrival/new" className="port-card p-8 bg-gradient-to-br from-portaccent to-indigo-700 text-white group hover:shadow-2xl hover:shadow-portaccent/20 transition-all border-none">
          <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              <FaPlus />
            </div>
            <FaShip className="text-4xl opacity-20 group-hover:scale-125 transition-transform" />
          </div>
          <h3 className="text-2xl font-display mb-2">New Pre-Arrival</h3>
          <p className="text-sm opacity-80 leading-relaxed max-w-xs">Declare vessel entry, cargo manifest, and crew list to port authorities.</p>
          <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-t border-white/10 pt-4">
            Initialize Transaction <FaArrowRight />
          </div>
        </Link>

        <Link href="/invoices" className="port-card p-8 bg-white border border-portmid group hover:border-emerald-500 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl text-emerald-600">
              <FaFileInvoiceDollar />
            </div>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Action Required
            </span>
          </div>
          <h3 className="text-2xl font-display text-color-text-primary mb-2">Settle Invoices</h3>
          <p className="text-sm text-color-text-secondary leading-relaxed max-w-xs">View and pay consolidated port service charges via BankConnect.</p>
          <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 border-t border-portmid/30 pt-4">
            Secure Payment Portal <FaArrowRight />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="port-card p-6 bg-white overflow-hidden border border-portmid/50 shadow-sm">
          <h4 className="text-lg font-display mb-6 flex items-center gap-2">
            <FaShip className="text-portaccent" /> Recent Activity
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
                    sub.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {sub.status}
                  </span>
                  <p className="text-[10px] text-color-text-muted mt-1 uppercase font-bold tracking-tighter">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-center py-10 text-color-text-muted text-sm italic">No recent submissions found</p>
            )}
          </div>
        </div>

        <div className="port-card p-6 bg-white border border-portmid/50 shadow-sm">
          <h4 className="text-lg font-display mb-6 flex items-center gap-2 text-emerald-600">
            <FaFileInvoiceDollar /> Pending Dues
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
