import React, { useState, useCallback } from 'react';
import { 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Database,
  RefreshCw,
  FileCheck,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DataMapper, 
  MappingValidationResult, 
  DataTransferResult,
  ValidationError,
  ValidationWarning 
} from '@/lib/data-mapping/data-mapper';
import { ColumnMapping } from '@/lib/data-pipeline/types';
import { Student } from '@/lib/types';
import { useStudents } from '@/contexts/StudentsContext';
import { analyticsEngine } from '@/lib/analytics/analytics-engine';

interface DataMappingManagerProps {
  rawData: Record<string, unknown>[];
  columnMappings: ColumnMapping[];
  onMappingComplete: (result: DataTransferResult) => void;
  onValidationResult: (result: MappingValidationResult) => void;
}

export function DataMappingManager({
  rawData,
  columnMappings,
  onMappingComplete,
  onValidationResult
}: DataMappingManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<MappingValidationResult | null>(null);
  const [transferResult, setTransferResult] = useState<DataTransferResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const { toast } = useToast();
  const { students, setStudents } = useStudents();

  const dataMapper = new DataMapper();

  const handleSaveAllMappings = useCallback(async () => {
    if (!rawData || rawData.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data to Process",
        description: "Please upload and map data before saving."
      });
      return;
    }

    // Check if all required mappings are complete
    const pendingMappings = columnMappings.filter(m => m.action === 'pending');
    if (pendingMappings.length > 0) {
      toast({
        variant: "destructive",
        title: "Incomplete Mappings",
        description: `Please complete mapping for ${pendingMappings.length} columns before saving.`
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('Validating data...');

    try {
      // Step 1: Validate and map data
      setProgress(20);
      const validation = await dataMapper.validateAndMapData(
        rawData,
        columnMappings,
        students
      );

      setValidationResult(validation);
      onValidationResult(validation);

      if (!validation.isValid) {
        setCurrentStep('Validation failed');
        toast({
          variant: "destructive",
          title: "Data Validation Failed",
          description: `Found ${validation.errors.length} errors. Please review and fix them.`
        });
        setIsProcessing(false);
        return;
      }

      // Step 2: Transfer data to student table
      setProgress(50);
      setCurrentStep('Transferring data to student table...');

      const transferResult = await dataMapper.transferDataToStudentTable(
        validation,
        students
      );

      setTransferResult(transferResult);

      if (!transferResult.success) {
        setCurrentStep('Transfer failed');
        toast({
          variant: "destructive",
          title: "Data Transfer Failed",
          description: `Failed to transfer data. ${transferResult.errors.length} errors occurred.`
        });
        setIsProcessing(false);
        return;
      }

      // Step 3: Update student context with new data
      setProgress(70);
      setCurrentStep('Updating student records...');

      const updatedStudents = await updateStudentRecords(validation.processedRecords);
      setStudents(updatedStudents);

      // Step 4: Refresh analytics dashboard
      setProgress(90);
      setCurrentStep('Refreshing analytics...');

      await analyticsEngine.refreshMetrics(updatedStudents);

      // Step 5: Complete
      setProgress(100);
      setCurrentStep('Complete');

      toast({
        title: "Data Mapping Successful",
        description: `Successfully processed ${transferResult.transferredCount} records. ${transferResult.duplicateCount} duplicates updated.`
      });

      onMappingComplete(transferResult);

    } catch (error) {
      console.error('Data mapping error:', error);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentStep('');
      }, 2000);
    }
  }, [rawData, columnMappings, students, setStudents, toast, onMappingComplete, onValidationResult]);

  const updateStudentRecords = async (processedRecords: any[]): Promise<Student[]> => {
    const validRecords = processedRecords
      .filter(record => record.validationStatus !== 'error')
      .map(record => record.mappedData as Student);

    // Merge with existing students
    const existingStudentsMap = new Map(students.map(s => [s.rollNo, s]));
    const newStudents: Student[] = [];

    validRecords.forEach(record => {
      if (existingStudentsMap.has(record.rollNo)) {
        // Update existing student
        const existing = existingStudentsMap.get(record.rollNo)!;
        const merged = { ...existing, ...record, updatedAt: new Date().toISOString() };
        existingStudentsMap.set(record.rollNo, merged);
      } else {
        // Add new student
        newStudents.push(record);
      }
    });

    return [...Array.from(existingStudentsMap.values()), ...newStudents];
  };

  const getValidationSummary = () => {
    if (!validationResult) return null;

    const totalRecords = validationResult.processedRecords.length;
    const validRecords = validationResult.processedRecords.filter(r => r.validationStatus === 'valid').length;
    const warningRecords = validationResult.processedRecords.filter(r => r.validationStatus === 'warning').length;
    const errorRecords = validationResult.processedRecords.filter(r => r.validationStatus === 'error').length;

    return {
      totalRecords,
      validRecords,
      warningRecords,
      errorRecords,
      validationRate: totalRecords > 0 ? (validRecords / totalRecords) * 100 : 0
    };
  };

  const summary = getValidationSummary();

  return (
    <div className="space-y-6">
      {/* Save All Mappings Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Mapping Manager
          </CardTitle>
          <CardDescription>
            Transfer mapped data to the student table and update analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Ready to process {rawData?.length || 0} records
              </p>
              <p className="text-xs text-muted-foreground">
                {columnMappings.filter(m => m.action === 'map').length} columns mapped, {' '}
                {columnMappings.filter(m => m.action === 'pending').length} pending
              </p>
            </div>
            <Button
              onClick={handleSaveAllMappings}
              disabled={isProcessing || !rawData || rawData.length === 0}
              className="min-w-[140px]"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save All Mappings
                </>
              )}
            </Button>
          </div>

          {/* Progress Indicator */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span>{currentStep}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Validation Results */}
      <AnimatePresence>
        {validationResult && summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Validation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {summary.totalRecords}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Total Records</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {summary.validRecords}
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">Valid</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {summary.warningRecords}
                    </div>
                    <div className="text-sm text-amber-600 dark:text-amber-400">Warnings</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {summary.errorRecords}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400">Errors</div>
                  </div>
                </div>

                {/* Validation Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Validation Success Rate</span>
                    <span className="text-sm">{summary.validationRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={summary.validationRate} className="h-2" />
                </div>

                {/* Error Summary */}
                {validationResult.errors.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">
                        {validationResult.errors.length} validation errors found:
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {validationResult.errors.slice(0, 5).map((error, index) => (
                          <div key={index} className="text-xs">
                            Row {error.row}: {error.message}
                          </div>
                        ))}
                        {validationResult.errors.length > 5 && (
                          <div className="text-xs text-muted-foreground">
                            ... and {validationResult.errors.length - 5} more errors
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Warning Summary */}
                {validationResult.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">
                        {validationResult.warnings.length} warnings found:
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {validationResult.warnings.slice(0, 3).map((warning, index) => (
                          <div key={index} className="text-xs">
                            Row {warning.row}: {warning.message}
                          </div>
                        ))}
                        {validationResult.warnings.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            ... and {validationResult.warnings.length - 3} more warnings
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Results */}
      <AnimatePresence>
        {transferResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {transferResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  Data Transfer Results
                </CardTitle>
                <CardDescription>
                  Transfer completed at {new Date(transferResult.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {transferResult.transferredCount}
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">New Records</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {transferResult.duplicateCount}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Updated</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {transferResult.skippedCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Skipped</div>
                  </div>
                </div>

                {/* Audit Trail Summary */}
                {transferResult.auditTrail.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Audit Trail</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {transferResult.auditTrail.slice(0, 5).map((entry, index) => (
                        <div key={index} className="text-xs flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {entry.action}
                          </Badge>
                          <span>Record {entry.recordId.slice(0, 8)}...</span>
                          <span className="text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {transferResult.success && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Data transfer completed successfully! Analytics dashboard has been updated with the latest data.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Update Notification */}
      <AnimatePresence>
        {transferResult?.success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="w-80 shadow-lg border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                      Analytics Updated
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-300">
                      Dashboard refreshed with new data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}