'use client';

import React, { useState } from 'react';
import { 
  FaShip, FaGavel, FaAnchor, FaFileInvoiceDollar, 
  FaFileContract, FaCertificate, FaPlay, FaSync, 
  FaCheckCircle, FaExclamationCircle, FaTerminal 
} from 'react-icons/fa';
import { toast } from 'sonner';

interface LogEntry {
  timestamp: string;
  phase: string;
  message: string;
  type: 'info' | 'success' | 'error';
  txId?: string;
}

export default function TestFlowPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testData, setTestData] = useState({
    id: Date.now().toString(),
    submissionId: '',
    imo: '',
    asgId: '',
    logId: '',
    drftId: '',
    eblId: '',
    invoiceId: '',
    credId: ''
  });

  const addLog = (phase: string, message: string, type: 'info' | 'success' | 'error' = 'info', txId?: string) => {
    setLogs(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      phase,
      message,
      type,
      txId
    }, ...prev]);
  };

  const generateIds = () => {
    const id = Date.now().toString();
    const shortId = id.slice(-6);
    setTestData({
      id,
      submissionId: `SUB_UI_${shortId}`,
      imo: `IMO${Math.floor(1000000 + Math.random() * 9000000)}`,
      asgId: `ASG_UI_${shortId}`,
      logId: `LOG_UI_${shortId}`,
      drftId: `DRFT_UI_${shortId}`,
      eblId: `EBL_UI_${shortId}`,
      invoiceId: `INV_UI_${shortId}`,
      credId: `CRED_UI_${shortId}`
    });
    addLog('SETUP', `Generated New Test IDs (Suffix: ${shortId})`, 'success');
  };

  const runPhase = async (phase: number) => {
    if (!testData.submissionId) {
      toast.error('Generate IDs first!');
      return false;
    }

    try {
      switch (phase) {
        case 1: // Arrival & Compliance
          addLog('PHASE 1', 'Submitting Pre-Arrival Voyage Data...');
          let res = await fetch('/api/fabric/pre-arrival/submit', {
            method: 'POST',
            body: JSON.stringify({
              submissionId: testData.submissionId,
              vesselIMO: testData.imo,
              vesselName: 'UI Test Vessel',
              callSign: 'UITEST',
              flag: 'UK',
              etaTimestamp: new Date(Date.now() + 86400000).toISOString(),
              cargoManifest: [{ containerNo: 'CONT123', description: 'General Cargo', weight: 20.5 }],
              crewList: [{ name: 'Capt. Test', passportNo: 'P12345', rank: 'Master' }],
              portCallPurpose: 'both'
            })
          });
          let json = await res.json();
          if (!json.success) throw new Error(json.error);
          addLog('PHASE 1', 'Submission recorded on ledger', 'success', json.txId);

          addLog('PHASE 1', 'Triggering Automated Compliance Validation...');
          res = await fetch('/api/fabric/pre-arrival/validate', {
            method: 'POST',
            body: JSON.stringify({ submissionId: testData.submissionId })
          });
          json = await res.json();
          if (!json.success) throw new Error(json.error);
          addLog('PHASE 1', 'Compliance check complete: COMPLIANT', 'success', json.txId);
          return true;

        case 2: // Agency Approval
          addLog('PHASE 2', 'Simulating Multi-Agency Approvals (Customs, Immigration, Health)...');
          const agencies = ['customs', 'immigration', 'porthealth'];
          for (const agency of agencies) {
            res = await fetch('/api/fabric/pre-arrival/approve', {
              method: 'POST',
              body: JSON.stringify({
                submissionId: testData.submissionId,
                agency,
                comments: `UI Automated ${agency} clearance`,
                approved: true
              })
            });
            json = await res.json();
            if (!json.success) throw new Error(json.error);
            addLog('PHASE 2', `${agency} approval committed`, 'success', json.txId);
          }
          return true;

        case 3: // Berth & Services
          addLog('PHASE 3', 'Assigning Berth and Logging Pilotage Service...');
          res = await fetch('/api/fabric/berth', {
            method: 'POST',
            body: JSON.stringify({
              assignmentId: testData.asgId,
              submissionId: testData.submissionId,
              vesselIMO: testData.imo,
              berthId: 'B-UI-01',
              berthName: 'Main Terminal',
              timeSlot: 'Morning Shift',
              pilotageInfo: 'Pilot board at buoy A',
              isOverride: false
            })
          });
          json = await res.json();
          if (!json.success) throw new Error(json.error);
          addLog('PHASE 3', 'Berth assigned successfully', 'success', json.txId);

          addLog('PHASE 3', 'Starting Service: Pilotage...');
          res = await fetch('/api/fabric/services/start', {
            method: 'POST',
            body: JSON.stringify({
              logId: testData.logId,
              submissionId: testData.submissionId,
              assignmentId: testData.asgId,
              serviceType: 'pilotage',
              providerName: 'Port Pilots Association',
              quantityUnit: 'hours'
            })
          });
          json = await res.json();
          if (!json.success) throw new Error(json.error);
          addLog('PHASE 3', 'Pilotage service started', 'success', json.txId);

          addLog('PHASE 3', 'Completing Service: Pilotage (Duration: 2 hours)...');
          res = await fetch('/api/fabric/services/complete', {
            method: 'POST',
            body: JSON.stringify({
              logId: testData.logId,
              remarks: 'Safe passage complete',
              quantity: 2.0
            })
          });
          json = await res.json();
          if (!json.success) throw new Error(json.error);
          addLog('PHASE 3', 'Service completion logged', 'success', json.txId);
          return true;

        case 4: // Finance
          addLog('PHASE 4', 'Generating Invoice from Service Logs...');
          res = await fetch('/api/fabric/invoices/generate', {
            method: 'POST',
            body: JSON.stringify({
              invoiceId: testData.invoiceId,
              submissionId: testData.submissionId,
              assignmentId: testData.asgId,
              issuedTo: 'Test Shipping Agent Ltd',
              currency: 'USD',
              dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
              logIds: [testData.logId],
              unitRates: { [testData.logId]: 450 },
              discounts: { [testData.logId]: 0 },
              taxRatePercent: 12.5,
              payerAccount: 'ACC-AGENT-001',
              payeeAccount: 'ACC-PORT-999'
            })
          });
          json = await res.json();
          if (!json.success) throw new Error(json.error);
          addLog('PHASE 4', 'Invoice created on ledger', 'success', json.txId);

          addLog('PHASE 4', 'Confirming Payment Settlement...');
          res = await fetch('/api/fabric/invoices/confirm', {
            method: 'POST',
            body: JSON.stringify({
              invoiceId: testData.invoiceId,
              bankRefNumber: 'BANK-UI-REF-123',
              paymentGateway: 'SmartPay',
              amountPaid: 1008.0
            })
          });
          json = await res.json();
          if (!json.success) throw new Error(json.error);
          addLog('PHASE 4', 'Payment confirmed and reconciled', 'success', json.txId);
          return true;

        case 5: // eBL
          addLog('PHASE 5', 'Initializing e-BL Lifecycle...');
          res = await fetch('/api/fabric/ebl/create-draft', {
            method: 'POST',
            body: JSON.stringify({
              draftId: testData.drftId,
              eblId: testData.eblId,
              blNumber: `BL-UI-${testData.id.slice(-4)}`,
              submissionId: testData.submissionId,
              snapshot: '{}'
            })
          });
          json = await res.json();
          if (!json.success) throw new Error(json.error);
          addLog('PHASE 5', 'Draft e-BL created', 'success', json.txId);

          addLog('PHASE 5', 'Committing Draft for Issuance...');
          res = await fetch('/api/fabric/ebl/commit-draft', {
            method: 'POST',
            body: JSON.stringify({ draftId: testData.drftId })
          });
          json = await res.json();
          if (!json.success) throw new Error(json.error);
          addLog('PHASE 5', 'Draft committed', 'success', json.txId);

          addLog('PHASE 5', 'Issuing Legal e-BL Title...');
          res = await fetch('/api/fabric/ebl/issue', {
            method: 'POST',
            body: JSON.stringify({
              draftId: testData.drftId,
              voyageNumber: 'VOY-UI-456',
              portOfLoading: 'Port of Test',
              portOfDischarge: 'Port of Demo',
              placeOfReceipt: 'Facility A',
              placeOfDelivery: 'Warehouse B',
              freightPayment: 'prepaid',
              blType: 'original',
              shipperName: 'Global Exporters Ltd',
              shipperAddress: '123 Export Lane',
              consigneeName: 'Local Retailers Corp',
              consigneeAddress: '456 Import Street',
              notifyParty: 'Bank of Demo',
              goodsLines: [{ containerNo: 'CONT123', grossWeight: 20000, description: 'Electronics' }],
              freightAmount: 1500,
              freightCurrency: 'USD'
            })
          });
          json = await res.json();
          if (!json.success) throw new Error(json.error);
          addLog('PHASE 5', 'e-BL issued to carrier', 'success', json.txId);

          addLog('PHASE 5', 'Surrendering e-BL for Cargo Release...');
          res = await fetch('/api/fabric/ebl/surrender', {
            method: 'POST',
            body: JSON.stringify({ eblId: testData.eblId })
          });
          json = await res.json();
          if (!json.success) throw new Error(json.error);
          addLog('PHASE 5', 'e-BL surrendered and voided', 'success', json.txId);
          return true;

        case 6: // Credentials
          addLog('PHASE 6', 'Issuing Ship Verifiable Credential...');
          res = await fetch('/api/fabric/credentials/issue', {
            method: 'POST',
            body: JSON.stringify({
              credentialId: testData.credId,
              shortId: 'VC-UI-01',
              entityType: 'ship',
              entityId: testData.imo,
              entityName: 'UI Test Vessel',
              credentialType: 'SOLASCertificate',
              issuingAuthority: 'UI Maritime Auth',
              referenceNumber: 'REF-UI-789',
              certificateHash: 'HASH-UI-999',
              validFrom: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
              verificationBaseURL: 'https://verify.port.demo',
              previousCredentialId: ''
            })
          });
          json = await res.json();
          if (!json.success) throw new Error(json.error);
          addLog('PHASE 6', 'W3C Credential issued on ledger', 'success', json.txId);
          return true;

        default:
          return false;
      }
    } catch (err: any) {
      addLog(`PHASE ${phase}`, `Error: ${err.message}`, 'error');
      toast.error(`Phase ${phase} failed: ${err.message}`);
      return false;
    }
  };

  const runFullFlow = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('SYSTEM', 'Starting Automated Full Workflow Test...', 'info');
    
    // Auto generate IDs if missing
    if (!testData.submissionId) generateIds();

    for (let p = 1; p <= 6; p++) {
      setCurrentPhase(p);
      const success = await runPhase(p);
      if (!success) {
        setIsRunning(false);
        return;
      }
      // Small delay between phases for UI feedback
      await new Promise(r => setTimeout(r, 1000));
    }
    
    setCurrentPhase(7); // Finished
    setIsRunning(false);
    addLog('SYSTEM', '🌟 Full Workflow Test Completed Successfully!', 'success');
    toast.success('Full workflow completed!');
  };

  return (
    <div className="max-w-6xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-display text-white mb-2 tracking-tight">Full Lifecycle Test Dashboard</h1>
          <p className="text-white/60 font-mono text-xs uppercase tracking-[0.2em]">Hyperledger Fabric Smart Contract Validator</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateIds}
            disabled={isRunning}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-[10px] disabled:opacity-50"
          >
            <FaSync className={isRunning ? 'animate-spin' : ''} /> Generate IDs
          </button>
          <button 
            onClick={runFullFlow}
            disabled={isRunning}
            className="px-8 py-3 bg-portaccent font-bold uppercase tracking-[0.2em] text-[10px] text-white rounded-2xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all disabled:opacity-50"
          >
            <FaPlay /> {isRunning ? 'Running Process...' : 'Run All Phases'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Progress Column */}
        <div className="lg:col-span-4 space-y-4">
          <PhaseCard 
            index={1} 
            title="Pre-Arrival & Compliance" 
            icon={FaShip} 
            active={currentPhase === 1} 
            completed={currentPhase > 1} 
          />
          <PhaseCard 
            index={2} 
            title="Regulatory Approval" 
            icon={FaGavel} 
            active={currentPhase === 2} 
            completed={currentPhase > 2} 
          />
          <PhaseCard 
            index={3} 
            title="Port Services" 
            icon={FaAnchor} 
            active={currentPhase === 3} 
            completed={currentPhase > 3} 
          />
          <PhaseCard 
            index={4} 
            title="Financial Settlement" 
            icon={FaFileInvoiceDollar} 
            active={currentPhase === 4} 
            completed={currentPhase > 4} 
          />
          <PhaseCard 
            index={5} 
            title="e-BL Lifecycle" 
            icon={FaFileContract} 
            active={currentPhase === 5} 
            completed={currentPhase > 5} 
          />
          <PhaseCard 
            index={6} 
            title="Verifiable Credentials" 
            icon={FaCertificate} 
            active={currentPhase === 6} 
            completed={currentPhase > 6} 
          />
        </div>

        {/* Logs Column */}
        <div className="lg:col-span-8">
          <div className="bg-[#0a0f1a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl h-[600px] flex flex-col">
            <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                <FaTerminal className="text-emerald-500" /> Blockchain Event Log
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-3 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20">
                  <FaSync className="text-4xl mb-4 animate-pulse" />
                  <p className="uppercase tracking-[0.2em] text-[10px]">Awaiting Transaction Command...</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`p-4 rounded-xl border animate-in fade-in slide-in-from-left-4 duration-300 ${
                    log.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                    log.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    'bg-white/5 border-white/10 text-white/80'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold opacity-50">[{log.timestamp}] {log.phase}</span>
                      {log.txId && (
                        <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full opacity-60">
                          {log.txId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-start gap-2">
                      {log.type === 'success' && <FaCheckCircle className="mt-1 flex-shrink-0" />}
                      {log.type === 'error' && <FaExclamationCircle className="mt-1 flex-shrink-0" />}
                      <p>{log.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhaseCard({ index, title, icon: Icon, active, completed }: any) {
  return (
    <div className={`p-5 rounded-2xl border transition-all duration-500 flex items-center gap-4 ${
      active ? 'bg-portaccent/10 border-portaccent shadow-[0_0_15px_rgba(56,189,248,0.1)]' :
      completed ? 'bg-emerald-500/10 border-emerald-500/30' :
      'bg-white/5 border-white/5 opacity-40'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
        active ? 'bg-portaccent text-white animate-pulse' :
        completed ? 'bg-emerald-500 text-white' :
        'bg-white/10 text-white/50'
      }`}>
        {completed ? <FaCheckCircle /> : <Icon />}
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Phase 0{index}</p>
        <p className={`font-display text-sm ${active || completed ? 'text-white' : 'text-white/40'}`}>{title}</p>
      </div>
      {active && (
        <div className="ml-auto w-2 h-2 rounded-full bg-portaccent animate-ping" />
      )}
    </div>
  );
}
