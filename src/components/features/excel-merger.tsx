import React, { useState, useCallback } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface FileUploadState {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  errors: string[];
  warnings: string[];
}

interface MergeResult {
  success: boolean;
  output_path?: string;
  total_rows: number;
  total_columns: number;
  processing_time: number;
  errors: string[];
  warnings: string[];
  metadata: Array<{
    filename: string;
    file_size_mb: number;
    sheet_count: number;
    total_rows: number;
    processing_time: number;
    checksum: string;
    errors: string[];
    warnings: string[];
  }>;
}

export function ExcelMerger() {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const validateFile = useCallback((file: File): string[] => {
    const errors: string[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!validTypes.includes(file.type)) {
      errors.push('Invalid file type. Only .xlsx and .xls files are allowed.');
    }

    if (file.size > maxSize) {
      errors.push(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (50MB).`);
    }

    return errors;
  }, []);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileUploadState[] = [];
    const currentFileCount = files.length;

    if (currentFileCount + selectedFiles.length > 20) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: "Maximum 20 files allowed for merging."
      });
      return;
    }

    Array.from(selectedFiles).forEach(file => {
      const errors = validateFile(file);
      newFiles.push({
        file,
        status: errors.length > 0 ? 'error' : 'pending',
        progress: 0,
        errors,
        warnings: []
      });
    });

    setFiles(prev => [...prev, ...newFiles]);

    if (newFiles.some(f => f.status === 'error')) {
      toast({
        variant: "destructive",
        title: "Some files have errors",
        description: "Please check the file list for details."
      });
    }
  }, [files.length, validateFile, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setMergeResult(null);
  }, []);

  const simulateMergeProcess = useCallback(async (): Promise<MergeResult> => {
    // Simulate the Python merge_excel_files function
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalRows = Math.floor(Math.random() * 10000) + 1000;
        const totalColumns = Math.floor(Math.random() * 50) + 10;
        
        resolve({
          success: true,
          output_path: `/downloads/merged_excel_files_${Date.now()}.xlsx`,
          total_rows: totalRows,
          total_columns: totalColumns,
          processing_time: Math.random() * 30 + 5,
          errors: [],
          warnings: ['Some duplicate rows were removed', 'Column names were standardized'],
          metadata: files.map(f => ({
            filename: f.file.name,
            file_size_mb: f.file.size / 1024 / 1024,
            sheet_count: Math.floor(Math.random() * 5) + 1,
            total_rows: Math.floor(Math.random() * 1000) + 100,
            processing_time: Math.random() * 5 + 1,
            checksum: Math.random().toString(36).substring(2, 15),
            errors: f.errors,
            warnings: f.warnings
          }))
        });
      }, 3000);
    });
  }, [files]);

  const handleMergeFiles = useCallback(async () => {
    const validFiles = files.filter(f => f.status !== 'error');
    
    if (validFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No valid files",
        description: "Please add valid Excel files to merge."
      });
      return;
    }

    setIsProcessing(true);
    setMergeResult(null);

    // Update file statuses to processing
    setFiles(prev => prev.map(f => 
      f.status !== 'error' ? { ...f, status: 'processing' as const, progress: 0 } : f
    ));

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.status === 'processing' 
            ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 95) }
            : f
        ));
      }, 500);

      // Call the merge function (simulated)
      const result = await simulateMergeProcess();

      clearInterval(progressInterval);

      // Update final status
      setFiles(prev => prev.map(f => 
        f.status === 'processing' 
          ? { ...f, status: 'completed' as const, progress: 100 }
          : f
      ));

      setMergeResult(result);

      if (result.success) {
        toast({
          title: "Merge completed successfully!",
          description: `${result.total_rows} rows merged from ${validFiles.length} files.`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Merge failed",
          description: "Please check the error details below."
        });
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Merge failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred."
      });

      setFiles(prev => prev.map(f => 
        f.status === 'processing' 
          ? { ...f, status: 'error' as const, errors: ['Processing failed'] }
          : f
      ));
    } finally {
      setIsProcessing(false);
    }
  }, [files, simulateMergeProcess, toast]);

  const downloadMergedFile = useCallback(() => {
    if (mergeResult?.output_path) {
      // In a real implementation, this would trigger a file download
      const link = document.createElement('a');
      link.href = mergeResult.output_path;
      link.download = `merged_excel_files_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Your merged Excel file is being downloaded."
      });
    }
  }, [mergeResult, toast]);

  const getStatusIcon = (status: FileUploadState['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: FileUploadState['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'error':
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Excel File Merger
          </CardTitle>
          <CardDescription>
            Merge multiple Excel files (.xlsx, .xls) into a single consolidated file. 
            Maximum 20 files, 50MB each.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Excel Files</h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your Excel files here, or click to browse
            </p>
            <Button variant="outline">
              Select Files
            </Button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Files to Merge ({files.length}/20)</h4>
                <Button variant="outline" size="sm" onClick={clearAllFiles}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>

              <div className="space-y-2">
                {files.map((fileState, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(fileState.status)}
                        <div className="flex-1">
                          <div className="font-medium">{fileState.file.name}</div>
                          <div className="text-sm text-gray-500">
                            {(fileState.file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <Badge className={getStatusColor(fileState.status)}>
                          {fileState.status}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {fileState.status === 'processing' && (
                      <div className="mt-3">
                        <Progress value={fileState.progress} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">
                          Processing... {Math.round(fileState.progress)}%
                        </div>
                      </div>
                    )}

                    {fileState.errors.length > 0 && (
                      <Alert className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <ul className="list-disc list-inside">
                            {fileState.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </Card>
                ))}
              </div>

              {/* Merge Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleMergeFiles}
                  disabled={isProcessing || files.every(f => f.status === 'error')}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Merging Files...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Merge Files
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Merge Results */}
          {mergeResult && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {mergeResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  Merge Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mergeResult.success ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {mergeResult.total_rows.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">Total Rows</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {mergeResult.total_columns}
                        </div>
                        <div className="text-sm text-blue-600">Total Columns</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {files.length}
                        </div>
                        <div className="text-sm text-purple-600">Files Merged</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {mergeResult.processing_time.toFixed(1)}s
                        </div>
                        <div className="text-sm text-orange-600">Processing Time</div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={downloadMergedFile} size="lg">
                        <Download className="h-4 w-4 mr-2" />
                        Download Merged File
                      </Button>
                    </div>
                  </>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">Merge failed with the following errors:</div>
                      <ul className="list-disc list-inside">
                        {mergeResult.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {mergeResult.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">Warnings:</div>
                      <ul className="list-disc list-inside">
                        {mergeResult.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* File Metadata */}
                {mergeResult.metadata.length > 0 && (
                  <div className="mt-6">
                    <h5 className="font-semibold mb-3">File Processing Details</h5>
                    <div className="space-y-2">
                      {mergeResult.metadata.map((meta, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{meta.filename}</div>
                            <div className="text-sm text-gray-500">
                              {meta.sheet_count} sheets, {meta.total_rows} rows, {meta.file_size_mb.toFixed(2)} MB
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {meta.processing_time.toFixed(2)}s
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}