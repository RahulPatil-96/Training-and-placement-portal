export const DEPARTMENTS = ['All', 'CS', 'IT', 'CSBS', 'ENTC', 'Electrical', 'A&R', 'Mechanical'] as const;
export type Department = typeof DEPARTMENTS[number];

export const YEARS = ['FY', 'SY', 'TY', 'Fourth Year'] as const;
export type Year = typeof YEARS[number];

export const SKILLS = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  // Web Development
  'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 'HTML', 'CSS',
  // Mobile Development
  'React Native', 'Flutter', 'iOS', 'Android', 'Kotlin',
  // Database
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
  // AI/ML
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP',
  // Mechanical
  'AutoCAD', 'SolidWorks', 'CATIA', 'MATLAB', 'Thermodynamics',
  // Electronics
  'Circuit Design', 'PCB Layout', 'Embedded Systems', 'VHDL', 'Arduino',
  // Soft Skills
  'Communication', 'Leadership', 'Problem Solving', 'Team Work', 'Time Management'
] as const;

export const CERTIFICATION_PROVIDERS = [
  'Coursera', 'Udemy', 'edX', 'LinkedIn Learning', 'Microsoft',
  'Google', 'AWS', 'Cisco', 'Oracle', 'IBM', 'NPTEL', 'Swayam'
] as const;

export const TEST_TYPES = [
  'GATE', 'GRE', 'TOEFL', 'IELTS', 'CAT', 'GMAT', 'Aptitude Test',
  'Coding Challenge', 'HackerRank Assessment', 'TCS CodeVita',
  'Microsoft Certification Exam', 'AWS Certification Exam'
] as const;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const PLACEMENT_STATUS_LABELS = {
  not_eligible: 'Not Eligible',
  eligible: 'Eligible',
  placed: 'Placed',
  multiple_offers: 'Multiple Offers',
  declined_offer: 'Declined Offer',
  blacklisted: 'Blacklisted'
} as const;

export const PLACEMENT_STATUS_COLORS = {
  not_eligible: 'bg-gray-500/10 text-gray-500',
  eligible: 'bg-blue-500/10 text-blue-500',
  placed: 'bg-emerald-500/10 text-emerald-500',
  multiple_offers: 'bg-purple-500/10 text-purple-500',
  declined_offer: 'bg-amber-500/10 text-amber-500',
  blacklisted: 'bg-red-500/10 text-red-500'
} as const;

export const EXCEL_VALIDATION_RULES = {
  rollNo: {
    pattern: /^[A-Z]{2}\d{3}$/,
    message: 'Roll number must be in format: XX000'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  },
  phone: {
    pattern: /^\d{10}$/,
    message: 'Phone number must be 10 digits'
  },
  cgpa: {
    min: 0,
    max: 10,
    message: 'CGPA must be between 0 and 10'
  }
} as const;

export const ANALYTICS_TIME_RANGES = [
  'Last 7 Days',
  'Last 30 Days',
  'Last 3 Months',
  'Last 6 Months',
  'Last Year',
  'All Time'
] as const;

export const CHART_COLORS = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))',
  tertiary: 'hsl(var(--chart-3))',
  quaternary: 'hsl(var(--chart-4))',
  quinary: 'hsl(var(--chart-5))'
} as const;