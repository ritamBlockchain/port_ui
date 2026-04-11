// lib/types/portchain.ts

export type Role =
  | 'shippingagent' | 'customs' | 'portauthority' | 'immigration'
  | 'portHealth' | 'admin' | 'registrar' | 'carrier'
  | 'shipper' | 'consignee' | 'banktrade' | 'serviceprovider' | 'verifier';

export type PortServiceType =
  | 'pilotage' | 'tug' | 'mooring' | 'stevedoring' | 'waste_disposal' | 'bunkering';

export interface CargoItem {
  containerNo: string;
  hsCode: string;
  unCode: string;
  description: string;
  weight: number;
  countryOfOrigin: string;
}

export interface CrewMember {
  name: string;
  passportNo: string;
  rank: string;
}

export interface Approval {
  agency: string;
  approved: boolean;
  timestamp: string;
  comments: string;
}

export interface PreArrivalSubmission {
  submissionId: string;
  vesselIMO: string;
  vesselName: string;
  callSign: string;
  flag: string;
  etaTimestamp: string;
  portCallPurpose: 'loading' | 'discharging' | 'both';
  status: 'pending' | 'compliant' | 'flagged' | 'approved' | 'held' | 'Submitted';
  complianceNotes: string;
  approvals: Approval[];
  cargoManifest?: CargoItem[];
  crewList?: CrewMember[];
  submittedAt: string;
  submittedBy: string;
}

export interface BerthAssignment {
  assignmentId: string;
  submissionId: string;
  vesselIMO: string;
  berthId: string;
  isOverride: boolean;
  assignedBy: string;
  assignedAt: string;
}

export interface PortServiceRequest {
  requestId: string;
  submissionId: string;
  vesselIMO: string;
  serviceType: PortServiceType;
  requestedAt: string;
  requestedBy: string;
  notes: string;
  status: string;
}

export interface ServiceDispute {
  disputedBy: string;
  disputedAt: string;
  reason: string;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface PortServiceLog {
  logId: string;
  requestId?: string;
  submissionId: string;
  vesselIMO: string;
  assignmentId: string;
  serviceType: PortServiceType;
  providerName: string;
  providerId: string;
  status: 'requested' | 'started' | 'completed' | 'disputed' | 'resolved' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  durationMins?: number;
  quantityUnit?: string;
  quantity?: number;
  remarks?: string;
  disputeDetails?: ServiceDispute;
  invoiceId?: string;
  loggedAt: string;
  updatedAt: string;
}

export interface InvoiceLine {
  logId: string;
  serviceType: PortServiceType;
  description: string;
  quantity: number;
  unit: string;
  unitRate: number;
  discount: number;
  lineTotal: number;
}

export interface InvoiceDispute {
  disputedBy: string;
  disputedAt: string;
  reason: string;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface ServiceInvoice {
  invoiceId: string;
  submissionId: string;
  vesselIMO: string;
  assignmentId: string;
  logIds: string[];
  lineItems: InvoiceLine[];
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  issuedTo: string;
  issuedBy: string;
  status: 'draft' | 'issued' | 'paid' | 'disputed' | 'overdue' | 'resolved';
  dueDate: string;
  paidAt?: string;
  penaltyAmount?: number;
  blockchainRef: string;
  disputeDetails?: InvoiceDispute;
  issuedAt: string;
  updatedAt: string;
}

export interface EBLTransfer {
  from: string;
  to: string;
  timestamp: string;
  txId: string;
  notes: string;
}

export interface EBLAmendment {
  amendmentId: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  amendedBy: string;
  amendedAt: string;
}

export interface EBL {
  eblId: string;
  blNumber: string;
  submissionId: string;
  vesselIMO: string;
  vesselName: string;
  voyageNumber: string;
  portOfLoading: string;
  portOfDischarge: string;
  placeOfReceipt: string;
  placeOfDelivery: string;
  freightPayment: 'prepaid' | 'collect';
  blType: 'original' | 'seawaybill' | 'telex';
  status: 'draft' | 'issued' | 'transferred' | 'surrendered' | 'void';
  currentHolder: string;
  transferHistory: EBLTransfer[];
  amendments: EBLAmendment[];
  issuedBy: string;
  issuedAt: string;
  surrenderedAt?: string;
  updatedAt: string;
}

export interface DraftRevision {
  version: number;
  snapshot: string;
  revisedBy: string;
  revisedAt: string;
  notes: string;
}

export interface DraftEBL {
  draftId: string;
  eblId: string;
  blNumber: string;
  submissionId: string;
  status: 'draft' | 'committed' | 'issued' | 'rejected';
  version: number;
  revisions: DraftRevision[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CredentialEntityType = 'ship' | 'company';

export type CredentialType =
  | 'IMOCertificate' | 'SafetyManagementCertificate' | 'InsuranceCertificate'
  | 'LoadLineCertificate' | 'MARPOLCertificate' | 'SOLASCertificate'
  | 'BusinessLicense' | 'TaxRegistration' | 'ISMCodeDocument' | 'ISOCertificate';

export interface VerifiableCredential {
  '@context': string[];
  type: string[];
  id: string;
  shortId: string;
  entityType: CredentialEntityType;
  entityId: string;
  entityName: string;
  credentialType: CredentialType;
  issuingAuthority?: string;
  referenceNumber?: string;
  certificateHash: string;
  hashAlgorithm: string;
  qrPayload: string;
  verificationURL: string;
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'revoked' | 'expired' | 'superseded';
  previousCredentialId?: string;
  supersededBy?: string;
  revokedAt?: string;
  revocationReason?: string;
  revokedBy?: string;
  issuedBy: string;
  updatedAt: string;
}

export interface MerkleLeaf {
  leafId: string;
  docType: string;
  docId: string;
  contentHash: string;
  txId: string;
  anchored: boolean;
  createdAt: string;
}

export interface MerkleRootRecord {
  rootId: string;
  merkleRoot: string;
  polygonTxHash: string;
  leafIds: string[];
  leafCount: number;
  anchoredAt: string;
  anchoredBy: string;
}

// API Response wrapper
export interface FabricResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  txId?: string;
}
