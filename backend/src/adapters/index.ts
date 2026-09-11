/**
 * Government Systems Integration Adapters (Mock Layer for Demo & Prototyping)
 * Clean integration interfaces enabling future plug-and-play replacement
 * with official live APIs (UIDAI, DigiLocker, NSP, UDISE+, APAAR, AISHE, UGC-NTA, e-District).
 */

export interface VerificationResponse {
  status: 'VERIFIED' | 'PENDING' | 'MISMATCH' | 'NOT_FOUND' | 'MANUAL_REVIEW';
  systemName: string;
  referenceId?: string;
  details: Record<string, any>;
  verifiedAt: string;
  isMock: boolean;
}

// 1. UIDAI Aadhaar Verification Adapter
export class UIDAIAdapter {
  static async verifyAadhaarOtp(aadhaarNumber: string, otp: string): Promise<VerificationResponse> {
    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    const isValid = cleanAadhaar.length === 12 && otp.length === 6;

    return {
      status: isValid ? 'VERIFIED' : 'MISMATCH',
      systemName: 'UIDAI Aadhaar Vault (Mock Demo)',
      referenceId: `UIDAI-OTP-${Date.now()}`,
      details: {
        aadhaarMasked: `XXXX-XXXX-${cleanAadhaar.slice(-4) || '8912'}`,
        nameMatched: true,
        dobMatched: true,
        gender: 'Male',
        mobileLinked: true,
        addressVerified: true,
      },
      verifiedAt: new Date().toISOString(),
      isMock: true,
    };
  }
}

// 2. ST Certificate e-District Verification Adapter
export class STCertificateAdapter {
  static async verifySTCertificate(certNo: string, state: string): Promise<VerificationResponse> {
    const isFound = certNo && certNo.length > 5;
    return {
      status: isFound ? 'VERIFIED' : 'MANUAL_REVIEW',
      systemName: `State e-District Portal - ${state} (Mock Demo)`,
      referenceId: `EDIST-${state}-${certNo}`,
      details: {
        certificateNo: certNo,
        casteCategory: 'Scheduled Tribe (ST)',
        subTribeName: 'Malayali / Gond / Munda',
        issuingAuthority: 'Tahsildar / Sub-Collector Office',
        status: 'Valid & Verified Permanent Certificate',
      },
      verifiedAt: new Date().toISOString(),
      isMock: true,
    };
  }
}

// 3. Income Tax & Revenue Verification Adapter
export class IncomeVerificationAdapter {
  static async verifyIncomeCertificate(certNo: string, reportedIncome: number): Promise<VerificationResponse> {
    return {
      status: 'VERIFIED',
      systemName: 'State Revenue & Income Portal (Mock Demo)',
      referenceId: `REV-INC-${certNo || '2026-8812'}`,
      details: {
        verifiedIncome: reportedIncome,
        financialYear: '2026-2027',
        validity: 'Valid up to 31-Mar-2027',
        incomeCategory: reportedIncome <= 250000 ? 'Low Income (EWS/ST Eligible)' : 'Standard',
      },
      verifiedAt: new Date().toISOString(),
      isMock: true,
    };
  }
}

// 4. UDISE+ / APAAR / AISHE Academic Verification Adapter
export class AcademicVerificationAdapter {
  static async verifyInstitutionAndStudent(
    institutionCode: string,
    studentName: string,
    course: string
  ): Promise<VerificationResponse> {
    return {
      status: 'VERIFIED',
      systemName: 'AISHE / UDISE+ / APAAR Educational Database (Mock Demo)',
      referenceId: `APAAR-${Date.now()}`,
      details: {
        institutionCode,
        institutionName: 'Government Arts & Engineering College',
        accreditation: 'NAAC A+ / UGC Recognized',
        studentEnrolled: true,
        academicYear: '2026-2027',
        apaarId: `9012-3841-7712`,
        currentCourse: course,
      },
      verifiedAt: new Date().toISOString(),
      isMock: true,
    };
  }
}

// 5. DigiLocker Mock Adapter
export interface DigiLockerDoc {
  docType: string;
  name: string;
  issuer: string;
  date: string;
  uri: string;
  verificationStatus: string;
}

export class DigiLockerAdapter {
  static async getAvailableDocuments(studentOtr: string): Promise<DigiLockerDoc[]> {
    return [
      {
        docType: 'ST Certificate',
        name: 'Tribal ST Community Certificate',
        issuer: 'Revenue Dept, Govt of Tamil Nadu / Jharkhand',
        date: '2023-06-12',
        uri: 'in.gov.tn.revenue.stcert.88912',
        verificationStatus: 'VERIFIED',
      },
      {
        docType: 'Income Certificate',
        name: 'Income Certificate FY 2026-27',
        issuer: 'e-District Revenue Officer',
        date: '2026-04-01',
        uri: 'in.gov.edistrict.inc.2026.1102',
        verificationStatus: 'VERIFIED',
      },
      {
        docType: 'Class 10/12 Marksheet',
        name: 'HSC Examination Marksheet',
        issuer: 'State Board of School Education',
        date: '2022-05-20',
        uri: 'in.gov.cbse.marksheet.1092831',
        verificationStatus: 'VERIFIED',
      },
      {
        docType: 'Aadhaar Card',
        name: 'Aadhaar Identity Card',
        issuer: 'UIDAI Govt of India',
        date: '2020-01-10',
        uri: 'in.gov.uidai.aadhaar.8912',
        verificationStatus: 'VERIFIED',
      },
    ];
  }

  static async importDocument(uri: string, studentId: string): Promise<VerificationResponse> {
    return {
      status: 'VERIFIED',
      systemName: 'DigiLocker OAuth Adapter (Mock Demo)',
      referenceId: `DIGILOCKER-IMP-${Date.now()}`,
      details: {
        uri,
        importedAt: new Date().toISOString(),
        digilockerVerified: true,
        digitalSignature: 'Cryptographically Verified by DigiLocker Authority',
      },
      verifiedAt: new Date().toISOString(),
      isMock: true,
    };
  }
}
