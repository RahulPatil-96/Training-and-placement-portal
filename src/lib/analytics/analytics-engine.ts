import { Student, AnalyticsSummary, PlacementTrend, DepartmentStats, SkillStat, CompanyOffer, YearComparison } from '@/lib/types';
import { DEPARTMENTS, SKILLS } from '@/lib/constants';

export interface AnalyticsConfig {
  refreshInterval: number;
  cacheTimeout: number;
  enableRealTimeUpdates: boolean;
}

export interface AnalyticsMetrics {
  totalStudents: number;
  eligibleStudents: number;
  placedStudents: number;
  averagePackage: number;
  highestPackage: number;
  placementRate: number;
  departmentWiseStats: DepartmentStats[];
  skillsDistribution: SkillStat[];
  yearWiseDistribution: Record<string, number>;
  cgpaDistribution: Record<string, number>;
  lastUpdated: string;
}

export class AnalyticsEngine {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private config: AnalyticsConfig;
  private subscribers: Set<(metrics: AnalyticsMetrics) => void> = new Set();

  constructor(config: AnalyticsConfig = {
    refreshInterval: 30000, // 30 seconds
    cacheTimeout: 300000,  // 5 minutes
    enableRealTimeUpdates: true
  }) {
    this.config = config;
  }

  async calculateMetrics(students: Student[]): Promise<AnalyticsMetrics> {
    const cacheKey = 'analytics-metrics';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
      return cached.data;
    }

    const metrics = await this.computeMetrics(students);
    
    this.cache.set(cacheKey, {
      data: metrics,
      timestamp: Date.now()
    });

    // Notify subscribers of updates
    if (this.config.enableRealTimeUpdates) {
      this.notifySubscribers(metrics);
    }

