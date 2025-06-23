import { read, utils } from 'xlsx';
import { ValidationResult } from './types';

export class FileValidator {
  private static PRN_PATTERN = /^[A-Za-z0-9]+$/;

  static async validateExcelFile(file: File): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = utils.sheet_to_json(worksheet, { header: 1 });

      // Check if file is empty
      if (data.length < 2) {
        errors.push('File is empty or contains only headers');
        return { isValid: false, errors };
      }

      // Check for PRN column
      const headers = data[0] as string[];
      const prnColumnIndex = headers.findIndex(
        header => header?.toLowerCase() === 'prn'
      );

      if (prnColumnIndex === -1) {
        errors.push('Missing required PRN column');
        return { isValid: false, errors };
      }

      // Validate PRN format for each row
      for (let i = 1; i < data.length; i++) {
        const row = data[i] as string[];
        const prn = row[prnColumnIndex];

        if (!prn) {
          errors.push(`Missing PRN in row ${i + 1}`);
          continue;
        }

        if (!this.PRN_PATTERN.test(prn)) {
          errors.push(`Invalid PRN format in row ${i + 1}: ${prn}`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      errors.push(`File processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors };
    }
  }
}