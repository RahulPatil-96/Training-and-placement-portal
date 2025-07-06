import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Download,
  ExternalLink,
  EyeIcon,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  RefreshCw,
  Database
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { DEPARTMENTS, YEARS, type Department, type Year } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Student } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { DatabaseDiagnostics } from './database-diagnostics';

const DEPARTMENTS_TYPED = DEPARTMENTS as readonly Department[];
const YEARS_TYPED = YEARS as readonly Year[];

interface EnhancedStudentTableProps {
  students: Student[];
  onAddStudent?: () => void;
  loading?: boolean;
}

type SortField = 'name' | 'rollNo' | 'department' | 'year' | 'cgpa';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

export function EnhancedStudentTable({ students, onAddStudent, loading = false }: EnhancedStudentTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openRows, setOpenRows] = useState<string[]>([]);
  const [activeDept, setActiveDept] = useState<Department | 'All'>('All');
  const [activeYear, setActiveYear] = useState<Year | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [shortlistedStudents, setShortlistedStudents] = useState<Student[]>([]);
  const [showOnlyShortlisted, setShowOnlyShortlisted] = useState(false);

  // Enhanced filtering and sorting
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const deptMatch = activeDept === 'All' || student.department === activeDept;
      const yearMatch = activeYear === 'All' || student.year === activeYear;
      const searchMatch = !searchQuery || 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return deptMatch && yearMatch && searchMatch;
    });

    if (showOnlyShortlisted) {
      filtered = shortlistedStudents;
    }

    // Sort students
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [students, activeDept, activeYear, searchQuery, sortField, sortDirection, showOnlyShortlisted, shortlistedStudents]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRow = (id: string) => {
    setOpenRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id)
        ? prev.filter(studentId => studentId !== id)
        : [...prev, id]
    );
  };

  const handleShortlist = () => {
    if (!jobDescription.trim()) {
      setShortlistedStudents([]);
      return;
    }
    const keywords = jobDescription.toLowerCase().split(/\s+/);
    const shortlisted = students.filter(student =>
      student.skills.some(skill =>
        keywords.some(keyword => skill.toLowerCase().includes(keyword))
      )
    );
    setShortlistedStudents(shortlisted);
    setShowJobDialog(false);
  };

  const handleBulkAction = (action: string) => {
    // Implement bulk actions
    console.log(`Bulk action: ${action} for students:`, selectedStudents);
  };

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Header with Search and Filters */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Student Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and track student records, placements, and performance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <EnhancedButton
            variant="tertiary"
            size="sm"
            onClick={() => setShowDiagnostics(true)}
            leftIcon={<Database className="h-4 w-4" />}
          >
            Database Diagnostics
          </EnhancedButton>

          <EnhancedButton
            variant="tertiary"
            size="sm"
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            leftIcon={viewMode === 'table' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          >
            {viewMode === 'table' ? 'Grid View' : 'Table View'}
          </EnhancedButton>
          
          <EnhancedButton
            variant="secondary"
            size="sm"
            onClick={onAddStudent}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Student
          </EnhancedButton>
        </div>
      </div>

      {/* Advanced Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <EnhancedInput
                placeholder="Search students by name, PRN, department, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <EnhancedButton variant="tertiary" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Department: {activeDept}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </EnhancedButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={activeDept === 'All'}
                    onCheckedChange={() => setActiveDept('All')}
                  >
                    All Departments
                  </DropdownMenuCheckboxItem>
                  {DEPARTMENTS_TYPED.filter(dept => dept !== 'All').map((dept) => (
                    <DropdownMenuCheckboxItem
                      key={dept}
                      checked={activeDept === dept}
                      onCheckedChange={() => setActiveDept(dept)}
                    >
                      {dept}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <EnhancedButton variant="tertiary" size="sm">
                    Year: {activeYear}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </EnhancedButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Year</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={activeYear === 'All'}
                    onCheckedChange={() => setActiveYear('All')}
                  >
                    All Years
                  </DropdownMenuCheckboxItem>
                  {YEARS_TYPED.map((year) => (
                    <DropdownMenuCheckboxItem
                      key={year}
                      checked={activeYear === year}
                      onCheckedChange={() => setActiveYear(year)}
                    >
                      {year}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <EnhancedButton
                variant="tertiary"
                size="sm"
                onClick={() => setShowJobDialog(true)}
              >
                Smart Shortlist
              </EnhancedButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <EnhancedButton variant="tertiary" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </EnhancedButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Print Table</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredAndSortedStudents.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total Students</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {filteredAndSortedStudents.filter(s => s.cgpa >= 8.0).length}
              </div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400">High Performers</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {shortlistedStudents.length}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Shortlisted</div>
            </div>
            <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {selectedStudents.length}
              </div>
              <div className="text-sm text-amber-600 dark:text-amber-400">Selected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedStudents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <EnhancedButton
                  variant="tertiary"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                >
                  Export Selected
                </EnhancedButton>
                <EnhancedButton
                  variant="tertiary"
                  size="sm"
                  onClick={() => handleBulkAction('shortlist')}
                >
                  Add to Shortlist
                </EnhancedButton>
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStudents([])}
                >
                  Clear Selection
                </EnhancedButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table/Grid View */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === filteredAndSortedStudents.length && filteredAndSortedStudents.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(filteredAndSortedStudents.map(s => s.id));
                          } else {
                            setSelectedStudents([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('rollNo')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>PRN</span>
                        {sortField === 'rollNo' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('department')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Department</span>
                        {sortField === 'department' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('year')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Year</span>
                        {sortField === 'year' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort('cgpa')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>CGPA</span>
                        {sortField === 'cgpa' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredAndSortedStudents.map((student) => (
                      <React.Fragment key={student.id}>
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => toggleStudentSelection(student.id)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                            {student.rollNo}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                  {student.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {student.name}
                                </div>
                                {student.email && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {student.email}
                                  </div>
                                )}
                              </div>
                              {shortlistedStudents.some(s => s.id === student.id) && (
                                <Badge variant="secondary" className="ml-2">
                                  <Star className="h-3 w-3 mr-1" />
                                  Shortlisted
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              student.department === 'CS' && 'bg-blue-50 text-blue-700 border-blue-200',
                              student.department === 'IT' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                              student.department === 'ENTC' && 'bg-purple-50 text-purple-700 border-purple-200',
                              student.department === 'Mechanical' && 'bg-orange-50 text-orange-700 border-orange-200'
                            )}>
                              {student.department}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {student.year}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  student.cgpa >= 9.0
                                    ? 'default'
                                    : student.cgpa >= 8.0
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className="font-semibold"
                              >
                                {student.cgpa.toFixed(2)}
                              </Badge>
                              <div className="w-16">
                                <ProgressIndicator
                                  value={student.cgpa}
                                  max={10}
                                  variant={student.cgpa >= 8.0 ? 'success' : student.cgpa >= 6.0 ? 'warning' : 'error'}
                                  className="h-1"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {student.skills.slice(0, 2).map((skill, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="bg-gray-50 dark:bg-gray-800 text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                              {student.skills.length > 2 && (
                                <Badge variant="outline" className="text-gray-500 text-xs">
                                  +{student.skills.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {student.resumeUrl ? (
                              <EnhancedButton
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={student.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  View
                                </a>
                              </EnhancedButton>
                            ) : (
                              <span className="text-gray-400 text-sm italic">
                                Not uploaded
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <EnhancedButton
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRow(student.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 transition-transform",
                                    openRows.includes(student.id) && "rotate-180"
                                  )}
                                />
                              </EnhancedButton>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <EnhancedButton
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setSelectedStudent(student)}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </EnhancedButton>
                                </DialogTrigger>
                              </Dialog>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <EnhancedButton
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </EnhancedButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Star className="mr-2 h-4 w-4" />
                                    Add to Shortlist
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Data
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Remove Student
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </motion.tr>

                        {/* Expandable Row Details */}
                        <AnimatePresence>
                          {openRows.includes(student.id) && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <TableCell colSpan={9} className="p-0 bg-gray-50 dark:bg-gray-800">
                                <div className="p-6">
                                  <div className="grid md:grid-cols-2 gap-6">
                                    <Card className="shadow-sm">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Certifications</CardTitle>
                                      </CardHeader>
                                      <CardContent className="pb-3">
                                        {student.certifications.length > 0 ? (
                                          <div className="space-y-3">
                                            {student.certifications.map((cert, i) => (
                                              <div key={i} className="flex items-center justify-between">
                                                <div>
                                                  <p className="font-medium text-sm">{cert.name}</p>
                                                  <p className="text-xs text-gray-500">
                                                    {cert.provider} • {cert.issueDate}
                                                  </p>
                                                </div>
                                                {cert.score && (
                                                  <Badge variant="outline">{cert.score}%</Badge>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-gray-500 italic">
                                            No certifications added yet.
                                          </p>
                                        )}
                                      </CardContent>
                                    </Card>

                                    <Card className="shadow-sm">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Test Scores</CardTitle>
                                      </CardHeader>
                                      <CardContent className="pb-3">
                                        {student.testScores.length > 0 ? (
                                          <div className="space-y-3">
                                            {student.testScores.map((test, i) => (
                                              <div key={i} className="flex items-center justify-between">
                                                <div>
                                                  <p className="font-medium text-sm">{test.testName}</p>
                                                  <p className="text-xs text-gray-500">
                                                    Taken on {test.date}
                                                  </p>
                                                </div>
                                                <Badge variant="outline">
                                                  {test.score}/{test.maxScore}
                                                </Badge>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-gray-500 italic">
                                            No test scores added yet.
                                          </p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </div>

                                  <div className="flex justify-end mt-4">
                                    <EnhancedButton
                                      variant="tertiary"
                                      size="sm"
                                      leftIcon={<ExternalLink className="h-4 w-4" />}
                                    >
                                      View Full Profile
                                    </EnhancedButton>
                                  </div>
                                </div>
                              </TableCell>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredAndSortedStudents.map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {student.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <CardDescription>{student.rollNo}</CardDescription>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="rounded border-gray-300"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{student.department}</Badge>
                      <span className="text-sm text-gray-500">{student.year}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">CGPA:</span>
                      <Badge variant={student.cgpa >= 8.0 ? 'default' : 'secondary'}>
                        {student.cgpa.toFixed(2)}
                      </Badge>
                      <div className="flex-1">
                        <ProgressIndicator
                          value={student.cgpa}
                          max={10}
                          variant={student.cgpa >= 8.0 ? 'success' : 'warning'}
                          className="h-1"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {student.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {student.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{student.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center justify-between w-full">
                      <EnhancedButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </EnhancedButton>
                      {student.resumeUrl && (
                        <EnhancedButton
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-1" />
                            Resume
                          </a>
                        </EnhancedButton>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredAndSortedStudents.length} of {students.length} students
          {selectedStudents.length > 0 && (
            <span className="ml-2">• {selectedStudents.length} selected</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <EnhancedButton variant="tertiary" size="sm" disabled>
            Previous
          </EnhancedButton>
          <EnhancedButton variant="tertiary" size="sm" disabled>
            Next
          </EnhancedButton>
        </div>
      </div>

      {/* Database Diagnostics Dialog */}
      <Dialog open={showDiagnostics} onOpenChange={setShowDiagnostics}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Database Diagnostics</DialogTitle>
            <DialogDescription>
              Comprehensive database health check and troubleshooting
            </DialogDescription>
          </DialogHeader>
          <DatabaseDiagnostics />
        </DialogContent>
      </Dialog>

      {/* Smart Shortlist Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Smart Student Shortlisting</DialogTitle>
            <DialogDescription>
              Enter job requirements or skills to automatically shortlist matching students.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <EnhancedInput
              label="Job Description / Required Skills"
              placeholder="e.g., React, Node.js, JavaScript, Python, Machine Learning..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[100px]"
            />
            
            <div className="text-sm text-gray-500">
              <p>💡 <strong>Tip:</strong> Enter specific skills, technologies, or job requirements. 
              The system will match students based on their skill profiles.</p>
            </div>
          </div>

          <DialogFooter>
            <EnhancedButton
              variant="tertiary"
              onClick={() => setShowJobDialog(false)}
            >
              Cancel
            </EnhancedButton>
            <EnhancedButton onClick={handleShortlist}>
              Shortlist Students
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Detail Dialog */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Student Profile</DialogTitle>
              <DialogDescription>
                Comprehensive profile for {selectedStudent.name}
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Profile Summary */}
              <Card className="md:col-span-1">
                <CardHeader className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                      {selectedStudent.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{selectedStudent.name}</CardTitle>
                  <CardDescription>
                    {selectedStudent.department} • {selectedStudent.year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Academic Performance</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">CGPA:</span>
                      <Badge className="font-semibold">
                        {selectedStudent.cgpa.toFixed(2)}
                      </Badge>
                    </div>
                    <ProgressIndicator
                      value={selectedStudent.cgpa}
                      max={10}
                      variant={selectedStudent.cgpa >= 8.0 ? 'success' : 'warning'}
                      showPercentage
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>PRN:</strong> {selectedStudent.rollNo}</p>
                      {selectedStudent.email && (
                        <p><strong>Email:</strong> {selectedStudent.email}</p>
                      )}
                      {selectedStudent.phone && (
                        <p><strong>Phone:</strong> {selectedStudent.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedStudent.skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Information */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.certifications.length > 0 ? (
                      <div className="space-y-4">
                        {selectedStudent.certifications.map((cert, i) => (
                          <div key={i} className="border-b pb-3 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{cert.name}</h4>
                                <p className="text-sm text-gray-500">{cert.provider}</p>
                                <p className="text-xs text-gray-400">Issued: {cert.issueDate}</p>
                              </div>
                              {cert.score && (
                                <Badge variant="outline">{cert.score}%</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No certifications added yet.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Test Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.testScores.length > 0 ? (
                      <div className="space-y-4">
                        {selectedStudent.testScores.map((test, i) => (
                          <div key={i} className="border-b pb-3 last:border-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{test.testName}</h4>
                                <p className="text-xs text-gray-400">Taken on {test.date}</p>
                              </div>
                              <Badge>{test.score}/{test.maxScore}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No test scores added yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter className="space-x-2">
              <EnhancedButton variant="tertiary">
                Edit Profile
              </EnhancedButton>
              <EnhancedButton>
                Add to Shortlist
              </EnhancedButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}