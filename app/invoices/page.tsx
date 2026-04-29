'use client';

import { useAuth } from '@/lib/api/auth';
import { useInvoices } from '@/hooks/useInvoices';
import { usePreArrivalList } from '@/hooks/usePreArrival';
import { FaFileInvoiceDollar, FaCheckCircle, FaExclamationCircle, FaPlus, FaSync, FaCreditCard, FaLock } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function InvoicesPage() {
  const { role } = useAuth();
  const { invoices, isLoading, refetch, generateInvoice, isGenerating, settleInvoice, isSettling } = useInvoices();
  const { data: submissions } = usePreArrivalList();

  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState('');
  const [formData, setFormData] = useState({
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRatePercent: 10,
    currency: 'USD',
    issuedTo: 'Shipping Agent',
    payerAccount: 'PAYER_DEFAULT',
    payeeAccount: 'PAYEE_PORT_AUTH',
    baseRate: 1200
  });

  const [previewLogs, setPreviewLogs] = useState<any[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (selectedSubmission) {
      setIsPreviewLoading(true);
      fetch('/api/fabric/services/all')
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            const filtered = json.data.filter((l: any) => {
              const logSubId = (l.submissionId || l.SubmissionId || '').replace('did:portchain:', '');
              const selSubId = selectedSubmission.replace('did:portchain:', '');
              
              return (logSubId === selSubId) &&
                     (l.status === 'completed' || l.status === 'resolved') &&
                     !(l.invoiceId || l.InvoiceId);
            });
            setPreviewLogs(filtered);
          }
        })
        .finally(() => setIsPreviewLoading(false));
    } else {
      setPreviewLogs([]);
    }
  }, [selectedSubmission]);

  // Deduplicate and prioritize complete records
  const uniqueInvoices = Array.from(
    (invoices || []).reduce((map, inv) => {
      const existing = map.get(inv.invoiceId);
      // If we already have this ID, only replace it if the new one has more data (like a vesselIMO)
      if (!existing || (inv.vesselIMO && inv.vesselIMO !== 'N/A')) {
        map.set(inv.invoiceId, inv);
      }
      return map;
    }, new Map<string, any>()).values()
  ).sort((a, b) => new Date(b.issuedAt || 0).getTime() - new Date(a.issuedAt || 0).getTime());

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    generateInvoice({
      submissionId: selectedSubmission,
      ...formData
    }, {
      onSuccess: () => {
        setShowGenerate(false);
        setSelectedSubmission('');
        setPreviewLogs([]);
      }
    });
  };

  const handleSettle = async (inv: any) => {
    if (confirm(`Authorize blockchain payment for invoice ${inv.invoiceId}?`)) {
      settleInvoice({ invoiceId: inv.invoiceId, amountPaid: inv.totalAmount || 0 });
    }
  };

  // Calculate status summary
  const stats = {
    totalIssued: uniqueInvoices.length,
    paidCount: uniqueInvoices.filter(i => i.status === 'paid').length,
    pendingCount: uniqueInvoices.filter(i => i.status === 'issued').length,
    totalAmount: uniqueInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display text-color-text-primary uppercase tracking-tight leading-tight">Financial Settlement</h1>
          <p className="text-color-text-secondary text-sm sm:text-base">Consolidated port service invoices and ledger-based payments</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2.5 border border-portmid rounded-xl text-portaccent hover:bg-portbase transition-colors flex-shrink-0">
            <FaSync className={isLoading ? 'animate-spin' : ''} />
          </button>
          {['portauthority', 'admin'].includes(role) && (
            <button
              onClick={() => setShowGenerate(!showGenerate)}
              className="port-btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5"
            >
              {showGenerate ? 'Cancel' : <><FaPlus /> <span className="whitespace-nowrap">New Service Invoice</span></>}
            </button>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      {['portauthority', 'admin'].includes(role) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="port-card bg-white p-4 border-l-4 border-l-portaccent">
            <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest">Total Invoices</p>
            <p className="text-2xl font-display text-portaccent">{stats.totalIssued}</p>
          </div>
          <div className="port-card bg-white p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest">Settled (Paid)</p>
            <p className="text-2xl font-display text-emerald-600">{stats.paidCount}</p>
          </div>
          <div className="port-card bg-white p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest">Outstanding</p>
            <p className="text-2xl font-display text-amber-600">{stats.pendingCount}</p>
          </div>
          <div className="port-card bg-white p-4 border-l-4 border-l-indigo-500">
            <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest">Gross Revenue</p>
            <p className="text-2xl font-display text-indigo-600">${stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Generate Form Overlay */}
      {showGenerate && (
        <div className="port-card p-8 bg-white border-t-8 border-t-emerald-600 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-display text-emerald-800 uppercase tracking-tight">Generate Service Invoice</h3>
              <p className="text-sm text-color-text-secondary">Aggregate completed service logs for final ledger commitment</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <FaFileInvoiceDollar className="text-3xl" />
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Select Vessel Submission</label>
                <select
                  required
                  className="port-input w-full"
                  value={selectedSubmission}
                  onChange={(e) => setSelectedSubmission(e.target.value)}
                >
                  <option value="">-- Approved Vessels Only --</option>
                  {submissions?.filter(s => {
                    const st = (s.status || '').toLowerCase();
                    return st === 'approved';
                  }).map(s => (
                    <option key={s.submissionId} value={s.submissionId}>{s.vesselName} ({s.submissionId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Issued To (Entity)</label>
                <input
                  type="text"
                  className="port-input w-full"
                  value={formData.issuedTo}
                  onChange={(e) => setFormData({ ...formData, issuedTo: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Due Date</label>
                <input
                  type="date"
                  className="port-input w-full"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    className="port-input w-full"
                    value={formData.taxRatePercent}
                    onChange={(e) => setFormData({ ...formData, taxRatePercent: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Currency</label>
                  <select
                    className="port-input w-full"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="SGD">SGD</option>
                    <option value="MYR">MYR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Payer Account Ref</label>
                <select
                  className="port-input w-full"
                  value={formData.payerAccount}
                  onChange={(e) => setFormData({ ...formData, payerAccount: e.target.value })}
                  required
                >
                  <option value="PAYER_DEFAULT">Global Shipping Agent (Default)</option>
                  <option value="ACC_AGENT_MAERSK">Maersk Logistics Finance</option>
                  <option value="ACC_AGENT_MSC">MSC Operational Account</option>
                  <option value="ACC_AGENT_HAPAG">Hapag-Lloyd Regional</option>
                  <option value="ACC_AGENT_CMA">CMA CGM Settlement</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Payee Account (Port Auth)</label>
                <select
                  className="port-input w-full"
                  value={formData.payeeAccount}
                  onChange={(e) => setFormData({ ...formData, payeeAccount: e.target.value })}
                  required
                >
                  <option value="PAYEE_PORT_AUTH">Main Port Authority (Primary)</option>
                  <option value="PAYEE_BERTH_OPS">Berth Operations Revenue</option>
                  <option value="PAYEE_MARINE_SVC">Marine Services Fund</option>
                  <option value="PAYEE_SECURITY">Port Security Levy</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Base Service Rate (USD)</label>
                <input
                  type="number"
                  className="port-input w-full border-portaccent/30 bg-portaccent/5 text-portaccent font-bold"
                  value={formData.baseRate}
                  onChange={(e) => setFormData({ ...formData, baseRate: parseFloat(e.target.value) })}
                  required
                  min="0"
                />
                <p className="text-[8px] text-portaccent/60 mt-1 italic uppercase">Applicable only if no completed logs are found</p>
              </div>
            </div>

            {/* Service Logs Preview */}
            <div className="bg-portbase/30 rounded-2xl p-6 border border-portmid/50">
              <h4 className="text-xs font-bold text-portaccent uppercase tracking-widest mb-4 flex items-center gap-2">
                <FaSync className={isPreviewLoading ? 'animate-spin' : ''} />
                Service Logs To Be Invoiced
              </h4>

              {selectedSubmission ? (
                isPreviewLoading ? (
                  <p className="text-xs italic text-color-text-muted">Fetching operational records...</p>
                ) : previewLogs.length > 0 ? (
                  <div className="space-y-3">
                    {previewLogs.map((log) => (
                      <div key={log.logId} className="flex items-center justify-between bg-white p-3 rounded-xl border border-portmid/30 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm uppercase font-bold">
                            {log.serviceType?.[0]}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-color-text-primary">{log.serviceType}</p>
                            <p className="text-[9px] text-color-text-muted">ID: {log.logId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-emerald-600">{log.quantity} {log.quantityUnit}</p>
                          <p className="text-[8px] text-color-text-muted uppercase italic">Completed</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                    <FaSync className="text-amber-500 animate-pulse" />
                    <div>
                      <p className="text-[10px] font-bold text-amber-800 uppercase">No completed services found</p>
                      <p className="text-[9px] text-amber-600">A "Base Port Fee" will be automatically added to this invoice.</p>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-xs italic text-color-text-muted">Select a vessel to preview billable services.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowGenerate(false)}
                className="px-6 py-3 border border-portmid text-color-text-secondary rounded-xl hover:bg-portbase transition-all text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                disabled={isGenerating || !selectedSubmission}
                type="submit"
                className="port-btn-primary bg-emerald-600 hover:bg-emerald-700 py-3 px-10 flex items-center gap-2 shadow-lg shadow-emerald-200"
              >
                <FaFileInvoiceDollar /> {isGenerating ? 'Committing to Ledger...' : 'Issue Final Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice List Area */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-portaccent">
            <FaSync className="text-4xl animate-spin" />
            <p className="font-display">Synchronizing Financial Ledger...</p>
          </div>
        ) : uniqueInvoices.length > 0 ? (
          uniqueInvoices.map((inv) => (
            <div key={inv.invoiceId} className="port-card bg-white p-6 flex items-center justify-between group hover:border-emerald-500 transition-all animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600 shadow-sm'}`}>
                  <FaFileInvoiceDollar className="text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-color-text-primary text-lg">{inv.invoiceId}</h3>
                    {inv.status === 'paid' ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                        <FaCheckCircle /> Paid
                      </span>
                    ) : (
                      <FaLock className="text-color-text-muted text-xs opacity-30" />
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest">
                      Vessel: <span className="text-color-text-primary">{inv.vesselIMO || inv.submissionId || 'N/A'}</span>
                    </p>
                    <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {inv.currency || 'USD'} {(inv.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-[9px] text-color-text-muted uppercase tracking-widest mt-1">Issued To: {inv.issuedTo}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest mb-1">Due Date</p>
                  <p className="text-xs font-medium text-color-text-primary">
                    {inv.dueDate && inv.dueDate !== 'N/A' ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                {inv.status !== 'paid' && role === 'portauthority' && (
                  <button
                    onClick={() => handleSettle(inv)}
                    disabled={isSettling}
                    className="port-btn-primary py-2 px-4 text-xs flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <FaCreditCard /> {isSettling ? 'Processing...' : 'Settle Payment'}
                  </button>
                )}
                {inv.status === 'paid' && (
                  <div className="flex flex-col items-end">
                    <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <FaCheckCircle /> Secure Release Issued
                    </span>
                    <p className="text-[8px] text-color-text-muted italic">Payment Finalized on Fabric</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="port-card p-20 text-center flex flex-col items-center gap-4 bg-white/40 border-dashed">
            <FaFileInvoiceDollar className="text-5xl text-portmid" />
            <h3 className="text-2xl font-display text-color-text-secondary uppercase tracking-widest">Financial Ledger Empty</h3>
            <p className="text-sm text-color-text-muted max-w-md italic">Generate service invoices after vessel operations are completed to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
