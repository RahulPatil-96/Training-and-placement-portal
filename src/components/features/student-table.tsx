import React, { useState } from 'react';
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
  Star
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DEPARTMENTS, YEARS, type Department, type Year } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
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

const DEPARTMENTS_TYPED = DEPARTMENTS as readonly Department[];
const YEARS_TYPED = YEARS as readonly Year[];

interface StudentTableProps {
  students: Student[];
  onAddStudent?: () => void;
}

export function StudentTable({ students, onAddStudent }: StudentTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openRows, setOpenRows] = useState<string[]>([]);
  const [activeDept, setActiveDept] = useState<Department | 'All'>('All');
  const [activeYear, setActiveYear] = useState<Year | 'All'>('All');
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [shortlistedStudents, setShortlistedStudents] = useState<Student[]>([]);
  const [showOnlyShortlisted, setShowOnlyShortlisted] = useState(false);

  // Filter students by department and year
  const filteredStudents = students.filter(student => {
    const deptMatch = activeDept === 'All' || student.department === activeDept;
    const yearMatch = activeYear === 'All' || student.year === activeYear;
    return deptMatch && yearMatch;
  });

  // Combine filtered students and shortlisted students (no duplicates)
  let combinedStudents: Student[] = [];
  if (showOnlyShortlisted) {
    combinedStudents = shortlistedStudents;
  } else {
    combinedStudents = [
      ...filteredStudents,
      ...shortlistedStudents.filter(s => !filteredStudents.some(fs => fs.id === s.id))
    ];
  }

  // Toggle row details visibility
  const toggleRow = (id: string) => {
    setOpenRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const isRowOpen = (id: string) => openRows.includes(id);

  // Shortlist students based on keywords in job description
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

  return (
    <div className="w-full h-full min-h-screen px-4 py-8 space-y-8 bg-white rounded-[0.75rem] shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-9 pr-4 w-[280px] text-gray-700"
              aria-label="Search students"
              // Implement search filtering if required
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-gray-700">
                {activeDept}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveDept('All')}>All</DropdownMenuItem>
              {DEPARTMENTS_TYPED.map((dept) => (
                <DropdownMenuItem key={dept} onClick={() => setActiveDept(dept)}>
                  {dept}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-gray-700">
                {activeYear}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveYear('All')}>All</DropdownMenuItem>
              {YEARS_TYPED.map((year) => (
                <DropdownMenuItem key={year} onClick={() => setActiveYear(year)}>
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-gray-700"
            onClick={onAddStudent}
            aria-label="Add student"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-gray-700"
            onClick={() => setShowJobDialog(true)}
            aria-label="Shortlist Students"
          >
            Shortlist Students
          </Button>

          <Button
            variant={showOnlyShortlisted ? 'default' : 'outline'}
            size="sm"
            className="text-gray-700"
            onClick={() => setShowOnlyShortlisted(!showOnlyShortlisted)}
            aria-label="Toggle show only shortlisted students"
          >
            {showOnlyShortlisted ? 'Show All Students' : 'Show Only Shortlisted'}
          </Button>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-gray-700">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Print Table</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px] bg-gray-50">PRN</TableHead>
              <TableHead className="bg-gray-50">Name</TableHead>
              <TableHead className="bg-gray-50">Department</TableHead>
              <TableHead className="bg-gray-50">Year</TableHead>
              <TableHead className="bg-gray-50">CGPA</TableHead>
              <TableHead className="bg-gray-50">Skills</TableHead>
              <TableHead className="bg-gray-50">Resume</TableHead>
              <TableHead className="bg-gray-50 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinedStudents.length > 0 ? (
              combinedStudents.map((student) => (
                <React.Fragment key={student.id}>
                  <TableRow className="group hover:bg-gray-50 transition-colors cursor-pointer">
                    <TableCell className="font-semibold text-gray-900">{student.rollNo}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 bg-gray-100 text-gray-600">
                          <AvatarFallback aria-label={`Avatar of ${student.name}`}>
                            {student.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                    <span className="text-gray-900 font-medium">{student.name}</span>
                    {shortlistedStudents.some(s => s.id === student.id) && (
                      <Badge variant="secondary" className="ml-2">
                        Shortlisted
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">{student.department}</TableCell>
                <TableCell className="text-gray-700">{student.year}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      student.cgpa >= 8.5
                        ? 'default'
                        : student.cgpa >= 7.5
                        ? 'secondary'
                        : 'outline'
                    }
                    className="font-semibold"
                  >
                    {student.cgpa.toFixed(2)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 2).map((skill, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="bg-primary/10 text-primary"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {student.skills.length > 2 && (
                      <Badge variant="outline" className="text-gray-500">
                        +{student.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {student.resumeUrl ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      asChild
                      aria-label={`View resume for ${student.name}`}
                    >
                      <a
                        href={student.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </Button>
                  ) : (
                    <span className="text-gray-400 text-sm italic">
                      Not uploaded
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(student.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                      aria-label={isRowOpen(student.id) ? 'Collapse details' : 'Expand details'}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isRowOpen(student.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>

                    <Dialog onOpenChange={(open) => !open && setSelectedStudent(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                          aria-label={`Open profile details for ${student.name}`}
                          onClick={() => setSelectedStudent(student)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    </Dialog>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                          aria-label={`Actions for ${student.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="mr-2 h-4 w-4" />
                          Mark as eligible
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>

                  {isRowOpen(student.id) && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0 bg-gray-50">
                        <div className="p-5">
                          <div className="grid md:grid-cols-2 gap-6">
                            <Card className="shadow-sm rounded-lg border border-gray-200">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-gray-900">
                                  Certifications
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pb-2">
                                {student.certifications.length > 0 ? (
                                  <div className="space-y-3">
                                    {student.certifications.map((cert, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <div>
                                          <p className="font-semibold text-gray-900">
                                            {cert.name}
                                          </p>
                                          <p className="text-gray-500 text-xs">
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

                            <Card className="shadow-sm rounded-lg border border-gray-200">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-gray-900">
                                  Test Scores
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pb-2">
                                {student.testScores.length > 0 ? (
                                  <div className="space-y-3">
                                    {student.testScores.map((test, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <div>
                                          <p className="font-semibold text-gray-900">
                                            {test.testName}
                                          </p>
                                          <p className="text-gray-500 text-xs">
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-gray-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Full Profile
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing{' '}
          <span className="font-semibold text-gray-900">{combinedStudents.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{students.length}</span> students
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled aria-label="Previous page">
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled aria-label="Next page">
            Next
          </Button>
        </div>
      </div>

      {/* Dialog for detailed student profile */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        {selectedStudent && (
          <DialogContent className="max-w-4xl bg-white rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Student Profile
              </DialogTitle>
              <DialogDescription className="text-gray-600 mb-6">
                Detailed information about {selectedStudent.name}
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="md:col-span-1 rounded-lg border border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 mb-3 bg-gray-100 text-gray-600">
                      <AvatarFallback className="text-lg font-bold">
                        {selectedStudent.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {selectedStudent.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {selectedStudent.department} &bull; {selectedStudent.year}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5 text-gray-700">
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Roll Number</h4>
                      <p>{selectedStudent.rollNo}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-1">CGPA</h4>
                      <Badge className="font-semibold">
                        {selectedStudent.cgpa.toFixed(2)}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-1">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-gray-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {selectedStudent.resumeUrl && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Resume</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-gray-700 hover:text-gray-900"
                          asChild
                        >
                          <a
                            href={selectedStudent.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View Resume
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-2 space-y-6">
                <Card className="rounded-lg border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.certifications.length > 0 ? (
                      <div className="space-y-4">
                        {selectedStudent.certifications.map((cert, i) => (
                          <div
                            key={i}
                            className="flex items-start justify-between border-b border-gray-200 pb-3 last:border-0 last:pb-0"
                          >
                            <div>
                              <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                              <p className="text-sm text-gray-500">{cert.provider}</p>
                              <p className="text-xs text-gray-400">Issued: {cert.issueDate}</p>
                            </div>
                            {cert.score && (
                              <Badge variant="outline" className="text-gray-600">
                                {cert.score}%
                              </Badge>
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
                  <CardFooter>
                    <Button variant="outline" size="sm" className="text-gray-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Certification
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="rounded-lg border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Test Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.testScores.length > 0 ? (
                      <div className="space-y-4">
                        {selectedStudent.testScores.map((test, i) => (
                          <div
                            key={i}
                            className="flex items-start justify-between border-b border-gray-200 pb-3 last:border-0 last:pb-0"
                          >
                            <div>
                              <h4 className="font-semibold text-gray-900">{test.testName}</h4>
                              <p className="text-xs text-gray-400">Taken on {test.date}</p>
                            </div>
                            <Badge className="text-gray-700">
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
                  <CardFooter>
                    <Button variant="outline" size="sm" className="text-gray-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Test Score
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            <DialogFooter className="space-x-2 mt-6">
              <Button variant="outline" className="text-gray-700">
                Edit Profile
              </Button>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Dialog for Shortlist Students */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-lg rounded-lg shadow-lg bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Shortlist Students
            </DialogTitle>
            <DialogDescription className="text-gray-600 mb-4">
              Enter the job description keywords to shortlist relevant students.
            </DialogDescription>
          </DialogHeader>

          <Input
            placeholder="Enter job description keywords..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="mb-6 px-4 py-3 text-gray-700 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:outline-none"
            aria-label="Job description keywords"
            autoFocus
          />

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowJobDialog(false)}
              className="text-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleShortlist} className="bg-gray-900 hover:bg-gray-800 text-white">
              Shortlist
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

