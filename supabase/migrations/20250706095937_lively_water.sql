-- =====================================================
-- STUDENT DATABASE QUERIES AND TROUBLESHOOTING
-- =====================================================

-- 1. CHECK IF STUDENT TABLE EXISTS
-- =====================================================
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name = 'students' 
   OR table_name = 'student';

-- Alternative for MySQL
SHOW TABLES LIKE '%student%';

-- Alternative for PostgreSQL
SELECT tablename 
FROM pg_tables 
WHERE tablename LIKE '%student%';

-- 2. GET TABLE STRUCTURE/SCHEMA
-- =====================================================
-- For PostgreSQL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- For MySQL
DESCRIBE students;
-- OR
SHOW COLUMNS FROM students;

-- For SQL Server
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'students'
ORDER BY ORDINAL_POSITION;

-- 3. CHECK TABLE PERMISSIONS
-- =====================================================
-- For PostgreSQL
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'students';

-- For MySQL
SHOW GRANTS FOR CURRENT_USER();

-- 4. COUNT TOTAL RECORDS
-- =====================================================
SELECT COUNT(*) as total_students FROM students;

-- 5. CHECK FOR ANY DATA (LIMIT 5 RECORDS)
-- =====================================================
SELECT * FROM students LIMIT 5;

-- 6. COMPREHENSIVE STUDENT DATA EXTRACTION
-- =====================================================
SELECT 
    -- Basic Information
    s.id as student_id,
    s.roll_no,
    s.name as full_name,
    s.email,
    s.phone,
    s.date_of_birth,
    s.gender,
    s.blood_group,
    
    -- Academic Information
    s.department,
    s.year,
    s.cgpa,
    s.attendance,
    s.backlog_count,
    
    -- Contact Information
    s.address,
    s.parent_name,
    s.parent_phone,
    s.parent_email,
    
    -- Placement Information
    s.is_eligible_for_placements,
    s.placement_status,
    
    -- Skills (if stored as JSON or text)
    s.skills,
    
    -- Metadata
    s.created_at as enrollment_date,
    s.updated_at as last_modified,
    
    -- Calculated Fields
    CASE 
        WHEN s.cgpa >= 9.0 THEN 'Excellent'
        WHEN s.cgpa >= 8.0 THEN 'Very Good'
        WHEN s.cgpa >= 7.0 THEN 'Good'
        WHEN s.cgpa >= 6.0 THEN 'Average'
        ELSE 'Below Average'
    END as performance_grade,
    
    CASE 
        WHEN s.is_eligible_for_placements = true THEN 'Eligible'
        ELSE 'Not Eligible'
    END as placement_eligibility_status,
    
    -- Age calculation (assuming date_of_birth exists)
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.date_of_birth)) as age

FROM students s
ORDER BY s.department, s.year, s.name;

-- 7. STUDENT SUMMARY BY DEPARTMENT
-- =====================================================
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
ORDER BY total_students DESC;

-- 8. STUDENT SUMMARY BY YEAR
-- =====================================================
SELECT 
    year,
    COUNT(*) as total_students,
    AVG(cgpa) as average_cgpa,
    COUNT(CASE WHEN cgpa >= 8.0 THEN 1 END) as high_performers,
    COUNT(CASE WHEN is_eligible_for_placements = true THEN 1 END) as eligible_for_placement
FROM students
GROUP BY year
ORDER BY year;

-- 9. TOP PERFORMING STUDENTS
-- =====================================================
SELECT 
    roll_no,
    name,
    department,
    year,
    cgpa,
    placement_status
FROM students
WHERE cgpa >= 8.5
ORDER BY cgpa DESC, name
LIMIT 20;

-- 10. STUDENTS WITH PLACEMENT DETAILS
-- =====================================================
SELECT 
    s.roll_no,
    s.name,
    s.department,
    s.year,
    s.cgpa,
    s.placement_status,
    s.is_eligible_for_placements,
    s.skills
FROM students s
WHERE s.is_eligible_for_placements = true
ORDER BY s.placement_status, s.cgpa DESC;

-- 11. TROUBLESHOOTING QUERIES
-- =====================================================

-- Check if table is empty
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'Table is empty'
        ELSE CONCAT('Table contains ', COUNT(*), ' records')
    END as table_status
FROM students;

-- Check for NULL values in key fields
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN id IS NULL THEN 1 END) as null_ids,
    COUNT(CASE WHEN name IS NULL OR name = '' THEN 1 END) as null_names,
    COUNT(CASE WHEN roll_no IS NULL OR roll_no = '' THEN 1 END) as null_roll_numbers,
    COUNT(CASE WHEN department IS NULL THEN 1 END) as null_departments,
    COUNT(CASE WHEN cgpa IS NULL THEN 1 END) as null_cgpa
FROM students;

-- Check data types and constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- 12. ADVANCED QUERIES WITH JOINS (if related tables exist)
-- =====================================================

-- Students with their certifications
SELECT 
    s.roll_no,
    s.name,
    s.department,
    c.name as certification_name,
    c.provider,
    c.issue_date,
    c.score
FROM students s
LEFT JOIN certifications c ON s.id = c.student_id
ORDER BY s.name, c.issue_date DESC;

-- Students with their test scores
SELECT 
    s.roll_no,
    s.name,
    s.department,
    t.test_name,
    t.score,
    t.max_score,
    t.date as test_date
FROM students s
LEFT JOIN test_scores t ON s.id = t.student_id
ORDER BY s.name, t.date DESC;

-- Students with their projects
SELECT 
    s.roll_no,
    s.name,
    s.department,
    p.title as project_title,
    p.description,
    p.start_date,
    p.end_date,
    p.type as project_type
FROM students s
LEFT JOIN projects p ON s.id = p.student_id
ORDER BY s.name, p.start_date DESC;

-- 13. PERFORMANCE OPTIMIZATION QUERIES
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_year ON students(year);
CREATE INDEX IF NOT EXISTS idx_students_cgpa ON students(cgpa);
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_placement_status ON students(placement_status);

-- Analyze table statistics
ANALYZE students;

-- 14. DATA VALIDATION QUERIES
-- =====================================================

-- Check for duplicate roll numbers
SELECT 
    roll_no,
    COUNT(*) as duplicate_count
FROM students
GROUP BY roll_no
HAVING COUNT(*) > 1;

-- Check for invalid CGPA values
SELECT 
    roll_no,
    name,
    cgpa
FROM students
WHERE cgpa < 0 OR cgpa > 10 OR cgpa IS NULL;

-- Check for invalid email formats
SELECT 
    roll_no,
    name,
    email
FROM students
WHERE email IS NOT NULL 
  AND email != ''
  AND email NOT LIKE '%@%.%';

-- Check for students without required fields
SELECT 
    roll_no,
    name,
    department,
    year,
    cgpa
FROM students
WHERE roll_no IS NULL 
   OR name IS NULL 
   OR name = ''
   OR department IS NULL
   OR year IS NULL
   OR cgpa IS NULL;