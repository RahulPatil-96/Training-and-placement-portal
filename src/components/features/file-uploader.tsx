import { useState } from 'react';
import { FileUp, Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { processStudentFiles, getProcessedStudentRecords } from '@/lib/data-pipeline/api';
import { ConflictRecord } from '@/lib/data-pipeline/types';
import { HeaderMapping } from './header-mapping';
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

export function FileUploader() {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);
  const [columnMappings, setColumnMappings] = useState<Map<string, string>>(new Map()); // Use Map for column mappings
  const [newColumns, setNewColumns] = useState<any[]>([]); // Store newColumns array for HeaderMapping component
  const { toast } = useToast();
  const { students, setStudents } = useStudents();

  // Helper to map any record object to Student type
  const mapRecordToStudent = (record: any): Student => {
    return {
      id: record.PRN,
      rollNo: record.PRN,
      name: record.name || '',
      department: record.department || 'ENTC',
      year: record.year || 'A',
      cgpa: typeof record.cgpa === 'number' ? record.cgpa : parseFloat(record.cgpa) || 0,
      skills: Array.isArray(record.skills) ? record.skills : [],
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

  // Convert array of ColumnMapping to Map<string, string> for processor
  const convertMappingsArrayToMap = (mappingsArray: any[]) => {
    const map = new Map<string, string>();
    mappingsArray.forEach(mapping => {
      if (mapping.action === 'map' && mapping.excelColumn && mapping.suggestedMapping) {
        map.set(mapping.excelColumn, mapping.suggestedMapping);
      }
    });
    return map;
  };

const processFilesWithMappings = async (filesToProcess: File[], mappingsMap: Map<string, string>) => {
  try {
    console.log('processFilesWithMappings: processing files', filesToProcess, 'with mappings', mappingsMap);
    const stats = await processStudentFiles(filesToProcess);
    console.log('processFilesWithMappings: processing stats', stats);
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
        console.error(`File Processing Error - ${err.file}: ${err.error}`);
      });
    }

    // Get processed records and update context
    const processedRecords = getProcessedStudentRecords();
    console.log('Processed Records:', processedRecords);
    const newStudents = processedRecords.map(mapRecordToStudent);
    console.log('Mapped New Students:', newStudents);
    const mergedStudents = mergeStudents(students, newStudents);
    console.log('Merged Students:', mergedStudents);
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
    console.log('handleFileChange: files received', e.target.files);
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
        .filter(file => file.name.endsWith('.xlsx'))
        .map(file => ({
          file,
          progress: 0,
          status: 'pending' as const
        }));

      if (newFiles.length === 0) {
        toast({
          variant: "destructive",
          title: "Invalid file format",
          description: "Please upload Excel (.xlsx) files only.",
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

  // Handler for updating a single mapping from HeaderMapping component
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

  // Handler for saving all mappings from HeaderMapping component
  const handleSaveMappings = async () => {
    const mappingsMap = convertMappingsArrayToMap(newColumns);
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

  // Handler for refreshing data (reprocessing files)
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

  // Determine if manual mapping UI should be shown
  const showMappingUI = conflicts.length > 0 || newColumns.some(m => m.action === 'pending');

  return (
    <div className="space-y-6">
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
          accept=".xlsx"
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
            Supports .xlsx files only
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {files.map((fileData, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-4">
                      <div>
                        <FileUp className="h-8 w-8 text-muted-foreground" />
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

      {uploadSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Summary</CardTitle>
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
                <span className="text-sm text-muted-foreground">Errors</span>
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

      {/* Show HeaderMapping component when conflicts or pending mappings exist */}
      {showMappingUI && (
        <HeaderMapping
          newColumns={newColumns}
          conflicts={conflicts}
          onUpdateMapping={handleUpdateMapping}
          onSaveMappings={handleSaveMappings}
          onRefreshData={handleRefreshData}
        />
      )}
    </div>
  );
}
