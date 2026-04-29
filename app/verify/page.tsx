'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaQrcode, FaCheckCircle, FaExclamationCircle, FaSync } from 'react-icons/fa';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === 'none') return 'N/A';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
};

export default function VerifyCredentialPage() {
  const searchParams = useSearchParams();
  const urlCredentialId = searchParams.get('id');
  
  const [scannedCredentialId, setScannedCredentialId] = useState(urlCredentialId || '');
  const [manualCredentialId, setManualCredentialId] = useState('');
  const [certificateHash, setCertificateHash] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: credential, isLoading, isError, refetch } = useQuery({
    queryKey: ['credential', scannedCredentialId || manualCredentialId],
    queryFn: async () => {
      const id = scannedCredentialId || manualCredentialId;
      if (!id) return null;
      const res = await fetch(`/api/fabric/credentials/get?id=${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!(scannedCredentialId || manualCredentialId)
  });

  // Auto-verify when credential ID is from URL (QR scan)
  useEffect(() => {
    if (urlCredentialId && credential && !verificationResult) {
      handleVerify();
    }
  }, [urlCredentialId, credential]);

  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    const id = scannedCredentialId || manualCredentialId;
    if (!id) return;
    
    setIsVerifying(true);
    try {
      const res = await fetch('/api/fabric/credentials/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId: id, certificateHash })
      });
      const json = await res.json();
      if (json.success) {
        setVerificationResult(json.data);
      } else {
        setVerificationResult({ status: 'error', error: json.error });
      }
    } catch (error) {
      setVerificationResult({ status: 'error', error: 'Verification failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = () => {
    setScannedCredentialId(manualCredentialId);
    refetch();
  };

  const startScanner = async () => {
    setIsScanning(true);
    try {
      // Use browser's built-in QR code detection if available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          
          const detectQR = async () => {
            if (videoRef.current && isScanning) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const credentialId = barcodes[0].rawValue;
                  setScannedCredentialId(credentialId);
                  setIsScanning(false);
                  stream.getTracks().forEach(track => track.stop());
                }
              } catch (e) {
                console.log('Detection failed, retrying...');
              }
              requestAnimationFrame(detectQR);
            }
          };
          detectQR();
        }
      } else {
        alert('QR code scanning is not supported in this browser. Please use Chrome, Edge, or Safari.');
        setIsScanning(false);
      }
    } catch (error) {
      console.error('Scanner error:', error);
      alert('Could not access camera. Please ensure camera permissions are granted.');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-tight">Verify Credential</h1>
          <p className="text-color-text-secondary">Scan QR code or enter credential ID to verify authenticity</p>
        </div>
        <Link href="/credentials" className="text-xs font-bold uppercase tracking-widest text-portaccent hover:underline">
          ← Back to Registry
        </Link>
      </div>

      {/* Scanner & Manual Sections - Hidden when a result is being shown */}
      {!credential && !isLoading && (
        <>
          {/* Scanner Section */}
          <div className="port-card p-8 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-widest text-portaccent mb-6 flex items-center gap-2">
              <FaQrcode /> QR Code Scanner
            </h3>
            
            {!isScanning ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-64 h-64 border-4 border-dashed border-portmid rounded-2xl flex items-center justify-center bg-portsurface/30">
                  <div className="text-center">
                    <FaQrcode className="text-6xl text-portmid mx-auto mb-4" />
                    <p className="text-sm text-color-text-muted">Click below to start scanning</p>
                  </div>
                </div>
                <button
                  onClick={startScanner}
                  className="port-btn-primary px-8 py-3 flex items-center gap-2"
                >
                  <FaQrcode /> Start Scanner
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <video
                  ref={videoRef}
                  className="w-64 h-64 object-cover rounded-2xl border-4 border-portaccent"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="text-center">
                  <p className="text-sm font-bold text-portaccent mb-2">Align QR code within frame</p>
                  <button
                    onClick={stopScanner}
                    className="px-6 py-2 border border-rose-200 text-rose-600 rounded-lg font-bold text-xs uppercase hover:bg-rose-50 transition-all"
                  >
                    Cancel Scan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Manual Entry Section */}
          <div className="port-card p-8 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-6">
              Manual Entry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Credential ID</label>
                <input
                  type="text"
                  value={manualCredentialId}
                  onChange={(e) => setManualCredentialId(e.target.value)}
                  placeholder="CRED_1234567890_abc123"
                  className="port-input"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Certificate Hash (Optional)</label>
                <input
                  type="text"
                  value={certificateHash}
                  onChange={(e) => setCertificateHash(e.target.value)}
                  placeholder="0x..."
                  className="port-input"
                />
              </div>
            </div>
            <button
              onClick={handleManualVerify}
              disabled={!manualCredentialId}
              className="mt-4 port-btn-primary px-6 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSync /> Verify Credential
            </button>
          </div>
        </>
      )}

      {/* Credential Display */}
      {isLoading && (
        <div className="port-card p-10 text-center">
          <FaSync className="text-4xl text-portaccent mx-auto mb-4 animate-spin" />
          <p className="font-display">Fetching credential from ledger...</p>
        </div>
      )}

      {isError && (
        <div className="port-card p-10 bg-rose-50 border-rose-200 text-center">
          <FaExclamationCircle className="text-4xl text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-display text-rose-700">Credential Not Found</h3>
          <p className="text-sm text-rose-600">The credential could not be found on the ledger.</p>
        </div>
      )}

      {credential && (
        <div className="port-card p-8 bg-white border-t-8 border-t-portaccent">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-display text-portaccent uppercase">{credential.credentialType}</h3>
              <p className="text-sm text-color-text-secondary">Issued by {credential.issuingAuthority}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 ${
              credential.status === 'active' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-rose-500 text-rose-600 bg-rose-50'
            }`}>
              {credential.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Entity Name</label>
              <p className="text-lg font-bold">{credential.entityName}</p>
              <p className="text-sm text-color-text-secondary">{credential.entityType}: {credential.entityId}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Credential ID</label>
              <p className="text-xs font-mono break-all bg-portsurface p-2 rounded border border-portmid min-h-[2.5rem] flex items-center px-3">
                {credential.id || credential.credentialId}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Document Hash</label>
              <p className="text-xs font-mono break-all bg-emerald-50 p-2 rounded border border-emerald-200 text-emerald-800">
                {credential.certificateHash}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted block mb-1">Valid Period</label>
              <p className="text-sm">
                {formatDate(credential.issuedAt)} - {formatDate(credential.expiresAt)}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-portmid/30 flex gap-4">
            {!verificationResult ? (
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="port-btn-primary px-6 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? <FaSync className="animate-spin" /> : <FaCheckCircle />} 
                {isVerifying ? 'Verify Authenticity' : 'Verify Authenticity'}
              </button>
            ) : null}
            <button
              onClick={() => {
                setScannedCredentialId('');
                setManualCredentialId('');
                setVerificationResult(null);
                window.history.replaceState({}, '', '/verify');
              }}
              className="px-6 py-2 border border-portmid text-color-text-secondary rounded-lg font-bold text-xs uppercase hover:bg-portbase transition-all"
            >
              Scan Another
            </button>
          </div>

          {verificationResult && (
            <div className={`mt-6 p-6 rounded-xl border-2 ${
              verificationResult.status === 'active' || verificationResult.status === 'issued' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {verificationResult.status === 'active' || verificationResult.status === 'issued' ? (
                  <FaCheckCircle className="text-2xl text-emerald-600" />
                ) : (
                  <FaExclamationCircle className="text-2xl text-rose-600" />
                )}
                <h4 className="font-display text-lg">
                  {verificationResult.status === 'active' || verificationResult.status === 'issued' ? 'Credential is Valid' : 'Credential is Invalid'}
                </h4>
              </div>
              <p className="text-sm text-color-text-secondary">
                This credential has been verified on the blockchain ledger.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
