'use client';

import { useAuth } from '@/lib/api/auth';
import { useInvoices } from '@/hooks/useInvoices';
import { usePreArrivalList } from '@/hooks/usePreArrival';
import { FaFileInvoiceDollar, FaCheckCircle, FaExclamationCircle, FaPlus, FaSync, FaCreditCard, FaLock } from 'react-icons/fa';
import { useState } from 'react';

export default function InvoicesPage() {
  const { role } = useAuth();
  const { invoices, isLoading, refetch, generateInvoice, isGenerating, settleInvoice, isSettling } = useInvoices();
  const { data: submissions } = usePreArrivalList();
  
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    generateInvoice({ submissionId: selectedSubmission }, {
        onSuccess: () => {
            setShowGenerate(false);
            setSelectedSubmission('');
        }
    });
  };

  const handleSettle = async (invoiceId: string) => {
    if (confirm(`Authorize blockchain payment for invoice ${invoiceId}?`)) {
        settleInvoice(invoiceId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-color-text-primary">Financial Settlement</h1>
          <p className="text-color-text-secondary">Consolidated port service invoices and ledger-based payments</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => refetch()} className="p-2 border border-portmid rounded-lg text-portaccent hover:bg-portbase">
                <FaSync className={isLoading ? 'animate-spin' : ''} />
            </button>
            {['portauthority', 'admin'].includes(role) && (
            <button 
                onClick={() => setShowGenerate(!showGenerate)}
                className="port-btn-primary flex items-center gap-2"
            >
                {showGenerate ? 'Cancel' : <><FaPlus /> Generate Invoice</>}
            </button>
            )}
        </div>
      </div>

      {showGenerate && (
        <div className="port-card p-6 bg-white border-2 border-emerald-500 shadow-xl animate-in zoom-in duration-300">
           <h3 className="text-xl font-display mb-4 text-emerald-700">Generate Service Invoice</h3>
           <p className="text-sm text-color-text-secondary mb-6">This will aggregate all completed service logs for the selected vessel and create a unified invoice on the ledger.</p>
           <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4">
              <select 
                required
                className="port-input flex-1"
                value={selectedSubmission}
                onChange={(e) => setSelectedSubmission(e.target.value)}
              >
                <option value="">-- Select Vessel with Completed Services --</option>
                {submissions?.filter(s => s.status === 'approved').map(s => (
                  <option key={s.submissionId} value={s.submissionId}>{s.vesselName} ({s.submissionId})</option>
                ))}
              </select>
              <button 
                disabled={isGenerating}
                type="submit" 
                className="port-btn-primary bg-emerald-600 hover:bg-emerald-700 py-3 px-8 flex items-center gap-2"
              >
                <FaFileInvoiceDollar /> {isGenerating ? 'Compiling logs...' : 'Generate on Ledger'}
              </button>
           </form>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-portaccent">
          <FaSync className="text-4xl animate-spin" />
          <p className="font-display text-xl tracking-widest uppercase">Querying Financial Records...</p>
        </div>
      ) : invoices && invoices.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {invoices.map((inv) => (
            <div key={inv.invoiceId} className="port-card p-6 flex flex-col md:flex-row md:items-center justify-between group hover:border-portaccent transition-all bg-white relative overflow-hidden">
                {inv.status === 'paid' && (
                    <div className="absolute top-0 right-0 w-24 h-24 flex items-center justify-center rotate-45 translate-x-10 -translate-y-10 bg-emerald-500/10">
                        <FaCheckCircle className="text-emerald-500 text-2xl -rotate-45" />
                    </div>
                )}
              
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ring-1 ring-portmid/30 ${
                    inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-portbase text-portaccent'
                }`}>
                  <FaFileInvoiceDollar />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg text-color-text-primary uppercase tracking-tight">{inv.invoiceId}</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                      inv.status === 'issued' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gray-50 text-gray-600'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-color-text-secondary mt-1 uppercase">Vessel: {inv.vesselIMO}</p>
                  <p className="text-[10px] text-color-text-muted mt-0.5 italic">Total Amount: {inv.currency || 'USD'} {(inv.totalAmount || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col md:items-end gap-3 z-10">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest">Due Date</p>
                  <p className="text-sm font-medium">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                
                {inv.status === 'issued' && (role === 'shippingagent' || role === 'admin') && (
                  <button 
                    disabled={isSettling}
                    onClick={() => handleSettle(inv.invoiceId)}
                    className="port-btn-primary bg-emerald-600 hover:bg-emerald-700 py-2 px-6 flex items-center gap-2 text-xs"
                  >
                    <FaCreditCard /> {isSettling ? 'Processing...' : 'Settle Payment'}
                  </button>
                )}

                {inv.status === 'paid' && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <FaLock className="text-[8px]" /> Secure Release Issued
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="port-card p-20 text-center flex flex-col items-center gap-4 bg-white/40 border-dashed">
          <FaFileInvoiceDollar className="text-5xl text-portmid" />
          <h3 className="text-2xl font-display text-color-text-secondary uppercase tracking-widest">Financial Ledger Empty</h3>
          <p className="text-sm text-color-text-muted max-w-md italic">Generate service invoices after vessel operations are completed to see them here.</p>
        </div>
      )}
    </div>
  );
}
