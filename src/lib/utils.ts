import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getCGPAColor(cgpa: number): string {
  if (cgpa >= 9.0) return 'text-emerald-500';
  if (cgpa >= 8.0) return 'text-blue-500';
  if (cgpa >= 7.0) return 'text-amber-500';
  return 'text-red-500';
}

export function getYearFromRollNo(rollNo: string): string {
  const year = rollNo.match(/\d{2}/)?.[0];
  if (!year) return '';
  const currentYear = new Date().getFullYear() % 100;
  const yearDiff = currentYear - parseInt(year);
  switch (yearDiff) {
    case 0: return 'FY';
    case 1: return 'SY';
    case 2: return 'TY';
    case 3: return 'Fourth Year';
    default: return '';
  }
}

export function getDepartmentColor(department: string): string {
  switch (department) {
    case 'CS':
      return 'bg-blue-500/10 text-blue-500';
    case 'IT':
      return 'bg-emerald-500/10 text-emerald-500';
    case 'Mechanical':
      return 'bg-orange-500/10 text-orange-500';
    case 'ENTC':
      return 'bg-purple-500/10 text-purple-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
}

export function searchStudents(students: any[], query: string): any[] {
  if (!query) return students;
  
  const searchTerm = query.toLowerCase();
  return students.filter(student => {
    return (
      student.name.toLowerCase().includes(searchTerm) ||
      student.rollNo.toLowerCase().includes(searchTerm) ||
      student.department.toLowerCase().includes(searchTerm) ||
      student.skills.some((skill: string) => 
        skill.toLowerCase().includes(searchTerm)
      ) ||
      student.certifications.some((cert: any) =>
        cert.name.toLowerCase().includes(searchTerm) ||
        cert.provider.toLowerCase().includes(searchTerm)
      )
    );
  });
}

export function validateExcelFile(file: File): boolean {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  return validTypes.includes(file.type);
}

export function generateMockConflicts(total: number): {
  duplicates: number;
  unmatched: number;
  invalid: number;
} {
  return {
    duplicates: Math.floor(Math.random() * (total * 0.1)),
    unmatched: Math.floor(Math.random() * (total * 0.05)),
    invalid: Math.floor(Math.random() * (total * 0.03))
  };
}