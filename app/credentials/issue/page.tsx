'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/api/auth';
import { useMutation } from '@tanstack/react-query';
import { FaCertificate, FaShip, FaBuilding, FaArrowLeft, FaSync } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'sonner';

export default function IssueCredentialPage() {
  const router = useRouter();
  const { role } = useAuth();
  
  const [formData, setFormData] = useState({
    shortId: '',
    entityType: 'ship',
    entityId: '',
    entityName: '',
    credentialType: 'IMOCertificate',
    issuingAuthority: 'Port Registrar',
    referenceNumber: `REF-${Date.now()}`,
    certificateHash: '',
    validFrom: new Date().toISOString().split('T')[0],
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    verificationBaseURL: 'http://localhost:3000/verify',
    previousCredentialId: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  const issueMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/fabric/credentials/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (data) => {
      toast.success(`Credential ${data.data.credentialId} issued successfully`);
      router.push('/credentials');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to issue credential');
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsHashing(true);

    try {
      // Generate SHA-256 hash of the file
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setFormData(prev => ({ ...prev, certificateHash: `0x${hashHex}` }));
      toast.success('Document hash generated successfully');
    } catch (error) {
      toast.error('Failed to generate document hash');
      console.error(error);
    } finally {
      setIsHashing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.entityId || !formData.entityName || !formData.credentialType) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate IMO for ship credentials
    if (formData.entityType === 'ship' && !formData.entityId.startsWith('IMO')) {
      toast.error('Ship credentials require a valid IMO number (format: IMO1234567)');
      return;
    }

    // Require document upload
    if (!formData.certificateHash) {
      toast.error('Please upload a supporting document to generate the certificate hash');
      return;
    }

    issueMutation.mutate({
      ...formData,
      validFrom: new Date(formData.validFrom).toISOString(),
      expiresAt: new Date(formData.expiresAt).toISOString()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-tight">Issue New Credential</h1>
          <p className="text-color-text-secondary">Mint a verifiable digital credential on the blockchain</p>
        </div>
        <Link href="/credentials" className="text-xs font-bold uppercase tracking-widest text-portaccent hover:underline">
          <FaArrowLeft className="inline mr-1" /> Back to Registry
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Entity Information */}
        <div className="port-card bg-white p-8 border-t-8 border-t-portaccent shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-widest text-portaccent mb-6 flex items-center gap-2">
            <FaBuilding /> Entity Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Entity Type</label>
              <select name="entityType" value={formData.entityType} onChange={handleChange} className="port-input">
                <option value="ship">Ship/Vessel</option>
                <option value="company">Company/Organization</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">
                {formData.entityType === 'ship' ? 'IMO Number' : 'Company ID'}
              </label>
              <input
                type="text"
                name="entityId"
                value={formData.entityId}
                onChange={handleChange}
                placeholder={formData.entityType === 'ship' ? 'IMO1234567' : 'COMP-001'}
                className="port-input"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Entity Name</label>
              <input
                type="text"
                name="entityName"
                value={formData.entityName}
                onChange={handleChange}
                placeholder="Global Shipping Line Ltd"
                className="port-input"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Short ID</label>
              <input
                type="text"
                name="shortId"
                value={formData.shortId}
                onChange={handleChange}
                placeholder="VC-001"
                className="port-input"
              />
            </div>
          </div>
        </div>

        {/* Credential Details */}
        <div className="port-card bg-white p-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2">
            <FaCertificate /> Credential Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Credential Type</label>
              <select name="credentialType" value={formData.credentialType} onChange={handleChange} className="port-input">
                <option value="IMOCertificate">IMO Certificate</option>
                <option value="SafetyManagement">Safety Management Certificate</option>
                <option value="Insurance">Insurance Certificate</option>
                <option value="LoadLineCertificate">Load Line Certificate</option>
                <option value="MARPOLCertificate">MARPOL Certificate</option>
                <option value="SOLASCertificate">SOLAS Certificate</option>
                <option value="BusinessLicense">Business License</option>
                <option value="TaxRegistration">Tax Registration</option>
                <option value="ISMCodeDocument">ISM Code Document</option>
                <option value="ISOCertificate">ISO Certificate</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Issuing Authority</label>
              <input
                type="text"
                name="issuingAuthority"
                value={formData.issuingAuthority}
                onChange={handleChange}
                className="port-input"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Reference Number</label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                className="port-input"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Supporting Document (Required)</label>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="port-input"
                disabled={isHashing}
              />
              {uploadedFile && (
                <p className="text-[8px] text-emerald-600 mt-1 flex items-center gap-1">
                  ✓ {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
              {isHashing && (
                <p className="text-[8px] text-portaccent mt-1">Generating SHA-256 hash...</p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Certificate Hash (Auto-generated)</label>
              <input
                type="text"
                name="certificateHash"
                value={formData.certificateHash}
                onChange={handleChange}
                placeholder="Upload document to generate hash"
                className="port-input bg-portsurface/50"
                readOnly
              />
              {formData.certificateHash && (
                <p className="text-[8px] text-emerald-600 mt-1">✓ Hash generated from uploaded document</p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Valid From</label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                className="port-input"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Expires At</label>
              <input
                type="date"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                className="port-input"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Verification Base URL</label>
              <input
                type="text"
                name="verificationBaseURL"
                value={formData.verificationBaseURL}
                onChange={handleChange}
                className="port-input"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Previous Credential ID (for renewal)</label>
              <input
                type="text"
                name="previousCredentialId"
                value={formData.previousCredentialId}
                onChange={handleChange}
                placeholder="CRED_1234567890_abc123"
                className="port-input"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={issueMutation.isPending}
            className="flex-1 bg-portaccent text-white font-bold py-4 rounded-xl shadow-lg shadow-portaccent/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3"
          >
            {issueMutation.isPending ? <FaSync className="animate-spin" /> : <FaCertificate />}
            {issueMutation.isPending ? 'Committing to Ledger...' : 'Issue Credential'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/credentials')}
            className="px-8 py-4 border-2 border-portmid text-color-text-secondary font-bold rounded-xl hover:bg-portbase transition-all text-xs uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
