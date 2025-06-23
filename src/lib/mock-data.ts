import { Student, UploadLog, HeaderMapping, AnalyticsSummary, Department, Year } from './types';

// Generate a realistic set of students
export const generateStudents = (count: number): Student[] => {
  const departments: Department[] = ['CS', 'IT', 'CSBS', 'ENTC', 'Electrical', 'A&R', 'Mechanical'];
  const years: Year[] = ['FY', 'SY', 'TY', 'Fourth Year'];
  const skills = [
    'JavaScript', 'React', 'Python', 'Machine Learning', 'Data Analysis',
    'Java', 'C++', 'AWS', 'Docker', 'Kubernetes', 'Node.js', 'MongoDB',
    'SQL', 'Git', 'UI/UX Design', 'CAD', 'MATLAB', 'Simulink', 
    'Circuit Design', 'PCB Layout', 'CNC Programming', 'AutoCAD',
    'SolidWorks', 'Thermodynamics', 'Fluid Mechanics', 'IoT',
    'Embedded Systems', 'Signal Processing', 'Control Systems'
  ];
  
  const certProviders = [
    'Coursera', 'Udemy', 'edX', 'LinkedIn Learning', 'Microsoft', 
    'Google', 'AWS', 'Cisco', 'Oracle', 'IBM', 'NPTEL', 'Swayam'
  ];
  
  const testNames = [
    'GATE', 'GRE', 'TOEFL', 'IELTS', 'CAT', 'GMAT', 'Aptitude Test',
    'Coding Challenge', 'HackerRank Assessment', 'TCS CodeVita',
    'Microsoft Certification Exam', 'AWS Certification Exam'
  ];

  return Array.from({ length: count }, (_, i) => {
    const department = departments[Math.floor(Math.random() * departments.length)];
    const year = years[Math.floor(Math.random() * years.length)];
    
    // Skills that make sense for the department
    let departmentSkills = skills;
    if (department === 'CS' || department === 'IT') {
      departmentSkills = skills.filter(s => 
        !['CAD', 'MATLAB', 'Simulink', 'Circuit Design', 'PCB Layout', 
          'CNC Programming', 'AutoCAD', 'SolidWorks', 'Thermodynamics', 
          'Fluid Mechanics'].includes(s)
      );
    } else if (department === 'Mechanical') {
      departmentSkills = skills.filter(s => 
        !['React', 'Node.js', 'MongoDB', 'UI/UX Design', 'Circuit Design', 
          'PCB Layout', 'Signal Processing'].includes(s)
      );
    } else if (department === 'ENTC') {
      departmentSkills = skills.filter(s => 
        !['React', 'Node.js', 'MongoDB', 'UI/UX Design', 'CNC Programming', 
          'AutoCAD', 'SolidWorks', 'Thermodynamics', 'Fluid Mechanics'].includes(s)
      );
    } else if (department === 'CSBS') {
      departmentSkills = skills.filter(s =>
        ['JavaScript', 'React', 'Python', 'Machine Learning', 'Data Analysis', 'Java', 'C++', 'AWS', 'Docker', 'Kubernetes', 'Node.js', 'MongoDB', 'SQL', 'Git', 'UI/UX Design'].includes(s)
      );
    } else if (department === 'Electrical') {
      departmentSkills = skills.filter(s =>
        ['Circuit Design', 'PCB Layout', 'Embedded Systems', 'Signal Processing', 'Control Systems', 'MATLAB', 'Simulink', 'AutoCAD', 'SolidWorks', 'Thermodynamics', 'Fluid Mechanics'].includes(s)
      );
    } else if (department === 'A&R') {
      departmentSkills = skills.filter(s =>
        ['AutoCAD', 'SolidWorks', 'Thermodynamics', 'Fluid Mechanics', 'CAD', 'MATLAB', 'Simulink'].includes(s)
      );
    }
    
    // Random skills count (2-5)
    const skillCount = 2 + Math.floor(Math.random() * 4);
    const studentSkills = [];
    for (let j = 0; j < skillCount; j++) {
      const randomSkill = departmentSkills[Math.floor(Math.random() * departmentSkills.length)];
      if (!studentSkills.includes(randomSkill)) {
        studentSkills.push(randomSkill);
      }
    }
    
    // Random CGPA (6.0-10.0)
    const cgpa = (6 + Math.random() * 4).toFixed(2);
    
    // Random certifications (1-3)
    const certCount = 1 + Math.floor(Math.random() * 3);
    const certifications = Array.from({ length: certCount }, (_, j) => {
      const issueYear = 2022 + Math.floor(Math.random() * 3);
      const issueMonth = 1 + Math.floor(Math.random() * 12);
      const issueDay = 1 + Math.floor(Math.random() * 28);
      return {
        id: `cert-${i}-${j}`,
        name: `${departmentSkills[Math.floor(Math.random() * departmentSkills.length)]} Certification`,
        provider: certProviders[Math.floor(Math.random() * certProviders.length)],
        issueDate: `${issueYear}-${issueMonth.toString().padStart(2, '0')}-${issueDay.toString().padStart(2, '0')}`,
        score: Math.floor(70 + Math.random() * 31)
      };
    });
    
    // Random test scores (0-2)
    const testCount = Math.floor(Math.random() * 3);
    const testScores = Array.from({ length: testCount }, (_, j) => {
      const testDate = new Date();
      testDate.setMonth(testDate.getMonth() - Math.floor(Math.random() * 12));
      return {
        id: `test-${i}-${j}`,
        testName: testNames[Math.floor(Math.random() * testNames.length)],
        score: Math.floor(70 + Math.random() * 31),
        maxScore: 100,
        date: testDate.toISOString().split('T')[0]
      };
    });
    
    return {
      id: `student-${i}`,
      rollNo: `${department}${year.substring(0, 1)}${(i + 1).toString().padStart(3, '0')}`,
      name: `Student ${i + 1}`,
      department,
      year,
      cgpa: parseFloat(cgpa),
      skills: studentSkills,
      certifications,
      testScores,
      resumeUrl: Math.random() > 0.3 ? '/sample-resume.pdf' : undefined
    };
  });
};

