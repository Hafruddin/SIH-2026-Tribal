import {
  UIDAIAdapter,
  STCertificateAdapter,
  IncomeVerificationAdapter,
  AcademicVerificationAdapter,
  DigiLockerAdapter,
  VerificationResponse,
} from '../adapters';

export class UnifiedVerificationEngine {
  static async verifyAadhaar(aadhaarNo: string, otp: string): Promise<VerificationResponse> {
    return await UIDAIAdapter.verifyAadhaarOtp(aadhaarNo, otp);
  }

  static async verifySTCredentials(stCertNo: string, state: string): Promise<VerificationResponse> {
    return await STCertificateAdapter.verifySTCertificate(stCertNo, state);
  }

  static async verifyIncomeCredentials(incomeCertNo: string, amount: number): Promise<VerificationResponse> {
    return await IncomeVerificationAdapter.verifyIncomeCertificate(incomeCertNo, amount);
  }

  static async verifyAcademicCredentials(instCode: string, studentName: string, course: string): Promise<VerificationResponse> {
    return await AcademicVerificationAdapter.verifyInstitutionAndStudent(instCode, studentName, course);
  }

  static async importFromDigiLocker(studentOtr: string, docUri: string, studentId: string): Promise<VerificationResponse> {
    return await DigiLockerAdapter.importDocument(docUri, studentId);
  }
}
