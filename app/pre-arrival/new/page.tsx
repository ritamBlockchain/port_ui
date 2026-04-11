'use client';

import PreArrivalForm from '@/components/pre-arrival/PreArrivalForm';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/lib/api/auth';
import { redirect } from 'next/navigation';

export default function NewPreArrivalPage() {
  const { role } = useAuth();

  // Only Shipping Agent and Admin can submit
  if (role !== 'shippingagent' && role !== 'admin') {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-2xl font-display text-rose-600 mb-2">Access Restricted</h2>
            <p className="text-color-text-secondary mb-6">Your current identity ({role}) does not have permission to submit Pre-Arrival declarations.</p>
            <Link href="/pre-arrival" className="port-btn-primary">Back to Registry</Link>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/pre-arrival" className="text-xs font-bold text-portaccent flex items-center gap-1 mb-2 hover:underline uppercase tracking-widest">
            <FaArrowLeft /> Back to Registry
          </Link>
          <h1 className="text-4xl font-display">New Pre-Arrival Declaration</h1>
          <p className="text-color-text-secondary mt-1 italic">Authorized Broadcast Mode: Vessel Security & Entry (VSE)</p>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded ring-1 ring-emerald-200 uppercase tracking-widest">
            Identity Verified
          </div>
          <p className="text-[10px] text-color-text-muted mt-1 uppercase">Channel: mychannel</p>
        </div>
      </div>

      <div className="bg-white/40 p-1 rounded-3xl border border-portmid shadow-sm overflow-hidden">
        <div className="p-8">
            <PreArrivalForm />
        </div>
      </div>
      
      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 flex gap-4 items-start">
        <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 shrink-0">!</div>
        <div className="space-y-1">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">Legal Notice</p>
            <p className="text-[10px] text-amber-700 leading-relaxed italic">
                Submitting this form broadcasts data to Hyperledger Fabric. Once committed, the record is immutable and will be used as the primary source for berth assignment and regulatory clearance. Ensure all weights and IMO details are accurate to avoid audit flags.
            </p>
        </div>
      </div>
    </div>
  );
}
