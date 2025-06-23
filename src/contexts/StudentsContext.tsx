import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Student, Department, Year } from '@/lib/types';
import { DEPARTMENTS, YEARS } from '@/lib/constants';
import { getStudentData } from '@/lib/data-pipeline/api';

interface StudentsContextType {
  students: Student[];
  filteredStudents: Student[];
  shortlistedStudents: Student[];
  showOnlyShortlisted: boolean;
  activeDept: Department | 'All';
  activeYear: Year | 'All';
  jobDescription: string;
  setStudents: (students: Student[]) => void;
  setActiveDept: (dept: Department | 'All') => void;
  setActiveYear: (year: Year | 'All') => void;
  setShowOnlyShortlisted: (show: boolean) => void;
  setJobDescription: (desc: string) => void;
  setShortlistedStudents: (students: Student[]) => void;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export const StudentsProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeDept, setActiveDept] = useState<Department | 'All'>('All');
  const [activeYear, setActiveYear] = useState<Year | 'All'>('All');
  const [showOnlyShortlisted, setShowOnlyShortlisted] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [shortlistedStudents, setShortlistedStudents] = useState<Student[]>([]);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const data = await getStudentData();
        if (data && Array.isArray(data)) {
          setStudents(data);
        }
      } catch (error) {
        console.error('Failed to fetch students data:', error);
      }
    }
    fetchStudents();
  }, []);

  // Filter students by department and year
  const filteredStudents = students.filter(student => {
    const deptMatch = activeDept === 'All' || student.department === activeDept;
    const yearMatch = activeYear === 'All' || student.year === activeYear;
    return deptMatch && yearMatch;
  });

  return (
    <StudentsContext.Provider
      value={{
        students,
        filteredStudents,
        shortlistedStudents,
        showOnlyShortlisted,
        activeDept,
        activeYear,
        jobDescription,
        setStudents,
        setActiveDept,
        setActiveYear,
        setShowOnlyShortlisted,
        setJobDescription,
        setShortlistedStudents,
      }}
    >
      {children}
    </StudentsContext.Provider>
  );
};

export const useStudents = (): StudentsContextType => {
  const context = useContext(StudentsContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
};
