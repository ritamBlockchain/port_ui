/**
 * lib/fabric/mock-data.ts
 * Provides realistic fallback data for the PortChain dashboard when Hyperledger Fabric is unavailable.
 */

export const MOCK_SUBMISSIONS = [
  { submissionId: 'PA-8821', vesselName: 'MAERSK ADRIATIC', vesselIMO: 'IMO9123456', etaTimestamp: '2026-05-12T10:00:00Z', status: 'approved', portCallPurpose: 'Discharge', vesselType: 'Container' },
  { submissionId: 'PA-8822', vesselName: 'EVER GIVEN', vesselIMO: 'IMO9876543', etaTimestamp: '2026-05-14T14:30:00Z', status: 'pending', portCallPurpose: 'Bunkering', vesselType: 'Carrier' },
  { submissionId: 'PA-8823', vesselName: 'OCEAN GRACE', vesselIMO: 'IMO9345678', etaTimestamp: '2026-05-15T08:00:00Z', status: 'Review', portCallPurpose: 'Maintenance', vesselType: 'Bulk' },
  { submissionId: 'PA-8824', vesselName: 'PACIFIC WAVE', vesselIMO: 'IMO9555666', etaTimestamp: '2026-05-18T18:00:00Z', status: 'compliant', portCallPurpose: 'Loading', vesselType: 'Tanker' },
];

export const MOCK_EBLS = [
  { eblId: 'EBL-9001', id: 'EBL-9001', shipper: 'Global Logistics Inc', consignee: 'Maritime Retailers Ltd', status: 'Issued', date: '2026-04-28', vesselName: 'MAERSK ADRIATIC' },
  { eblId: 'EBL-9002', id: 'EBL-9002', shipper: 'Pacific Exports', consignee: 'Harbor Imports Co', status: 'Draft', date: '2026-04-29', vesselName: 'EVER GIVEN' },
];

export const MOCK_EBL_DRAFTS = [
  { eblId: 'DRAFT-001', id: 'DRAFT-001', shipper: 'Standard Freight', consignee: 'Local Port Ops', status: 'Draft', date: '2026-04-30', vesselName: 'OCEAN GRACE' },
];

export const MOCK_SERVICES = [
  { requestId: 'SVC-101', id: 'SVC-101', serviceType: 'Pilotage', provider: 'Port Authority Pilots', status: 'completed', vessel: 'MAERSK ADRIATIC', loggedAt: '2026-04-29T08:00:00Z' },
  { requestId: 'SVC-102', id: 'SVC-102', serviceType: 'Tugboat', provider: 'Tug & Tow Services', status: 'started', vessel: 'EVER GIVEN', loggedAt: '2026-04-29T09:15:00Z' },
];

export const MOCK_INVOICES = [
  { invoiceId: 'INV-7701', id: 'INV-7701', status: 'issued', totalAmount: 12500, currency: 'USD', dueDate: '2026-05-15T00:00:00Z' },
  { invoiceId: 'INV-7702', id: 'INV-7702', status: 'pending', totalAmount: 8400, currency: 'USD', dueDate: '2026-05-20T00:00:00Z' },
];

export const MOCK_CREDENTIALS = [
  { id: 'DID:PORT:001', entityName: 'Admin Registrar', credentialType: 'IMO-Verification', entityId: 'REG-X901', issuedAt: '2026-01-10T12:00:00Z' },
  { id: 'DID:PORT:002', entityName: 'Maersk Line', credentialType: 'Carrier-Auth', entityId: 'MAERSK-001', issuedAt: '2026-02-15T09:30:00Z' },
];

export const MOCK_MERKLE = {
  unanchored: 12,
  total: 450,
  lastRoot: '0x7f8e...9a2b'
};

export const MOCK_UNANCHORED = [
  { id: 'TX-1001', type: 'Pre-Arrival', hash: '0xabc...def', timestamp: '2026-04-29T10:00:00Z' },
  { id: 'TX-1002', type: 'Service Log', hash: '0x789...ghi', timestamp: '2026-04-29T10:15:00Z' },
];

export const MOCK_LEAVES = [
  { id: 'L-1', contentHash: '0x7f8e...9a2b', createdAt: '2026-04-29T08:00:00Z' },
  { id: 'L-2', contentHash: '0x5d4c...3e1f', createdAt: '2026-04-29T08:30:00Z' },
  { id: 'L-3', contentHash: '0x9a8b...7c6d', createdAt: '2026-04-29T09:00:00Z' },
];
