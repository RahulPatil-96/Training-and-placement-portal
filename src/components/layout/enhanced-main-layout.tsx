import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '../features/file-uploader';
import { StudentTable } from '../features/student-table';
import { Dashboard } from '../features/dashboard';
import { UploadHistory } from '../features/upload-history';
import { HeaderMapping } from '../features/header-mapping';
import { Student } from '@/lib/types';
import { 
  Bell, 
  Moon, 
  Search, 
  Sun, 
  Menu, 
  X, 
  Users, 
  BarChart3, 
  Database,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/components/theme-provider';
import { useToast } from '@/components/ui/use-toast';
import { mockStudents } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navigationItems = [
  {
    id: 'students',
    label: 'Students',
    icon: Users,
    description: 'Manage student records and profiles'
  },
  {
    id: 'dashboard',
    label: 'Analytics',
    icon: BarChart3,
    description: 'View placement statistics and insights'
  },
  {
    id: 'data-management',
    label: 'Data Management',
    icon: Database,
    description: 'Upload and manage student data'
  }
];

export function EnhancedMainLayout() {
  const [activeTab, setActiveTab] = useState<string>('students');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [...prev, newStudent]);
    toast({
      title: "Student added successfully",
      description: `${newStudent.name} has been added to the system.`,
      variant: "default"
    });
    setShowAddStudentDialog(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%',
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Close Button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">T&P Portal</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Training & Placement</p>
              </div>
            </div>
            <EnhancedButton
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </EnhancedButton>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">AD</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">Admin User</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">admin@college.edu</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <EnhancedButton variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </EnhancedButton>
              <EnhancedButton variant="ghost" size="sm" className="w-full justify-start">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </EnhancedButton>
              <EnhancedButton variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </EnhancedButton>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <EnhancedButton
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </EnhancedButton>
              
              <div className="hidden sm:block">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {navigationItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {navigationItems.find(item => item.id === activeTab)?.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block w-80">
                <EnhancedInput
                  placeholder="Search students, departments..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <EnhancedButton variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </EnhancedButton>
              </div>

              {/* Theme Toggle */}
              <EnhancedButton
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </EnhancedButton>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTab === 'students' && (
              <StudentTable 
                students={students} 
                onAddStudent={() => setShowAddStudentDialog(true)} 
              />
            )}

            {activeTab === 'dashboard' && <Dashboard />}

            {activeTab === 'data-management' && (
              <div className="space-y-8">
                <FileUploader />
                <UploadHistory />
                <HeaderMapping />
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Add Student Dialog */}
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

// Enhanced Add Student Form Component
import { Department, Year, DEPARTMENTS, YEARS } from '@/lib/constants';

function AddStudentForm({ onAddStudent, onCancel }: { 
  onAddStudent: (student: Student) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: '',
    prn: '',
    department: '' as Department | '',
    year: '' as Year | '',
    cgpa: '',
    skills: '',
    email: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.prn.trim()) newErrors.prn = 'PRN is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.cgpa) newErrors.cgpa = 'CGPA is required';
    else if (isNaN(Number(formData.cgpa)) || Number(formData.cgpa) < 0 || Number(formData.cgpa) > 10) {
      newErrors.cgpa = 'CGPA must be between 0 and 10';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newStudent: Student = {
      id: Date.now().toString(),
      name: formData.name,
      rollNo: formData.prn,
      department: formData.department as Department,
      year: formData.year as Year,
      cgpa: parseFloat(formData.cgpa),
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      certifications: [],
      testScores: [],
      email: formData.email,
      phone: formData.phone
    };
    
    onAddStudent(newStudent);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <EnhancedInput
        label="Full Name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        error={errors.name}
        placeholder="Enter student's full name"
      />
      
      <EnhancedInput
        label="PRN"
        value={formData.prn}
        onChange={(e) => setFormData(prev => ({ ...prev, prn: e.target.value }))}
        error={errors.prn}
        placeholder="Enter PRN"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          <select
            value={formData.department}
            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value as Department }))}
            className="w-full h-11 px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select department</option>
            {DEPARTMENTS.filter(dept => dept !== 'All').map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {errors.department && (
            <p className="text-xs text-red-600 mt-1">{errors.department}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Year
          </label>
          <select
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value as Year }))}
            className="w-full h-11 px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select year</option>
            {YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.year && (
            <p className="text-xs text-red-600 mt-1">{errors.year}</p>
          )}
        </div>
      </div>
      
      <EnhancedInput
        label="CGPA"
        type="number"
        step="0.01"
        min="0"
        max="10"
        value={formData.cgpa}
        onChange={(e) => setFormData(prev => ({ ...prev, cgpa: e.target.value }))}
        error={errors.cgpa}
        placeholder="Enter CGPA (0-10)"
      />
      
      <EnhancedInput
        label="Skills"
        value={formData.skills}
        onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
        placeholder="Enter skills separated by commas"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <EnhancedInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="student@email.com"
        />
        
        <EnhancedInput
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="10-digit phone number"
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <EnhancedButton 
          type="button"
          variant="tertiary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </EnhancedButton>
        <EnhancedButton 
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Add Student
        </EnhancedButton>
      </div>
    </form>
  );
}