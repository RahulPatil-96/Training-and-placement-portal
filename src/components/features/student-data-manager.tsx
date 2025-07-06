import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  RefreshCw, 
  Download, 
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  BarChart3,
  Search,
  Filter
} from 'lucide-react';
import { useStudents } from '@/contexts/StudentsContext';
import { Student } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

interface DatabaseStats {
  totalRecords: number;
  lastUpdated: string;
  dataIntegrity: {
    valid: number;
    warnings: number;
    errors: number;
  };
  performance: {
    queryTime: number;
    indexHealth: 'good' | 'warning' | 'poor';
  };
}

export function StudentDataManager() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const { students, setStudents } = useStudents();
  const { toast } = useToast();

  // Simulate database statistics
  const generateStats = (): DatabaseStats => {
    const totalRecords = students.length;
    const validRecords = students.filter(s => 
      s.rollNo && s.name && s.department && s.year && s.cgpa >= 0 && s.cgpa <= 10
    ).length;
    const warningRecords = students.filter(s => 
      !s.email || s.skills.length === 0
    ).length;
    const errorRecords = totalRecords - validRecords;

    return {
      totalRecords,
      lastUpdated: new Date().toISOString(),
      dataIntegrity: {
        valid: validRecords,
        warnings: warningRecords,
        errors: errorRecords
      },
      performance: {
        queryTime: Math.random() * 100 + 50, // 50-150ms
        indexHealth: errorRecords === 0 ? 'good' : errorRecords < 5 ? 'warning' : 'poor'
      }
    };
  };

  const refreshDatabaseStats = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newStats = generateStats();
      setStats(newStats);
      
      toast({
        title: "Database stats refreshed",
        description: `Found ${newStats.totalRecords} student records`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to refresh stats",
        description: "Could not connect to database"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithDatabase = async () => {
    setIsLoading(true);
    setSyncProgress(0);

    try {
      // Simulate sync process with progress
      for (let i = 0; i <= 100; i += 10) {
        setSyncProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate data validation and cleanup
      const cleanedStudents = students.map(student => ({
        ...student,
        updatedAt: new Date().toISOString()
      }));

      setStudents(cleanedStudents);
      setStats(generateStats());

      toast({
        title: "Database sync completed",
        description: `Successfully synchronized ${students.length} student records`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: "Could not synchronize with database"
      });
    } finally {
      setIsLoading(false);
      setSyncProgress(0);
    }
  };

  const exportDatabaseQuery = () => {
    const sqlQuery = `-- Student Database Export Query
-- Generated on: ${new Date().toISOString()}

SELECT 
    s.id,
    s.roll_no as "rollNo",
    s.name,
    s.email,
    s.phone,
    s.department,
    s.year,
    s.cgpa,
    s.skills,
    s.is_eligible_for_placements as "isEligibleForPlacements",
    s.placement_status as "placementStatus",
    s.created_at as "createdAt",
    s.updated_at as "updatedAt",
    
    -- Calculated fields
    CASE 
        WHEN s.cgpa >= 9.0 THEN 'Excellent'
        WHEN s.cgpa >= 8.0 THEN 'Very Good'
        WHEN s.cgpa >= 7.0 THEN 'Good'
        WHEN s.cgpa >= 6.0 THEN 'Average'
        ELSE 'Below Average'
    END as performance_grade,
    
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.date_of_birth)) as age
    
FROM students s
WHERE s.department IS NOT NULL
ORDER BY s.department, s.year, s.name;

-- Additional Analytics Queries:

-- Department Statistics
SELECT 
    department,
    COUNT(*) as total_students,
    AVG(cgpa) as average_cgpa,
    COUNT(CASE WHEN is_eligible_for_placements = true THEN 1 END) as eligible_students
FROM students
GROUP BY department
ORDER BY total_students DESC;

-- Top Performers
SELECT roll_no, name, department, cgpa
FROM students
WHERE cgpa >= 8.5
ORDER BY cgpa DESC
LIMIT 20;`;

    const blob = new Blob([sqlQuery], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_database_queries_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "SQL queries exported",
      description: "Database queries saved to file"
    });
  };

  useEffect(() => {
    refreshDatabaseStats();
  }, [students]);

  const getIntegrityColor = (type: 'valid' | 'warnings' | 'errors', count: number) => {
    if (type === 'valid') return 'text-emerald-600';
    if (type === 'warnings') return count > 0 ? 'text-amber-600' : 'text-gray-600';
    return count > 0 ? 'text-red-600' : 'text-gray-600';
  };

  const getPerformanceIcon = (health: string) => {
    switch (health) {
      case 'good': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'poor': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Database Manager</h2>
          <p className="text-muted-foreground">
            Monitor database health, sync data, and manage student records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportDatabaseQuery}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export SQL
          </Button>
          <Button
            onClick={refreshDatabaseStats}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
        </div>
      </div>

      {/* Database Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecords}</div>
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Integrity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={getIntegrityColor('valid', stats.dataIntegrity.valid)}>
                    Valid: {stats.dataIntegrity.valid}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={getIntegrityColor('warnings', stats.dataIntegrity.warnings)}>
                    Warnings: {stats.dataIntegrity.warnings}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={getIntegrityColor('errors', stats.dataIntegrity.errors)}>
                    Errors: {stats.dataIntegrity.errors}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Query Performance</CardTitle>
              {getPerformanceIcon(stats.performance.indexHealth)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.performance.queryTime.toFixed(0)}ms</div>
              <p className="text-xs text-muted-foreground">
                Index health: {stats.performance.indexHealth}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">Synced</div>
              <p className="text-xs text-muted-foreground">
                All records up to date
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sync Progress */}
      {syncProgress > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Database Synchronization</CardTitle>
            <CardDescription>
              Syncing student data with database...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Database Operations</CardTitle>
          <CardDescription>
            Manage student data synchronization and database operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              onClick={syncWithDatabase}
              disabled={isLoading}
              className="h-20 flex-col gap-2"
            >
              <Upload className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Sync with Database</div>
                <div className="text-xs opacity-80">Update all student records</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => window.open('#database-diagnostics', '_blank')}
              className="h-20 flex-col gap-2"
            >
              <Search className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Run Diagnostics</div>
                <div className="text-xs opacity-80">Check database health</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Alerts */}
      {stats && stats.dataIntegrity.errors > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Data Quality Issues Detected:</strong> {stats.dataIntegrity.errors} records have validation errors. 
            Please review and fix these issues to maintain data integrity.
          </AlertDescription>
        </Alert>
      )}

      {stats && stats.dataIntegrity.warnings > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Data Warnings:</strong> {stats.dataIntegrity.warnings} records have missing optional fields. 
            Consider updating these records for better data completeness.
          </AlertDescription>
        </Alert>
      )}

      {/* SQL Query Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick SQL Queries</CardTitle>
          <CardDescription>
            Common database queries for student data analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Get All Students</h4>
              <code className="block p-3 bg-muted rounded text-sm">
                SELECT * FROM students ORDER BY department, year, name;
              </code>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Department Statistics</h4>
              <code className="block p-3 bg-muted rounded text-sm">
                SELECT department, COUNT(*) as total, AVG(cgpa) as avg_cgpa FROM students GROUP BY department;
              </code>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Top Performers</h4>
              <code className="block p-3 bg-muted rounded text-sm">
                SELECT roll_no, name, cgpa FROM students WHERE cgpa >= 8.5 ORDER BY cgpa DESC;
              </code>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Placement Eligible</h4>
              <code className="block p-3 bg-muted rounded text-sm">
                SELECT COUNT(*) FROM students WHERE is_eligible_for_placements = true;
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}