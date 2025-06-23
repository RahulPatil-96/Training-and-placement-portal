import { Department, Year } from '../types';
import { ProcessedData, StudentRecord } from './types';
import { DataProcessor } from './processor';

const processor = new DataProcessor();

export async function processStudentFiles(files: File[]) {
  return await processor.processFiles(files);
}

export function getStudentData(department?: Department, year?: Year): ProcessedData | null {
  if (processor.shouldRefresh()) {
    return null; // Trigger reprocessing
  }
  return processor.getData(department, year);
}

// New function to get all processed student records from latest processing
export function getProcessedStudentRecords(): StudentRecord[] {
  const data = processor.getData();
  if (!data) return [];
  const records: StudentRecord[] = [];
  for (const dept of Object.values(data.departments)) {
    if (!dept) continue;
    for (const yearRecords of Object.values(dept)) {
      if (!yearRecords) continue;
      records.push(...yearRecords);
    }
  }
  return records;
}
