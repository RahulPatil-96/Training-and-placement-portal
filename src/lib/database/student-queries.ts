// =====================================================
// STUDENT DATABASE QUERIES FOR TYPESCRIPT/REACT
// =====================================================

import { Student } from '@/lib/types';

// Database connection interface (adapt to your database library)
interface DatabaseConnection {
  query: (sql: string, params?: any[]) => Promise<any[]>;
  execute: (sql: string, params?: any[]) => Promise<any>;
}

export class StudentDatabaseQueries {
  constructor(private db: DatabaseConnection) {}

  // 1. Check if student table exists
  async checkTableExists(): Promise<boolean> {
    try {
      const result = await this.db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'students'
      `);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking table existence:', error);
      return false;
    }
  }

  // 2. Get table structure
  async getTableStructure(): Promise<any[]> {
    try {
      return await this.db.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = 'students'
        ORDER BY ordinal_position
      `);
    } catch (error) {
      console.error('Error getting table structure:', error);
      throw error;
    }
  }

  // 3. Count total students
  async getTotalStudentCount(): Promise<number> {
    try {
      const result = await this.db.query('SELECT COUNT(*) as count FROM students');
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error counting students:', error);
      return 0;
    }
  }

  // 4. Get all students with comprehensive data
  async getAllStudents(): Promise<Student[]> {
    try {
      const query = `
        SELECT 
          id,
          roll_no as "rollNo",
          name,
          email,
          phone,
          address,
          date_of_birth as "dateOfBirth",
          gender,
          blood_group as "bloodGroup",
          department,
          year,
          cgpa,
          skills,
          attendance,
          backlog_count as "backlogCount",
          parent_name as "parentName",
          parent_phone as "parentPhone",
          parent_email as "parentEmail",
          is_eligible_for_placements as "isEligibleForPlacements",
          placement_status as "placementStatus",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM students
        ORDER BY department, year, name
      `;
      
      const results = await this.db.query(query);
      
      // Transform database results to Student objects
      return results.map(row => ({
        ...row,
        skills: typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills || [],
        certifications: [], // Will be loaded separately if needed
        testScores: [], // Will be loaded separately if needed
        achievements: [], // Will be loaded separately if needed
        internships: [], // Will be loaded separately if needed
        projects: [] // Will be loaded separately if needed
      }));
    } catch (error) {
      console.error('Error fetching all students:', error);
      throw error;
    }
  }

  // 5. Get students by department
  async getStudentsByDepartment(department: string): Promise<Student[]> {
    try {
      const query = `
        SELECT 
          id,
          roll_no as "rollNo",
          name,
          email,
          phone,
          department,
          year,
          cgpa,
          skills,
          is_eligible_for_placements as "isEligibleForPlacements",
          placement_status as "placementStatus",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM students
        WHERE department = $1
        ORDER BY year, name
      `;
      
      const results = await this.db.query(query, [department]);
      return this.transformResults(results);
    } catch (error) {
      console.error('Error fetching students by department:', error);
      throw error;
    }
  }

  // 6. Get students by year
  async getStudentsByYear(year: string): Promise<Student[]> {
    try {
      const query = `
        SELECT 
          id,
          roll_no as "rollNo",
          name,
          email,
          phone,
          department,
          year,
          cgpa,
          skills,
          is_eligible_for_placements as "isEligibleForPlacements",
          placement_status as "placementStatus",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM students
        WHERE year = $1
        ORDER BY department, name
      `;
      
      const results = await this.db.query(query, [year]);
      return this.transformResults(results);
    } catch (error) {
      console.error('Error fetching students by year:', error);
      throw error;
    }
  }

  // 7. Search students
  async searchStudents(searchTerm: string): Promise<Student[]> {
    try {
      const query = `
        SELECT 
          id,
          roll_no as "rollNo",
          name,
          email,
          phone,
          department,
          year,
          cgpa,
          skills,
          is_eligible_for_placements as "isEligibleForPlacements",
          placement_status as "placementStatus",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM students
        WHERE 
          name ILIKE $1 
          OR roll_no ILIKE $1 
          OR email ILIKE $1
          OR department ILIKE $1
          OR skills::text ILIKE $1
        ORDER BY name
      `;
      
      const searchPattern = `%${searchTerm}%`;
      const results = await this.db.query(query, [searchPattern]);
      return this.transformResults(results);
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  }

  // 8. Get department statistics
  async getDepartmentStatistics(): Promise<any[]> {
    try {
      return await this.db.query(`
        SELECT 
          department,
          COUNT(*) as total_students,
          AVG(cgpa) as average_cgpa,
          MIN(cgpa) as min_cgpa,
          MAX(cgpa) as max_cgpa,
          COUNT(CASE WHEN is_eligible_for_placements = true THEN 1 END) as eligible_students,
          COUNT(CASE WHEN placement_status = 'placed' THEN 1 END) as placed_students
        FROM students
        GROUP BY department
        ORDER BY total_students DESC
      `);
    } catch (error) {
      console.error('Error getting department statistics:', error);
      throw error;
    }
  }

  // 9. Get top performing students
  async getTopPerformers(limit: number = 20): Promise<Student[]> {
    try {
      const query = `
        SELECT 
          id,
          roll_no as "rollNo",
          name,
          department,
          year,
          cgpa,
          placement_status as "placementStatus"
        FROM students
        WHERE cgpa >= 8.5
        ORDER BY cgpa DESC, name
        LIMIT $1
      `;
      
      const results = await this.db.query(query, [limit]);
      return this.transformResults(results);
    } catch (error) {
      console.error('Error fetching top performers:', error);
      throw error;
    }
  }

  // 10. Validate data integrity
  async validateDataIntegrity(): Promise<{
    duplicateRollNumbers: any[];
    invalidCGPA: any[];
    invalidEmails: any[];
    missingRequiredFields: any[];
  }> {
    try {
      const [duplicateRollNumbers, invalidCGPA, invalidEmails, missingRequiredFields] = await Promise.all([
        // Check for duplicate roll numbers
        this.db.query(`
          SELECT roll_no, COUNT(*) as duplicate_count
          FROM students
          GROUP BY roll_no
          HAVING COUNT(*) > 1
        `),
        
        // Check for invalid CGPA values
        this.db.query(`
          SELECT roll_no, name, cgpa
          FROM students
          WHERE cgpa < 0 OR cgpa > 10 OR cgpa IS NULL
        `),
        
        // Check for invalid email formats
        this.db.query(`
          SELECT roll_no, name, email
          FROM students
          WHERE email IS NOT NULL 
            AND email != ''
            AND email NOT LIKE '%@%.%'
        `),
        
        // Check for missing required fields
        this.db.query(`
          SELECT roll_no, name, department, year, cgpa
          FROM students
          WHERE roll_no IS NULL 
             OR name IS NULL 
             OR name = ''
             OR department IS NULL
             OR year IS NULL
             OR cgpa IS NULL
        `)
      ]);

      return {
        duplicateRollNumbers,
        invalidCGPA,
        invalidEmails,
        missingRequiredFields
      };
    } catch (error) {
      console.error('Error validating data integrity:', error);
      throw error;
    }
  }

  // Helper method to transform database results
  private transformResults(results: any[]): Student[] {
    return results.map(row => ({
      ...row,
      skills: typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills || [],
      certifications: [],
      testScores: [],
      achievements: [],
      internships: [],
      projects: []
    }));
  }

  // 11. Create student table if it doesn't exist
  async createStudentTable(): Promise<void> {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS students (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          roll_no VARCHAR(20) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100),
          phone VARCHAR(15),
          address TEXT,
          date_of_birth DATE,
          gender VARCHAR(10),
          blood_group VARCHAR(5),
          department VARCHAR(50) NOT NULL,
          year VARCHAR(20) NOT NULL,
          cgpa DECIMAL(3,2) NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
          skills JSONB DEFAULT '[]',
          attendance INTEGER DEFAULT 0,
          backlog_count INTEGER DEFAULT 0,
          parent_name VARCHAR(100),
          parent_phone VARCHAR(15),
          parent_email VARCHAR(100),
          is_eligible_for_placements BOOLEAN DEFAULT false,
          placement_status VARCHAR(20) DEFAULT 'not_eligible',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
        CREATE INDEX IF NOT EXISTS idx_students_year ON students(year);
        CREATE INDEX IF NOT EXISTS idx_students_cgpa ON students(cgpa);
        CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
        CREATE INDEX IF NOT EXISTS idx_students_placement_status ON students(placement_status);
        CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);

        -- Create trigger to update updated_at timestamp
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_students_updated_at ON students;
        CREATE TRIGGER update_students_updated_at
          BEFORE UPDATE ON students
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `;

      await this.db.execute(createTableQuery);
      console.log('Student table created successfully');
    } catch (error) {
      console.error('Error creating student table:', error);
      throw error;
    }
  }
}

// Usage example with error handling
export async function executeStudentQueries(db: DatabaseConnection) {
  const queries = new StudentDatabaseQueries(db);

  try {
    // 1. Check if table exists
    const tableExists = await queries.checkTableExists();
    console.log('Table exists:', tableExists);

    if (!tableExists) {
      console.log('Creating student table...');
      await queries.createStudentTable();
    }

    // 2. Get table structure
    const structure = await queries.getTableStructure();
    console.log('Table structure:', structure);

    // 3. Get total count
    const totalCount = await queries.getTotalStudentCount();
    console.log('Total students:', totalCount);

    if (totalCount === 0) {
      console.log('No students found in the table');
      return;
    }

    // 4. Get all students
    const allStudents = await queries.getAllStudents();
    console.log('All students:', allStudents);

    // 5. Validate data integrity
    const validation = await queries.validateDataIntegrity();
    console.log('Data validation results:', validation);

    return allStudents;

  } catch (error) {
    console.error('Error executing student queries:', error);
    throw error;
  }
}