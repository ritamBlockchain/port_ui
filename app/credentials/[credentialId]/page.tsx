'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { FaShieldAlt, FaCalendarCheck, FaUserCheck, FaIdCard, FaQrcode, FaSync, FaExclamationCircle, FaCheckCircle, FaAward, FaEdit, FaBan } from 'react-icons/fa';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import QRCode from 'qrcode';


const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === 'none') return 'N/A';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

export default function CredentialDetailPage() {
  const { credentialId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRevoking, setIsRevoking] = useState(false);
  const [reason, setReason] = useState('Regulatory non-compliance');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const verifyButtonRef = useRef<HTMLButtonElement>(null);

  // Debug: Check if button is mounted
  useEffect(() => {
    console.log('Component mounted, credentialId:', credentialId);
    console.log('Verify button ref:', verifyButtonRef.current);
  }, [credentialId]);

  const { data: credential, isLoading, isError, refetch } = useQuery({
    queryKey: ['credential', credentialId],
    queryFn: async () => {
      const res = await fetch(`/api/fabric/credentials/get?id=${credentialId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    }
  });

  const { data: auditLog } = useQuery({
    queryKey: ['credential-audit', credentialId],
    queryFn: async () => {
      const res = await fetch(`/api/fabric/credentials/audit-log?credentialId=${credentialId}`);
      const json = await res.json();
      if (!json.success) return [];
      return json.data;
    }
  });

  const { data: verificationLog } = useQuery({
    queryKey: ['credential-verification', credentialId],
    queryFn: async () => {
      const res = await fetch(`/api/fabric/credentials/verification-log?credentialId=${credentialId}`);
      const json = await res.json();
      if (!json.success) return [];
      return json.data;
    }
  });

  const revokeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/fabric/credentials/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId, reason })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['credential', credentialId] });
      setIsRevoking(false);
      refetch();
    },
    onError: (err: any) => {
      toast.error(`Revocation failed: ${err.message}`);
    }
  });

  // Generate QR code when credential is loaded
  useEffect(() => {
    if (credential) {
      const generateQR = async () => {
        try {
          // Get the credential ID - try different possible field names
          const credId = credential.credentialId || credential.id || credential.credential_id;
          if (!credId) {
            console.error('No credential ID found in credential data:', credential);
            return;
          }
          
          // Use actual IP address for mobile scanning instead of localhost
          const baseUrl = 'http://192.168.1.18:3000';
          const verifyUrl = `${baseUrl}/verify?id=${credId}`;
          console.log('Generating QR for URL:', verifyUrl);
          
          const url = await QRCode.toDataURL(verifyUrl, {
            width: 512,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            },
            errorCorrectionLevel: 'M'
          });
          console.log('QR Code generated successfully, length:', url.length);
          setQrCodeUrl(url);
        } catch (err) {
          console.error('QR generation error:', err);
          setQrCodeUrl('');
        }
      };
      generateQR();
    }
  }, [credential]);

  const handleVerify = async () => {
    console.log('=== VERIFY CALLED ===');
    console.log('credentialId from params:', credentialId);
    console.log('credential data:', credential);
    
    const idToUse = credentialId || credential?.credentialId || credential?.id;
    console.log('ID to use for verification:', idToUse);
    
    if (!idToUse) {
      console.error('No credential ID available');
      toast.error('No credential ID available');
      return;
    }
    
    setIsVerifying(true);
    try {
      console.log('Sending verification request for:', idToUse);
      const res = await fetch('/api/fabric/credentials/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          credentialId: idToUse.toString(), 
          certificateHash: credential?.certificateHash || '' 
        })
      });
      console.log('Verification response status:', res.status);
      const json = await res.json();
      console.log('Verification response:', json);
      if (json.success) {
        setVerificationResult(json.data);
        toast.success('Credential verified successfully');
        // Refetch verification log to show the new entry
        queryClient.invalidateQueries({ queryKey: ['credential-verification', credentialId] });
      } else {
        setVerificationResult({ status: 'error', error: json.error });
        toast.error(json.error);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationResult({ status: 'error', error: 'Verification failed' });
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center gap-4 text-portaccent">
        <FaSync className="text-4xl animate-spin" />
        <p className="font-display">Verifying Certificate on Ledger...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="port-card p-10 bg-rose-50 border-rose-200 text-center">
        <FaExclamationCircle className="text-4xl text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-display text-rose-700">Credential Not Found</h3>
        <p className="text-sm text-rose-600">The certificate ID {credentialId} could not be located in the cryptographic registry.</p>
        <Link href="/credentials" className="mt-6 inline-block text-portaccent font-bold uppercase tracking-widest text-xs">← Back to Registry</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display">Verifiable Credential</h1>
          <p className="text-color-text-secondary">W3C Compliant Cryptographic Certificate</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase"
          >
            {isVerifying ? <FaSync className="animate-spin" /> : <FaCheckCircle />}
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>
          <Link href="/verify" className="text-xs font-bold uppercase tracking-widest text-portaccent hover:underline">
            Scan QR Code
          </Link>
          <Link href="/credentials" className="text-xs font-bold uppercase tracking-widest text-portaccent hover:underline">
            ← Back to Registry
          </Link>
        </div>
      </div>

      {/* The Certificate UI */}
      <div className="relative bg-white border-8 border-portmid/20 rounded-none p-12 shadow-2xl overflow-hidden">
        {/* Certificate Border Accents */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-portaccent/40" />
        <div className="absolute top-0 right-0 w-24 h-24 border-t-8 border-r-8 border-portaccent/40" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-8 border-l-8 border-portaccent/40" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-portaccent/40" />

        <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-portaccent/10 rounded-full flex items-center justify-center text-portaccent">
                <FaAward className="text-4xl" />
              </div>
              <div>
                <h2 className="text-2xl font-display uppercase tracking-wider text-portaccent">{credential.credentialType}</h2>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-color-text-muted">Issued by {credential.issuingAuthority}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${credential.status === 'active' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-rose-500 text-rose-600 bg-rose-50'}`}>
                {credential.status}
              </span>
            </div>
          </div>

          <div className="border-t border-portmid/30 pt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-color-text-muted block mb-2">Subject Name</label>
                <p className="text-xl font-bold text-color-text-primary capitalize">{credential.entityName}</p>
                <p className="text-xs text-color-text-secondary uppercase">{credential.entityType}: {credential.entityId}</p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-color-text-muted block mb-2">Credential DID</label>
                <p className="text-xs font-mono break-all bg-portsurface p-2 rounded border border-portmid">
                  {credential.credentialId}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-color-text-muted block mb-2">Document Hash (SHA-256)</label>
                <p className="text-xs font-mono break-all bg-emerald-50 p-2 rounded border border-emerald-200 text-emerald-800">
                  {credential.certificateHash}
                </p>
                <p className="text-[8px] text-emerald-600 mt-1 italic">Cryptographic proof of supporting document</p>
              </div>
            </div>

            <div className="space-y-6 bg-portsurface/30 p-6 rounded-xl border border-portmid/50 flex flex-col items-center justify-center">
                <div className="w-56 h-56 bg-white p-4 border-4 border-portaccent rounded-lg flex items-center justify-center relative shadow-xl">
                    {qrCodeUrl ? (
                        <img 
                            src={qrCodeUrl} 
                            alt="QR Code" 
                            className="w-full h-full object-contain"
                            style={{ imageRendering: 'crisp-edges' }}
                        />
                    ) : (
                        <div className="text-center">
                            <FaQrcode className="text-8xl text-portmid animate-pulse mx-auto mb-2" />
                            <p className="text-xs text-portmid">Generating QR...</p>
                        </div>
                    )}
                </div>
                <div className="text-center space-y-1">
                    <p className="text-[10px] text-color-text-muted font-mono leading-tight">
                        Credential ID:
                    </p>
                    <p className="text-xs font-bold text-portaccent font-mono break-all">
                        {credential.credentialId || credential.id || credential.credential_id || credentialId}
                    </p>
                    <p className="text-[8px] text-color-text-muted italic">
                        Scan to verify authenticity
                    </p>
                </div>
                {!qrCodeUrl && (
                    <p className="text-[8px] text-rose-500">QR Code not generating - check console</p>
                )}
            </div>
          </div>

          <div className="pt-8 grid grid-cols-3 gap-4 border-t border-portmid/30">
            <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-color-text-muted flex items-center gap-1"><FaCalendarCheck /> Issued On</p>
                <p className="text-xs font-bold text-color-text-primary">{formatDate(credential.issuedAt)}</p>
            </div>
            <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-color-text-muted flex items-center gap-1"><FaCalendarCheck /> Expires On</p>
                <p className="text-xs font-bold text-color-text-primary">{formatDate(credential.expiresAt)}</p>
            </div>
            <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-color-text-muted flex items-center gap-1"><FaUserCheck /> Verified By</p>
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1"><FaCheckCircle className="text-[10px]" /> Blockchain Consensus</p>
            </div>
          </div>
        </div>
      </div>

      {isRevoking ? (
        <div className="port-card p-6 bg-rose-50 border-rose-200 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <h4 className="font-display text-rose-800 flex items-center gap-2">
                <FaBan /> Confirm Revocation
            </h4>
            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-rose-600">Cancellation Reason</label>
                <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="port-input bg-white border-rose-200 focus:ring-rose-500"
                    placeholder="Provide a mandatory reason for this revocation..."
                />
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => revokeMutation.mutate()}
                    disabled={revokeMutation.isPending}
                    className="flex-1 bg-rose-600 text-white font-bold py-2 rounded-lg hover:bg-rose-700 transition-all text-xs uppercase"
                >
                    {revokeMutation.isPending ? 'Committing to Ledger...' : 'Confirm Revocation'}
                </button>
                <button 
                    onClick={() => setIsRevoking(false)}
                    className="px-6 py-2 border border-rose-200 text-rose-600 font-bold rounded-lg text-xs uppercase"
                >
                    Cancel
                </button>
            </div>
        </div>
      ) : (
        <div className="flex gap-4">
            <button 
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ position: 'relative', zIndex: 100 }}
            >
                {isVerifying ? <FaSync className="animate-spin" /> : <FaCheckCircle />}
                {isVerifying ? 'Verifying...' : 'Verify Credential'}
            </button>
            <button className="flex-1 port-btn-secondary py-3 flex items-center justify-center gap-2">
                <FaFileSync /> Download PDF Copy
            </button>
            {credential.status === 'active' && (
                <button 
                    onClick={() => setIsRevoking(true)}
                    className="flex-1 bg-rose-50 text-rose-600 border border-rose-200 font-bold py-3 flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all uppercase tracking-widest text-xs"
                >
                    <FaShieldAlt /> Revoke Credential
                </button>
            )}
        </div>
      )}

      {verificationResult && (
        <div className={`port-card p-6 border-2 ${
          verificationResult.status === 'active' || verificationResult.status === 'issued' || verificationResult.isValid === true 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            {verificationResult.status === 'active' || verificationResult.status === 'issued' || verificationResult.isValid === true ? (
              <FaCheckCircle className="text-2xl text-emerald-600" />
            ) : (
              <FaExclamationCircle className="text-2xl text-rose-600" />
            )}
            <h4 className="font-display text-lg">
              {verificationResult.status === 'active' || verificationResult.status === 'issued' || verificationResult.isValid === true 
                ? 'Credential is Valid' 
                : 'Credential is Invalid'}
            </h4>
          </div>
          <p className="text-sm text-color-text-secondary">
            This credential has been verified on the blockchain ledger.
          </p>
          {verificationResult.verifyNotes && verificationResult.verifyNotes.length > 0 && (
            <div className="mt-3 text-xs">
              <p className="font-bold uppercase tracking-widest mb-1">Verification Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                {verificationResult.verifyNotes.map((note: string, idx: number) => (
                  <li key={idx} className="text-color-text-secondary">{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {credential.status === 'revoked' && (
        <div className="port-card p-6 bg-rose-100 border-rose-300 border-l-8 border-l-rose-500">
            <h4 className="font-display text-rose-900 flex items-center gap-2 mb-2">
                <FaBan /> REVOCATION DETAILS
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
                <p><span className="font-bold opacity-60 uppercase tracking-tighter">Revoked At:</span> {formatDate(credential.revokedAt)}</p>
                <p><span className="font-bold opacity-60 uppercase tracking-tighter">Performed By:</span> {credential.revokedBy.split('@')[0]}</p>
                <p className="col-span-2"><span className="font-bold opacity-60 uppercase tracking-tighter">Reason:</span> {credential.revocationReason}</p>
            </div>
        </div>
      )}

      {/* Audit Log */}
      <div className="port-card p-6 bg-white">
        <h4 className="font-display text-portaccent flex items-center gap-2 mb-4">
            <FaSync /> Audit Log
        </h4>
        {auditLog && auditLog.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {auditLog.map((entry: any) => (
              <div key={entry.auditId} className="text-xs p-3 bg-portsurface/50 rounded border border-portmid/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold uppercase text-portaccent">{entry.action}</span>
                  <span className="text-color-text-muted">{formatDate(entry.performedAt)}</span>
                </div>
                <p className="text-color-text-secondary">By: {entry.performedBy.split('@')[0]}</p>
                {entry.notes && <p className="text-color-text-muted italic mt-1">{entry.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-color-text-muted italic">No audit log entries found</p>
        )}
      </div>

      {/* Verification Log */}
      <div className="port-card p-6 bg-white">
        <h4 className="font-display text-emerald-600 flex items-center gap-2 mb-4">
            <FaCheckCircle /> Verification Log
        </h4>
        {verificationLog && verificationLog.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {verificationLog.map((entry: any) => (
              <div key={entry.logId} className={`text-xs p-3 rounded border ${entry.isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold uppercase ${entry.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {entry.isValid ? 'Valid' : 'Invalid'}
                  </span>
                  <span className="text-color-text-muted">{formatDate(entry.verifiedAt)}</span>
                </div>
                <p className="text-color-text-secondary">Verified by: {entry.verifiedBy.split('@')[0]}</p>
                {entry.notes && <p className="text-color-text-muted italic mt-1">{entry.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-color-text-muted italic">No verification log entries found</p>
        )}
      </div>

      <div className="port-card p-6 bg-indigo-50 border-indigo-100">
        <h4 className="font-display text-indigo-900 flex items-center gap-2 mb-2">
            <FaSync className="animate-spin-slow text-indigo-500" /> Dynamic Credential Monitoring
        </h4>
        <p className="text-xs text-indigo-700 leading-relaxed">
            This certificate is dynamically tracked on the ledger. If it is revoked or if the entity's status changes, these records will update automatically across all port authority systems.
        </p>
      </div>
    </div>
  );
}

function FaFileSync() {
    return <FaSync className="rotate-90" />
}
