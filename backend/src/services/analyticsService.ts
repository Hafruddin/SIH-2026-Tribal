import db from '../db/database';

export interface CoverageMetric {
  state: string;
  totalEnrolledSTStudents: number;
  registeredOnOTR: number;
  scholarshipBeneficiaries: number;
  unreachedSTStudents: number;
  coveragePercentage: number;
  pvtgCount: number;
}

export class AnalyticsService {
  static getSTCoverageData(): {
    overallSummary: {
      totalEnrolledSTStudents: number;
      registeredOnOTR: number;
      scholarshipBeneficiaries: number;
      unreachedSTStudents: number;
      nationalCoverageRate: number;
    };
    stateBreakdown: CoverageMetric[];
  } {
    // Mock baseline census & UDISE+ ST student headcount data cross-matched with DB OTR registrations
    const stateHeadcounts = [
      { state: 'Jharkhand', totalST: 145000, pvtg: 18500 },
      { state: 'Odisha', totalST: 168000, pvtg: 22100 },
      { state: 'Madhya Pradesh', totalST: 210000, pvtg: 15400 },
      { state: 'Tamil Nadu', totalST: 45000, pvtg: 8200 },
      { state: 'Chhattisgarh', totalST: 125000, pvtg: 14300 },
      { state: 'Assam', totalST: 98000, pvtg: 4100 },
      { state: 'Maharashtra', totalST: 112000, pvtg: 9500 },
      { state: 'Rajasthan', totalST: 135000, pvtg: 6200 },
    ];

    const stateMetrics: CoverageMetric[] = stateHeadcounts.map(s => {
      // Query DB for actual registrations in this state
      const dbStudents = db.prepare('SELECT COUNT(*) as count FROM students WHERE state = ?').get(s.state) as any;
      const dbBeneficiaries = db.prepare(`
        SELECT COUNT(DISTINCT s.id) as count
        FROM students s
        JOIN applications a ON s.id = a.student_id
        WHERE s.state = ? AND a.current_status IN ('Sanctioned', 'DBT Processing', 'Disbursed')
      `).get(s.state) as any;

      const registered = (dbStudents?.count || 0) * 1250 + Math.floor(s.totalST * 0.62); // Scaled for demo analytics realism
      const beneficiaries = (dbBeneficiaries?.count || 0) * 980 + Math.floor(s.totalST * 0.48);
      const unreached = s.totalST - beneficiaries;
      const coverageRate = Number(((beneficiaries / s.totalST) * 100).toFixed(1));

      return {
        state: s.state,
        totalEnrolledSTStudents: s.totalST,
        registeredOnOTR: registered,
        scholarshipBeneficiaries: beneficiaries,
        unreachedSTStudents: unreached,
        coveragePercentage: coverageRate,
        pvtgCount: s.pvtg,
      };
    });

    const totalEnrolled = stateMetrics.reduce((acc, curr) => acc + curr.totalEnrolledSTStudents, 0);
    const totalOTR = stateMetrics.reduce((acc, curr) => acc + curr.registeredOnOTR, 0);
    const totalBeneficiaries = stateMetrics.reduce((acc, curr) => acc + curr.scholarshipBeneficiaries, 0);
    const totalUnreached = totalEnrolled - totalBeneficiaries;
    const nationalRate = Number(((totalBeneficiaries / totalEnrolled) * 100).toFixed(1));

    return {
      overallSummary: {
        totalEnrolledSTStudents: totalEnrolled,
        registeredOnOTR: totalOTR,
        scholarshipBeneficiaries: totalBeneficiaries,
        unreachedSTStudents: totalUnreached,
        nationalCoverageRate: nationalRate,
      },
      stateBreakdown: stateMetrics,
    };
  }
}
