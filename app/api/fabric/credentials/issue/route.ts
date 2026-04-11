import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      shortId,
      entityType,
      entityId,
      entityName,
      credentialType,
      issuingAuthority = 'Port Registrar',
      referenceNumber = `REF-${Date.now()}`,
      certificateHash = '0x' + Math.random().toString(16).substring(2),
      validFrom = new Date().toISOString(),
      expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      verificationBaseURL = 'http://localhost:3000/verify',
      previousCredentialId = 'none'
    } = body;

    // Auto-generate credentialId
    const credentialId = `CRED_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    console.log(`[API] Issuing Credential ${credentialId} for ${entityName}`);

    // Contract: IssueCredential(ctx, credentialId, shortId, entityTypeStr, entityId, entityName,
    //   credentialTypeStr, issuingAuthority, referenceNumber, certificateHash, 
    //   validFromISO, expiresAtISO, verificationBaseURL, previousCredentialId)
    const params = [
      credentialId.toString(),
      shortId.toString(),
      entityType.toString(),
      entityId.toString(),
      entityName.toString(),
      credentialType.toString(),
      issuingAuthority.toString(),
      referenceNumber.toString(),
      certificateHash.toString(),
      validFrom.toString(),
      expiresAt.toString(),
      verificationBaseURL.toString(),
      previousCredentialId.toString()
    ];

    const result = await submitTransaction('IssueCredential', ...params);

    return NextResponse.json({
      success: true,
      data: {
        credentialId,
        shortId,
        txId: result.toString()
      },
      message: 'Verifiable Credential issued successfully'
    });
  } catch (error: any) {
    console.error('Issue Credential Failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to issue credential'
    }, { status: 500 });
  }
}
