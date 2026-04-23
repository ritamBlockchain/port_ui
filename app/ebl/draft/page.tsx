'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEBL } from '@/hooks/useEBL';
import { FaFileInvoice, FaShip, FaUser, FaBox, FaArrowRight, FaSync, FaAnchor } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'sonner';

export default function IssueEBLPage() {
  const router = useRouter();
  const { issue } = useEBL();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(true);
  
  const [formData, setFormData] = useState({
    eblId: `EBL-${Math.floor(Math.random() * 1000000)}`,
    submissionId: '',
    voyageNumber: 'V-2024-001',
    portOfLoading: 'Port Klang, Malaysia',
    portOfDischarge: 'Port of Rotterdam, Netherlands',
    placeOfReceipt: 'Cyberjaya Logistics Hub',
    placeOfDelivery: 'Rotterdam Distribution Center',
    freightPayment: 'prepaid',
    blType: 'original',
    shipper: 'Global Tech Manufacturing Ltd',
    consignee: 'EuroTrade Wholesalers B.V.',
    notifyParty: 'EuroTrade Wholesalers B.V.',
    goodsDetails: '2000 units High-Precision Electronic Sensors in 20ft Container'
  });

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const res = await fetch('/api/fabric/pre-arrival/get');
        const json = await res.json();
        if (json.success) {
          const approved = json.data.filter((s: any) => s.status === 'approved');
          setSubmissions(approved);
          if (approved.length > 0) {
            setFormData(prev => ({ ...prev, submissionId: approved[0].submissionId }));
          }
        }
      } catch (err) {
        console.error('Failed to load submissions', err);
      } finally {
        setIsLoadingSubs(false);
      }
    }
    loadSubmissions();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.submissionId) {
        toast.error('You must link this eBL to a valid Pre-Arrival Submission');
        return;
    }
    issue.mutate(formData, {
      onSuccess: () => {
        router.push('/ebl');
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-tight">Issue New e-Bill of Lading</h1>
          <p className="text-color-text-secondary">Mint a new cryptographic title document on the ledger</p>
        </div>
        <Link href="/ebl" className="text-xs font-bold uppercase tracking-widest text-portaccent hover:underline">
          ← Back to Registry
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Header */}
        <div className="port-card bg-white p-8 border-t-8 border-t-portaccent shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Linked Pre-Arrival Submission</label>
              {isLoadingSubs ? (
                  <div className="flex items-center gap-2 p-3 bg-portsurface rounded-lg text-xs italic"><FaSync className="animate-spin text-portaccent" /> Loading valid submissions...</div>
              ) : submissions.length > 0 ? (
                  <select 
                    name="submissionId" 
                    value={formData.submissionId} 
                    onChange={handleChange}
                    className="port-input bg-portsurface/50 border-portaccent/30 font-bold"
                  >
                    {submissions.map(s => (
                        <option key={s.submissionId} value={s.submissionId}>
                            {s.submissionId} - {s.vesselName} (IMO: {s.vesselIMO})
                        </option>
                    ))}
                  </select>
              ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 font-bold flex items-center gap-2">
                      <FaAnchor /> No approved submissions found. Create one first!
                  </div>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Bill of Lading Type</label>
              <select name="blType" value={formData.blType} onChange={handleChange} className="port-input">
                <option value="original">Negotiable (Original)</option>
                <option value="seawaybill">Non-Negotiable (Sea Waybill)</option>
                <option value="telex">Telex Release</option>
              </select>
            </div>
          </div>
        </div>

        {/* Voyage Information */}
        <div className="port-card bg-white p-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-portaccent mb-6 flex items-center gap-2">
            <FaShip /> Voyage & Logistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Voyage Number</label>
              <input name="voyageNumber" value={formData.voyageNumber} onChange={handleChange} className="port-input" required />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Freight Payment Status</label>
              <select name="freightPayment" value={formData.freightPayment} onChange={handleChange} className="port-input">
                <option value="prepaid">Prepaid</option>
                <option value="collect">Collect at Destination</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Port of Loading</label>
              <input name="portOfLoading" value={formData.portOfLoading} onChange={handleChange} className="port-input" required />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Port of Discharge</label>
              <input name="portOfDischarge" value={formData.portOfDischarge} onChange={handleChange} className="port-input" required />
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="port-card bg-white p-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2">
            <FaUser /> Contracting Parties
          </h3>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Shipper</label>
              <input name="shipper" value={formData.shipper} onChange={handleChange} className="port-input" required />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Consignee</label>
              <input name="consignee" value={formData.consignee} onChange={handleChange} className="port-input" required />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Notify Party</label>
              <input name="notifyParty" value={formData.notifyParty} onChange={handleChange} className="port-input" required />
            </div>
          </div>
        </div>

        {/* Cargo */}
        <div className="port-card bg-white p-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-6 flex items-center gap-2">
            <FaBox /> Cargo Manifest
          </h3>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Description of Goods</label>
            <textarea 
              name="goodsDetails" 
              value={formData.goodsDetails} 
              onChange={handleChange} 
              className="port-input min-h-[100px]" 
              required 
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            type="submit" 
            disabled={issue.isPending}
            className="flex-1 bg-portaccent text-white font-bold py-4 rounded-xl shadow-lg shadow-portaccent/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3"
          >
            {issue.isPending ? <FaSync className="animate-spin" /> : <FaArrowRight />} 
            {issue.isPending ? 'Committing to Ledger...' : 'Issue e-Bill of Lading'}
          </button>
          <button 
            type="button" 
            onClick={() => router.push('/ebl')}
            className="px-8 py-4 border-2 border-portmid text-color-text-secondary font-bold rounded-xl hover:bg-portbase transition-all text-xs uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
