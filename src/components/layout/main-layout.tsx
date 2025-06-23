import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '../features/file-uploader';
import { StudentTable } from '../features/student-table';
import { Dashboard } from '../features/dashboard';
import { UploadHistory } from '../features/upload-history';
import { HeaderMapping } from '../features/header-mapping';
import { Student } from '@/lib/types';
import { Bell, Moon, Search, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/components/theme-provider';
import { useToast } from '@/components/ui/use-toast';
import { mockStudents } from '@/lib/mock-data';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<string>('students');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [...prev, newStudent]);
    toast({
      title: "Student added",
      description: `${newStudent.name} has been added successfully.`
    });
    setShowAddStudentDialog(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold tracking-tight">Training & Placement Portal</h1>
          <div className="relative w-64">
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="w-6 h-6 cursor-pointer" />
          <Button variant="ghost" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="data-management">Data Management</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="flex flex-col h-full">
            <StudentTable 
              students={students} 
              onAddStudent={() => setShowAddStudentDialog(true)} 
            />
          </TabsContent>

          <TabsContent value="dashboard" className="flex flex-col h-full">
            <Dashboard />
          </TabsContent>

          <TabsContent value="data-management" className="flex flex-col h-full space-y-6">
            <FileUploader />
            <UploadHistory />
            <HeaderMapping />
          </TabsContent>
        </Tabs>
      </main>

      {showAddStudentDialog && (
        <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <AddStudentForm 
              onAddStudent={handleAddStudent} 
              onCancel={() => setShowAddStudentDialog(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

import { Department, Year, DEPARTMENTS, YEARS } from '@/lib/constants';

function AddStudentForm({ onAddStudent, onCancel }: { onAddStudent: (student: Student) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [prn, setPrn] = useState('');
  const [department, setDepartment] = useState<Department | ''>('');
  const [year, setYear] = useState<Year | ''>('');
  const [cgpa, setCgpa] = useState('');
  const [skills, setSkills] = useState('');

  const handleSubmit = () => {
    if (!name || !prn || !department || !year || !cgpa) {
      alert('Please fill all required fields');
      return;
    }
    const newStudent: Student = {
      id: Date.now().toString(),
      name,
      rollNo: prn,
      department,
      year,
      cgpa: parseFloat(cgpa),
      skills: skills.split(',').map(s => s.trim()),
      certifications: [],
      testScores: [],
      resumeUrl: ''
    };
    onAddStudent(newStudent);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <Input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="w-full" 
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">PRN</label>
        <Input 
          type="text" 
          value={prn} 
          onChange={e => setPrn(e.target.value)} 
          className="w-full" 
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Department</label>
        <select
          value={department}
          onChange={e => setDepartment(e.target.value as Department)}
          className="w-full border rounded px-2 py-1 bg-white"
        >
          <option value="">Select department</option>
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Year</label>
        <select
          value={year}
          onChange={e => setYear(e.target.value as Year)}
          className="w-full border rounded px-2 py-1 bg-white"
        >
          <option value="">Select year</option>
          {YEARS.map(yr => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">CGPA</label>
        <Input 
          type="number" 
          step="0.01" 
          value={cgpa} 
          onChange={e => setCgpa(e.target.value)} 
          className="w-full" 
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Skills (comma separated)</label>
        <Input 
          type="text" 
          value={skills} 
          onChange={e => setSkills(e.target.value)} 
          className="w-full" 
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline"
          onClick={onCancel} 
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
        >
          Add Student
        </Button>
      </div>
    </div>
  );
}
