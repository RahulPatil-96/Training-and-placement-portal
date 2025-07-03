import React, { useState, useCallback } from 'react';
import { FileUp, Loader2, CheckCircle2, AlertCircle, XCircle, FileSpreadsheet, Merge } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { processStudentFiles, getProcessedStudentRecords } from '@/lib/data-pipeline/api';
import { ConflictRecord } from '@/lib/data-pipeline/types';
import { HeaderMapping } from '../features/header-mapping';
import { ExcelMerger } from './excel-merger';
import { useStudents } from '@/contexts/StudentsContext';
import { Student } from '@/lib/types';

interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

interface UploadSummary {
  studentsMatched: number;
  fieldsAdded: number;
  conflictsTotal: number;
  rowsSkipped: number;
  errors?: { file: string; error: string }[];
}

export function EnhancedFileUploader() {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);
  const [columnMappings, setColumnMappings] = useState<Map<string, string>>(new Map());
  const [newColumns, setNewColumns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const { toast } = useToast();
  const { students, setStudents } = useStudents();

  // Helper to map any record object to Student type
  const mapRecordToStudent = (record: any): Student => {
    return {
      id: record.PRN || record.id || `student-${Date.now()}-${Math.random()}`,
      rollNo: record.PRN || record.rollNo || '',
      name: record.name || '',
      department: record.department || 'CS',
      year: record.year || 'FY',
      cgpa: typeof record.cgpa === 'number' ? record.cgpa : parseFloat(record.cgpa) || 0,
      skills: Array.isArray(record.skills) ? record.skills : 
               typeof record.skills === 'string' ? record.skills.split(',').map(s => s.trim()) : [],
      certifications: [],
      testScores: [],
      email: record.email || '',
      phone: record.phone || '',
      address: record.address || '',
      dateOfBirth: record.dateOfBirth || '',
      gender: record.gender || 'other',
      bloodGroup: record.bloodGroup || '',
      parentName: record.parentName || '',
      parentPhone: record.parentPhone || '',
      parentEmail: record.parentEmail || '',
      achievements: [],
      internships: [],
      projects: [],
      attendance: 0,
      backlogCount: 0,
      isEligibleForPlacements: false,
      placementStatus: 'not_eligible',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Merge new students with existing by PRN
  const mergeStudents = (existing: Student[], incoming: Student[]): Student[] => {
    const map = new Map(existing.map(s => [s.id, s]));
    incoming.forEach(student => {
      if (map.has(student.id)) {
        const existingStudent = map.get(student.id)!;
        map.set(student.id, { ...existingStudent, ...student });
      } else {
        map.set(student.id, student);
      }
    });
    return Array.from(map.values());
  };

  const processFilesWithMappings = async (filesToProcess: File[], mappingsMap: Map<string, string>) => {
    try {
      const stats = await processStudentFiles(filesToProcess);
      setUploadSummary({
        studentsMatched: stats.recordsProcessed,
        fieldsAdded: stats.filesProcessed,
        conflictsTotal: stats.conflicts?.length || 0,
        rowsSkipped: 0
      });
      setConflicts(stats.conflicts || []);
      setNewColumns(stats.newColumns || []);

      if (stats.errors && stats.errors.length > 0) {
        stats.errors.forEach(err => {
          toast({
            variant: "destructive",
            title: "File Processing Error",
            description: `${err.file}: ${err.error}`
          });
        });
      }

      // Get processed records and update context
      const processedRecords = getProcessedStudentRecords();
      const newStudents = processedRecords.map(mapRecordToStudent);
      const mergedStudents = mergeStudents(students, newStudents);
      setStudents(mergedStudents);

      toast({
        title: "Files processed successfully",
        description: `Processed ${stats.recordsProcessed} records from ${stats.filesProcessed} files.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error processing files",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        progress: 0,
        status: 'pending' as const
      }));
      setFiles(prev => [...prev, ...newFiles]);
      await processFilesWithMappings(Array.from(e.target.files), columnMappings);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
        .filter(file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))
        .map(file => ({
          file,
          progress: 0,
          status: 'pending' as const
        }));

      if (newFiles.length === 0) {
        toast({
          variant: "destructive",
          title: "Invalid file format",
          description: "Please upload Excel (.xlsx, .xls) files only.",
        });
        return;
      }

      setFiles(prev => [...prev, ...newFiles]);
      await processFilesWithMappings(Array.from(e.dataTransfer.files), columnMappings);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev: FileUploadState[]) => prev.filter((_: FileUploadState, i: number) => i !== index));
  };

  const handleUpdateMapping = (updatedMapping: any) => {
    setNewColumns(prev => {
      const index = prev.findIndex(m => m.excelColumn === updatedMapping.excelColumn);
      if (index !== -1) {
        const newMappings = [...prev];
        newMappings[index] = updatedMapping;
        return newMappings;
      }
      return prev;
    });
  };

  const handleSaveMappings = async () => {
    const mappingsMap = new Map<string, string>();
    newColumns.forEach(mapping => {
      if (mapping.action === 'map' && mapping.excelColumn && mapping.suggestedMapping) {
        mappingsMap.set(mapping.excelColumn, mapping.suggestedMapping);
      }
    });
    setColumnMappings(mappingsMap);
    
    if (files.length > 0) {
      const allFiles = files.map(f => f.file);
      await processFilesWithMappings(allFiles, mappingsMap);
    }
    
    toast({
      title: "Mappings saved",
      description: "All column mappings have been saved successfully."
    });
  };

  const handleRefreshData = async () => {
    if (files.length === 0) return;
    try {
      const allFiles = files.map(f => f.file);
      await processFilesWithMappings(allFiles, columnMappings);
      toast({
        title: "Data refreshed",
        description: "Data has been refreshed successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error refreshing data",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  };

  const showMappingUI = conflicts.length > 0 || newColumns.some(m => m.action === 'pending');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Enhanced File Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Upload & Process
              </TabsTrigger>
              <TabsTrigger value="merge" className="flex items-center gap-2">
                <Merge className="h-4 w-4" />
                Merge Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              {/* File Upload Area */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
                  isDragging ? "border-primary bg-muted/50" : "border-muted-foreground/25 hover:border-muted-foreground/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  multiple
                  onChange={handleFileChange}
                />

                <div className="flex flex-col items-center gap-2">
                  <FileUp className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Drag & drop Excel files here</h3>
                  <p className="text-sm text-muted-foreground">
                    or click to browse your files
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports .xlsx and .xls files
                  </p>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {files.map((fileData, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-4">
                              <div>
                                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  {fileData.file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(fileData.file.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {fileData.status === 'uploading' && (
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                              )}
                              {fileData.status === 'success' && (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              )}
                              {fileData.status === 'error' && (
                                <AlertCircle className="h-5 w-5 text-destructive" />
                              )}
                              {fileData.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(i);
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Summary */}
              {uploadSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col items-center p-4 rounded-lg bg-primary/5">
                        <span className="text-2xl font-bold">{uploadSummary.studentsMatched}</span>
                        <span className="text-sm text-muted-foreground">Records Processed</span>
                      </div>
                      <div className="flex flex-col items-center p-4 rounded-lg bg-primary/5">
                        <span className="text-2xl font-bold">{uploadSummary.fieldsAdded}</span>
                        <span className="text-sm text-muted-foreground">Files Processed</span>
                      </div>
                      <div className="flex flex-col items-center p-4 rounded-lg bg-primary/5">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold">{uploadSummary.conflictsTotal}</span>
                          {uploadSummary.conflictsTotal > 0 && <AlertCircle className="ml-1 h-4 w-4 text-amber-500" />}
                        </div>
                        <span className="text-sm text-muted-foreground">Conflicts</span>
                      </div>
                      <div className="flex flex-col items-center p-4 rounded-lg bg-primary/5">
                        <span className="text-2xl font-bold">{uploadSummary.rowsSkipped}</span>
                        <span className="text-sm text-muted-foreground">Rows Skipped</span>
                      </div>
                    </div>
                    {uploadSummary.errors && uploadSummary.errors.length > 0 && (
                      <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded">
                        <h4 className="font-semibold text-red-700 mb-2">File Processing Errors:</h4>
                        <ul className="list-disc list-inside text-red-700 text-sm max-h-40 overflow-y-auto">
                          {uploadSummary.errors.map((err, idx) => (
                            <li key={idx}>{err.file}: {err.error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => window.location.hash = "#header-mapping"}>
                      View Processing Details
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Header Mapping */}
              {showMappingUI && (
                <HeaderMapping
                  newColumns={newColumns}
                  conflicts={conflicts}
                  onUpdateMapping={handleUpdateMapping}
                  onSaveMappings={handleSaveMappings}
                  onRefreshData={handleRefreshData}
                />
              )}
            </TabsContent>

            <TabsContent value="merge">
              <ExcelMerger />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}