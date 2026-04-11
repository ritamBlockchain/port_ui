import { z } from 'zod';

export const imoSchema = z.string()
  .regex(/^IMO\d{7}$/, 'IMO must be in format IMO followed by 7 digits');

export const preArrivalSchema = z.object({
  submissionId: z.string().min(3).max(64),
  vesselIMO: imoSchema,
  vesselName: z.string().min(2).max(100),
  callSign: z.string().min(2).max(10),
  flag: z.string().min(2).max(50),
  etaTimestamp: z.string(),
  portCallPurpose: z.enum(['loading', 'discharging', 'both']),
  cargoManifest: z.array(z.object({
    containerNo: z.string().min(1),
    hsCode: z.string().min(4).max(10),
    unCode: z.string().optional().default(''),
    description: z.string().min(5),
    weight: z.number().positive(),
    countryOfOrigin: z.string().min(2).max(50),
  })).min(1, 'At least one cargo item required'),
  crewList: z.array(z.object({
    name: z.string().min(2),
    passportNo: z.string().min(5),
    rank: z.string().min(2),
  })).min(1, 'At least one crew member required'),
});

export const approveSubmissionSchema = z.object({
  submissionId: z.string().min(3),
  agency: z.string().min(3),
  comments: z.string().min(5),
  approved: z.boolean(),
});

export const draftEBLSchema = z.object({
  draftId: z.string().min(3),
  eblId: z.string().min(3),
  blNumber: z.string().min(3),
  submissionId: z.string().min(3),
  shipperName: z.string().min(3),
  shipperAddress: z.string().min(10),
  consigneeName: z.string().min(3),
  consigneeAddress: z.string().min(10),
  notifyParty: z.string().min(3),
  voyageNumber: z.string().min(2),
  portOfLoading: z.string().min(2),
  portOfDischarge: z.string().min(2),
  placeOfReceipt: z.string().min(2),
  placeOfDelivery: z.string().min(2),
  freightPayment: z.enum(['prepaid', 'collect']),
  blType: z.enum(['original', 'seawaybill', 'telex']),
  freightAmount: z.number().positive(),
  freightCurrency: z.string().length(3),
  goodsLines: z.array(z.object({
    containerNo: z.string().min(1),
    sealNo: z.string().min(1),
    description: z.string().min(5),
    grossWeight: z.number().positive(),
    measurement: z.number().positive(),
    packageCount: z.number().int().positive(),
    packageType: z.string().min(2),
    hsCode: z.string().min(4),
  })).min(1),
});

export const credentialSchema = z.object({
  credentialId: z.string().min(3).max(64),
  shortId: z.string().min(3).max(32),
  entityType: z.enum(['ship', 'company']),
  entityId: z.string().min(3),
  entityName: z.string().min(3),
  credentialType: z.enum([
    'IMOCertificate', 'SafetyManagementCertificate', 'InsuranceCertificate',
    'LoadLineCertificate', 'MARPOLCertificate', 'SOLASCertificate',
    'BusinessLicense', 'TaxRegistration', 'ISMCodeDocument', 'ISOCertificate',
  ]),
  issuingAuthority: z.string().min(3),
  referenceNumber: z.string().min(3),
  certificateHash: z.string().min(64),
  validFromISO: z.string().datetime(),
  expiresAtISO: z.string().datetime(),
  verificationBaseURL: z.string().url(),
  previousCredentialId: z.string().optional().default(''),
});

export const transferEBLSchema = z.object({
  eblId: z.string().min(3),
  toHolder: z.string().min(3),
  notes: z.string().min(5),
});
