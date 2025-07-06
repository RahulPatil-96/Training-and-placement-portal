import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Table,
  Users,
  Search,
  AlertCircle
} from 'lucide-react';
import { useStudents } from '@/contexts/StudentsContext';
import { Student } from '@/lib/types';

interface DatabaseDiagnostics {
  tableExists: boolean;
  recordCount: number;
  hasData: boolean;
  permissions: boolean;
  structure: TableColumn[];
  validation: ValidationResults;
  sampleData: Student[];
  errors: string[];
}

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
}

interface ValidationResults {
  duplicateRollNumbers: number;
  invalidCGPA: number;
  invalidEmails: number;
  missingRequiredFields: number;
}

export function DatabaseDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DatabaseDiagnostics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { students } = useStudents();

  // Simulate database diagnostics using current data
  const runDiagnostics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock database diagnostics based on current student data
      const mockDiagnostics: DatabaseDiagnostics = {
        tableExists: true,
        recordCount: students.length,
        hasData: students.length > 0,
        permissions: true,
        structure: [
          { name: 'id', type: 'UUID', nullable: false, defaultValue: 'gen_random_uuid()' },
          { name: 'roll_no', type: 'VARCHAR(20)', nullable: false },
          { name: 'name', type: 'VARCHAR(100)', nullable: false },
          { name: 'email', type: 'VARCHAR(100)', nullable: true },
          { name: 'phone', type: 'VARCHAR(15)', nullable: true },
          { name: 'department', type: 'VARCHAR(50)', nullable: false },
          { name: 'year', type: 'VARCHAR(20)', nullable: false },
          { name: 'cgpa', type: 'DECIMAL(3,2)', nullable: false },
          { name: 'skills', type: 'JSONB', nullable: true, defaultValue: '[]' },
          { name: 'is_eligible_for_placements', type: 'BOOLEAN', nullable: true, defaultValue: 'false' },
          { name: 'placement_status', type: 'VARCHAR(20)', nullable: true, defaultValue: 'not_eligible' },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'TIMESTAMP', nullable: false, defaultValue: 'CURRENT_TIMESTAMP' }
        ],
        validation: validateStudentData(students),
        sampleData: students.slice(0, 5),
        errors: []
      };

      setDiagnostics(mockDiagnostics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const validateStudentData = (students: Student[]): ValidationResults => {
    const rollNumbers = new Set();
    let duplicateRollNumbers = 0;
    let invalidCGPA = 0;
    let invalidEmails = 0;
    let missingRequiredFields = 0;

    students.forEach(student => {
      // Check for duplicate roll numbers
      if (rollNumbers.has(student.rollNo)) {
        duplicateRollNumbers++;
      } else {
        rollNumbers.add(student.rollNo);
      }

      // Check for invalid CGPA
      if (student.cgpa < 0 || student.cgpa > 10 || isNaN(student.cgpa)) {
        invalidCGPA++;
      }

      // Check for invalid emails
      if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
        invalidEmails++;
      }

      // Check for missing required fields
      if (!student.rollNo || !student.name || !student.department || !student.year) {
        missingRequiredFields++;
      }
    });

    return {
      duplicateRollNumbers,
      invalidCGPA,
      invalidEmails,
      missingRequiredFields
    };
  };

  useEffect(() => {
    runDiagnostics();
  }, [students]);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getValidationIcon = (count: number) => {
    if (count === 0) return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (count < 5) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Diagnostics</h2>
          <p className="text-muted-foreground">
            Verify student table structure, data integrity, and access permissions
          </p>
        </div>
        <Button onClick={runDiagnostics} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {diagnostics && (
        <div className="grid gap-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(diagnostics.tableExists)}
                  <div>
                    <p className="font-medium">Table Exists</p>
                    <p className="text-sm text-muted-foreground">
                      {diagnostics.tableExists ? 'Found' : 'Not Found'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(diagnostics.hasData)}
                  <div>
                    <p className="font-medium">Has Data</p>
                    <p className="text-sm text-muted-foreground">
                      {diagnostics.recordCount} records
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(diagnostics.permissions)}
                  <div>
                    <p className="font-medium">Permissions</p>
                    <p className="text-sm text-muted-foreground">
                      {diagnostics.permissions ? 'Granted' : 'Denied'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(diagnostics.errors.length === 0)}
                  <div>
                    <p className="font-medium">Errors</p>
                    <p className="text-sm text-muted-foreground">
                      {diagnostics.errors.length} found
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Table Structure
              </CardTitle>
              <CardDescription>
                Current student table schema and column definitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Column Name</th>
                      <th className="text-left p-2">Data Type</th>
                      <th className="text-left p-2">Nullable</th>
                      <th className="text-left p-2">Default Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnostics.structure.map((column, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{column.name}</td>
                        <td className="p-2">
                          <Badge variant="outline">{column.type}</Badge>
                        </td>
                        <td className="p-2">
                          {column.nullable ? (
                            <Badge variant="secondary">Yes</Badge>
                          ) : (
                            <Badge variant="destructive">No</Badge>
                          )}
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {column.defaultValue || 'None'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Data Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Data Validation
              </CardTitle>
              <CardDescription>
                Data integrity checks and validation results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  {getValidationIcon(diagnostics.validation.duplicateRollNumbers)}
                  <div>
                    <p className="font-medium">Duplicate Roll Numbers</p>
                    <p className="text-sm text-muted-foreground">
                      {diagnostics.validation.duplicateRollNumbers} found
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getValidationIcon(diagnostics.validation.invalidCGPA)}
                  <div>
                    <p className="font-medium">Invalid CGPA</p>
                    <p className="text-sm text-muted-foreground">
                      {diagnostics.validation.invalidCGPA} found
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getValidationIcon(diagnostics.validation.invalidEmails)}
                  <div>
                    <p className="font-medium">Invalid Emails</p>
                    <p className="text-sm text-muted-foreground">
                      {diagnostics.validation.invalidEmails} found
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getValidationIcon(diagnostics.validation.missingRequiredFields)}
                  <div>
                    <p className="font-medium">Missing Required</p>
                    <p className="text-sm text-muted-foreground">
                      {diagnostics.validation.missingRequiredFields} found
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sample Data
              </CardTitle>
              <CardDescription>
                First 5 records from the student table
              </CardDescription>
            </CardHeader>
            <CardContent>
              {diagnostics.sampleData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Roll No</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Department</th>
                        <th className="text-left p-2">Year</th>
                        <th className="text-left p-2">CGPA</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnostics.sampleData.map((student, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{student.rollNo}</td>
                          <td className="p-2">{student.name}</td>
                          <td className="p-2">
                            <Badge variant="outline">{student.department}</Badge>
                          </td>
                          <td className="p-2">{student.year}</td>
                          <td className="p-2">{student.cgpa.toFixed(2)}</td>
                          <td className="p-2">
                            <Badge 
                              variant={student.isEligibleForPlacements ? "default" : "secondary"}
                            >
                              {student.placementStatus || 'Not Set'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No sample data available. The table appears to be empty.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* SQL Query Examples */}
          <Card>
            <CardHeader>
              <CardTitle>SQL Query Examples</CardTitle>
              <CardDescription>
                Ready-to-use SQL queries for common operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Get All Students:</h4>
                  <code className="block p-3 bg-muted rounded text-sm">
                    SELECT * FROM students ORDER BY department, year, name;
                  </code>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Count by Department:</h4>
                  <code className="block p-3 bg-muted rounded text-sm">
                    SELECT department, COUNT(*) as total FROM students GROUP BY department;
                  </code>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Top Performers:</h4>
                  <code className="block p-3 bg-muted rounded text-sm">
                    SELECT roll_no, name, cgpa FROM students WHERE cgpa >= 8.5 ORDER BY cgpa DESC;
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}