// Mock upload logs
export const mockUploadLogs: UploadLog[] = [
  {
    id: 'upload-1',
    fileName: 'CS_Students_Batch2024.xlsx',
    uploadDate: '2025-03-15T09:30:00Z',
    recordsProcessed: 120,
    conflicts: {
      duplicates: 3,
      unmatched: 2,
      invalid: 1
    },
    status: 'completed'
  },
  {
    id: 'upload-2',
    fileName: 'IT_Department_Data.xlsx',
    uploadDate: '2025-03-12T14:22:00Z',
    recordsProcessed: 98,
    conflicts: {
      duplicates: 0,
      unmatched: 5,
      invalid: 2
    },
    status: 'completed'
  },
  {
    id: 'upload-3',
    fileName: 'Mechanical_Students.xlsx',
    uploadDate: '2025-03-10T11:15:00Z',
    recordsProcessed: 87,
    conflicts: {
      duplicates: 1,
      unmatched: 0,
      invalid: 0
    },
    status: 'completed'
  }
];

// Mock header mappings for Excel import
export const mockHeaderMappings: HeaderMapping[] = [
  { excelHeader: 'Roll Number', systemField: 'rollNo', matched: true },
  { excelHeader: 'Student Name', systemField: 'name', matched: true },
  { excelHeader: 'Department', systemField: 'department', matched: true },
  { excelHeader: 'Year of Study', systemField: 'year', matched: true },
  { excelHeader: 'CGPA', systemField: 'cgpa', matched: true },
  { excelHeader: 'Technical Skills', systemField: 'skills', matched: true },
  { excelHeader: 'Course Completed', systemField: '', matched: false },
  { excelHeader: 'Grade Obtained', systemField: '', matched: false },
  { excelHeader: 'Email ID', systemField: 'email', matched: true },
  { excelHeader: 'Contact Number', systemField: 'contactNumber', matched: true },
  { excelHeader: 'Resume Link', systemField: 'resumeUrl', matched: true }
];

// Mock analytics data
export const mockAnalytics: AnalyticsSummary = {
  totalStudents: 450,
  eligibleForDrive: 320,
  placedStudents: 210,
  topSkills: [
    { skill: 'Python', count: 120 },
    { skill: 'Java', count: 98 },
    { skill: 'React', count: 85 },
    { skill: 'Machine Learning', count: 75 },
    { skill: 'SQL', count: 68 }
  ],
  departmentDistribution: [
    { department: 'CS', count: 145 },
    { department: 'IT', count: 130 },
    { department: 'ENTC', count: 98 },
    { department: 'Mechanical', count: 77 }
  ]
};

// Generate 100 students
export const mockStudents = generateStudents(10);