import { Department, Year } from './constants';

export type { Department, Year };

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  department: Department;
  year: Year;
  cgpa: number;
  skills: string[];
  certifications: Certification[];
  testScores: TestScore[];
  resumeUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  achievements?: Achievement[];
  internships?: Internship[];
  projects?: Project[];
  attendance?: number;
  backlogCount?: number;
  isEligibleForPlacements?: boolean;
  placementStatus?: PlacementStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  issueDate: string;
  expiryDate?: string;
  score?: number;
  verificationUrl?: string;
  skills?: string[];
  type?: 'technical' | 'soft-skills' | 'language' | 'other';
}

export interface TestScore {
  id: string;
  testName: string;
  score: number;
  maxScore: number;
  date: string;
  category?: 'aptitude' | 'technical' | 'language' | 'other';
  percentile?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'academic' | 'co-curricular' | 'extra-curricular';
  proof?: string;
}

export interface Internship {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  skills: string[];
  certificateUrl?: string;
  type: 'summer' | 'winter' | 'semester';
  isPaid: boolean;
  stipend?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  skills: string[];
  githubUrl?: string;
  liveUrl?: string;
  type: 'academic' | 'personal' | 'internship';
}

export type PlacementStatus = 
  | 'not_eligible'
  | 'eligible'
  | 'placed'
  | 'multiple_offers'
  | 'declined_offer'
  | 'blacklisted';

export interface UploadLog {
  id: string;
  fileName: string;
  uploadDate: string;
  recordsProcessed: number;
  conflicts: {
    duplicates: number;
    unmatched: number;
    invalid: number;
  };
  processedBy?: string;
  status: 'completed' | 'failed' | 'partial';
  errorLogs?: string[];
  affectedStudents?: string[];
  backupUrl?: string;
}

export interface HeaderMapping {
  excelHeader: string;
  systemField: string;
  matched: boolean;
  confidence?: number;
  suggestions?: string[];
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'format' | 'range' | 'enum' | 'unique';
  value?: unknown;
  message: string;
}

export interface AnalyticsSummary {
  totalStudents: number;
  eligibleForDrive: number;
  placedStudents: number;
  averagePackage: number;
  highestPackage: number;
  placementTrends: PlacementTrend[];
  departmentWiseStats: DepartmentStats[];
  skillsDistribution: SkillStat[];
  companyWiseOffers: CompanyOffer[];
  yearWiseComparison: YearComparison;

  topSkills: { skill: string; count: number }[];
  departmentDistribution: { department: string; count: number }[];
}

export interface PlacementTrend {
  month: string;
  placed: number;
  offers: number;
  averagePackage: number;
}

export interface DepartmentStats {
  department: Department;
  totalStudents: number;
  eligibleStudents: number;
  placedStudents: number;
  averagePackage: number;
  topSkills: SkillStat[];
}

export interface SkillStat {
  skill: string;
  count: number;
  demandScore: number;
  averagePackage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface CompanyOffer {
  company: string;
  offersCount: number;
  averagePackage: number;
  roles: string[];
  preferredSkills: string[];
  acceptanceRate: number;
}

export interface YearComparison {
  currentYear: YearStats;
  previousYear: YearStats;
  growth: {
    placements: number;
    package: number;
    companies: number;
  };
}

export interface YearStats {
  year: number;
  totalPlacements: number;
  averagePackage: number;
  companiesVisited: number;
  highestPackage: number;
}
