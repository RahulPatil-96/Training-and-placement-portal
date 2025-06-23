import { useState, useCallback } from 'react';
import { validateExcelFile, generateMockConflicts } from '@/lib/utils';

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
}

export function useFileUpload() {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => validateExcelFile(file));
    
    if (validFiles.length === 0) {
      return {
        success: false,
        error: 'Please upload Excel (.xlsx) files only.'
      };
    }

    const fileStates = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setFiles(prev => [...prev, ...fileStates]);
    return { success: true };
  }, []);

  const uploadFiles = useCallback(() => {
    if (files.length === 0) return;

    setFiles(files.map(file => ({
      ...file,
      status: 'uploading'
    })));

    files.forEach((fileData, index) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;

        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          const success = Math.random() > 0.2;

          setFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = {
              ...newFiles[index],
              progress: 100,
              status: success ? 'success' : 'error',
              errorMessage: success ? undefined : 'Failed to process file.'
            };
            return newFiles;
          });

          if (index === files.length - 1) {
            const totalRecords = Math.floor(Math.random() * 100) + 50;
            const conflicts = generateMockConflicts(totalRecords);
            
            setUploadSummary({
              studentsMatched: totalRecords,
              fieldsAdded: Math.floor(Math.random() * 10) + 5,
              conflictsTotal: conflicts.duplicates + conflicts.unmatched + conflicts.invalid,
              rowsSkipped: Math.floor(Math.random() * 5)
            });
          }
        } else {
          setFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = {
              ...newFiles[index],
              progress
            };
            return newFiles;
          });
        }
      }, 200);
    });
  }, [files]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setUploadSummary(null);
  }, []);

  return {
    files,
    uploadSummary,
    isDragging,
    setIsDragging,
    handleFiles,
    uploadFiles,
    removeFile,
    clearAll
  };
}