    return metrics;
  }

  private async computeMetrics(students: Student[]): Promise<AnalyticsMetrics> {
    const startTime = performance.now();

    // Basic counts
    const totalStudents = students.length;
    const eligibleStudents = students.filter(s => s.isEligibleForPlacements).length;
    const placedStudents = students.filter(s => s.placementStatus === 'placed' || s.placementStatus === 'multiple_offers').length;
    const placementRate = eligibleStudents > 0 ? (placedStudents / eligibleStudents) * 100 : 0;

    // Package calculations (mock data for now)
    const packages = students
      .filter(s => s.placementStatus === 'placed' || s.placementStatus === 'multiple_offers')
      .map(() => 5 + Math.random() * 10); // Mock package data

    const averagePackage = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;
    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;

    // Department-wise statistics
    const departmentWiseStats = await this.calculateDepartmentStats(students);

    // Skills distribution
    const skillsDistribution = await this.calculateSkillsDistribution(students);

    // Year-wise distribution
    const yearWiseDistribution = this.calculateYearDistribution(students);

    // CGPA distribution
    const cgpaDistribution = this.calculateCGPADistribution(students);

    const endTime = performance.now();
    console.log(`Analytics calculation took ${endTime - startTime} milliseconds`);

    return {
      totalStudents,
      eligibleStudents,
      placedStudents,
      averagePackage,
      highestPackage,
      placementRate,
      departmentWiseStats,
      skillsDistribution,
      yearWiseDistribution,
      cgpaDistribution,
      lastUpdated: new Date().toISOString()
    };
  }

  private async calculateDepartmentStats(students: Student[]): Promise<DepartmentStats[]> {
    const departmentStats: DepartmentStats[] = [];

    for (const department of DEPARTMENTS.filter(d => d !== 'All')) {
      const deptStudents = students.filter(s => s.department === department);
      const eligibleStudents = deptStudents.filter(s => s.isEligibleForPlacements);
      const placedStudents = deptStudents.filter(s => 
        s.placementStatus === 'placed' || s.placementStatus === 'multiple_offers'
      );

      // Calculate average package (mock data)
      const avgPackage = 5 + Math.random() * 5;

      // Get top skills for this department
      const skillCounts = new Map<string, number>();
      deptStudents.forEach(student => {
        student.skills.forEach(skill => {
          skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
        });
      });

      const topSkills = Array.from(skillCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill, count]) => ({
          skill,
          count,
          demandScore: 70 + Math.random() * 30,
          averagePackage: avgPackage + (Math.random() - 0.5) * 2,
          trend: Math.random() > 0.5 ? 'increasing' as const : 'decreasing' as const
        }));

      departmentStats.push({
        department,
        totalStudents: deptStudents.length,
        eligibleStudents: eligibleStudents.length,
        placedStudents: placedStudents.length,
        averagePackage: avgPackage,
        topSkills
      });
    }

    return departmentStats;
  }

  private async calculateSkillsDistribution(students: Student[]): Promise<SkillStat[]> {
    const skillCounts = new Map<string, number>();
    
    students.forEach(student => {
      student.skills.forEach(skill => {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      });
    });

    return Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([skill, count]) => ({
        skill,
        count,
        demandScore: 60 + Math.random() * 40,
        averagePackage: 5 + Math.random() * 5,
        trend: Math.random() > 0.5 ? 'increasing' as const : 'decreasing' as const
      }));
  }

  private calculateYearDistribution(students: Student[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    students.forEach(student => {
      distribution[student.year] = (distribution[student.year] || 0) + 1;
    });

    return distribution;
  }

  private calculateCGPADistribution(students: Student[]): Record<string, number> {
    const ranges = {
      '9.0-10.0': 0,
      '8.0-8.9': 0,
      '7.0-7.9': 0,
      '6.0-6.9': 0,
      'Below 6.0': 0
    };

    students.forEach(student => {
      const cgpa = student.cgpa;
      if (cgpa >= 9.0) ranges['9.0-10.0']++;
      else if (cgpa >= 8.0) ranges['8.0-8.9']++;
      else if (cgpa >= 7.0) ranges['7.0-7.9']++;
      else if (cgpa >= 6.0) ranges['6.0-6.9']++;
      else ranges['Below 6.0']++;
    });

    return ranges;
  }

  async generateAnalyticsSummary(students: Student[]): Promise<AnalyticsSummary> {
    const metrics = await this.calculateMetrics(students);
    
    // Generate placement trends (mock data)
    const placementTrends: PlacementTrend[] = [
      { month: 'Jan', placed: 12, offers: 15, averagePackage: 5.2 },
      { month: 'Feb', placed: 15, offers: 18, averagePackage: 5.5 },
      { month: 'Mar', placed: 8, offers: 10, averagePackage: 6.0 },
      { month: 'Apr', placed: 22, offers: 25, averagePackage: 5.8 },
      { month: 'May', placed: 28, offers: 32, averagePackage: 6.2 },
      { month: 'Jun', placed: 18, offers: 20, averagePackage: 5.9 }
    ];

    // Generate company offers (mock data)
    const companyWiseOffers: CompanyOffer[] = [
      {
        company: 'TCS',
        offersCount: 45,
        averagePackage: 7.2,
        roles: ['Software Engineer', 'System Engineer'],
        preferredSkills: ['Java', 'Python', 'SQL'],
        acceptanceRate: 85
      },
      {
        company: 'Infosys',
        offersCount: 38,
        averagePackage: 6.8,
        roles: ['Systems Engineer', 'Power Programmer'],
        preferredSkills: ['JavaScript', 'React', 'Node.js'],
        acceptanceRate: 78
      }
    ];

    // Generate year comparison (mock data)
    const currentYear = new Date().getFullYear();
    const yearWiseComparison: YearComparison = {
      currentYear: {
        year: currentYear,
        totalPlacements: metrics.placedStudents,
        averagePackage: metrics.averagePackage,
        companiesVisited: 35,
        highestPackage: metrics.highestPackage
      },
      previousYear: {
        year: currentYear - 1,
        totalPlacements: Math.floor(metrics.placedStudents * 0.85),
        averagePackage: metrics.averagePackage * 0.92,
        companiesVisited: 30,
        highestPackage: metrics.highestPackage * 0.9
      },
      growth: {
        placements: 15,
        package: 8,
        companies: 16.7
      }
    };

    return {
      totalStudents: metrics.totalStudents,
      eligibleForDrive: metrics.eligibleStudents,
      placedStudents: metrics.placedStudents,
      averagePackage: metrics.averagePackage,
      highestPackage: metrics.highestPackage,
      placementTrends,
      departmentWiseStats: metrics.departmentWiseStats,
      skillsDistribution: metrics.skillsDistribution,
      companyWiseOffers,
      yearWiseComparison,
      topSkills: metrics.skillsDistribution.slice(0, 5).map(s => ({ skill: s.skill, count: s.count })),
      departmentDistribution: metrics.departmentWiseStats.map(d => ({ 
        department: d.department, 
        count: d.totalStudents 
      }))
    };
  }

  subscribe(callback: (metrics: AnalyticsMetrics) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(metrics: AnalyticsMetrics): void {
    this.subscribers.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('Error notifying analytics subscriber:', error);
      }
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  async refreshMetrics(students: Student[]): Promise<AnalyticsMetrics> {
    this.clearCache();
    return this.calculateMetrics(students);
  }
}

// Singleton instance
export const analyticsEngine = new AnalyticsEngine();