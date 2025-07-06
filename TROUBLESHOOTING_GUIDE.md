# Student Database Troubleshooting Guide

## 🔍 **Quick Diagnostics Checklist**

### 1. **Table Existence Check**
```sql
-- PostgreSQL/MySQL
SELECT table_name FROM information_schema.tables WHERE table_name = 'students';

-- Alternative for MySQL
SHOW TABLES LIKE '%student%';
```

**Expected Result:** Should return 'students' table name
**If Empty:** Table doesn't exist - create it using the provided schema

### 2. **Data Count Verification**
```sql
SELECT COUNT(*) as total_records FROM students;
```

**Expected Result:** Number > 0
**If Zero:** Table is empty - import data or check data insertion process

### 3. **Permission Check**
```sql
-- PostgreSQL
SELECT grantee, privilege_type FROM information_schema.role_table_grants 
WHERE table_name = 'students';

-- MySQL
SHOW GRANTS FOR CURRENT_USER();
```

**Expected Result:** SELECT, INSERT, UPDATE permissions
**If Missing:** Contact database administrator for proper permissions

### 4. **Column Structure Verification**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY ordinal_position;
```

**Expected Result:** All required columns present with correct data types

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Table 'students' doesn't exist"**

**Symptoms:**
- Error: `Table 'database.students' doesn't exist`
- Empty result from table existence query

**Solutions:**
1. **Create the table:**
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    department VARCHAR(50) NOT NULL,
    year VARCHAR(20) NOT NULL,
    cgpa DECIMAL(3,2) NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
    skills JSONB DEFAULT '[]',
    is_eligible_for_placements BOOLEAN DEFAULT false,
    placement_status VARCHAR(20) DEFAULT 'not_eligible',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

2. **Verify database connection:**
```sql
SELECT current_database(), current_user;
```

### **Issue 2: "Empty result set"**

**Symptoms:**
- Query executes but returns no rows
- COUNT(*) returns 0

**Solutions:**
1. **Check if data was inserted:**
```sql
SELECT COUNT(*) FROM students;
```

2. **Insert sample data:**
```sql
INSERT INTO students (roll_no, name, department, year, cgpa) VALUES
('CS001', 'John Doe', 'CS', 'TY', 8.5),
('IT002', 'Jane Smith', 'IT', 'SY', 9.2),
('ME003', 'Bob Johnson', 'Mechanical', 'FY', 7.8);
```

3. **Check for data in related tables:**
```sql
-- If using separate tables for different data
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.tables t2 WHERE t2.table_name = t1.table_name) as record_count
FROM information_schema.tables t1 
WHERE table_name LIKE '%student%';
```

### **Issue 3: "Access denied" or Permission errors**

**Symptoms:**
- Error: `Access denied for user 'username'@'host' to database 'database'`
- Error: `permission denied for table students`

**Solutions:**
1. **Grant necessary permissions:**
```sql
-- PostgreSQL
GRANT SELECT, INSERT, UPDATE, DELETE ON students TO username;

-- MySQL
GRANT SELECT, INSERT, UPDATE, DELETE ON database.students TO 'username'@'host';
```

2. **Check current permissions:**
```sql
-- PostgreSQL
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'students';

-- MySQL
SHOW GRANTS FOR 'username'@'host';
```

### **Issue 4: "Column doesn't exist" errors**

**Symptoms:**
- Error: `Unknown column 'column_name' in 'field list'`
- Query fails on specific column references

**Solutions:**
1. **Check actual column names:**
```sql
DESCRIBE students;
-- OR
SELECT column_name FROM information_schema.columns WHERE table_name = 'students';
```

2. **Update query with correct column names:**
```sql
-- Use exact column names from database
SELECT roll_no, name, department FROM students;  -- Not rollNo, Name, Department
```

3. **Add missing columns:**
```sql
ALTER TABLE students ADD COLUMN missing_column_name VARCHAR(100);
```

### **Issue 5: Data type mismatches**

**Symptoms:**
- Error: `Data truncated for column 'cgpa'`
- Error: `Invalid input syntax for type`

**Solutions:**
1. **Check data types:**
```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'students';
```

2. **Cast data appropriately:**
```sql
SELECT roll_no, name, CAST(cgpa AS DECIMAL(3,2)) as cgpa FROM students;
```

3. **Update column definitions:**
```sql
ALTER TABLE students MODIFY COLUMN cgpa DECIMAL(4,2);  -- MySQL
-- OR
ALTER TABLE students ALTER COLUMN cgpa TYPE DECIMAL(4,2);  -- PostgreSQL
```

## 🔧 **Database-Specific Solutions**

### **PostgreSQL**
```sql
-- Check if database exists
SELECT datname FROM pg_database WHERE datname = 'your_database';

-- Check table size
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats WHERE tablename = 'students';

-- Vacuum and analyze for performance
VACUUM ANALYZE students;
```

### **MySQL**
```sql
-- Check database
SHOW DATABASES LIKE 'your_database';

-- Check table status
SHOW TABLE STATUS LIKE 'students';

-- Optimize table
OPTIMIZE TABLE students;
```

### **SQL Server**
```sql
-- Check database
SELECT name FROM sys.databases WHERE name = 'your_database';

-- Check table info
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'students';

-- Update statistics
UPDATE STATISTICS students;
```

## 📊 **Performance Optimization**

### **Create Indexes**
```sql
CREATE INDEX idx_students_department ON students(department);
CREATE INDEX idx_students_year ON students(year);
CREATE INDEX idx_students_cgpa ON students(cgpa);
CREATE INDEX idx_students_roll_no ON students(roll_no);
```

### **Query Optimization**
```sql
-- Use LIMIT for large datasets
SELECT * FROM students ORDER BY name LIMIT 100;

-- Use specific columns instead of *
SELECT roll_no, name, department, cgpa FROM students;

-- Use WHERE clauses to filter data
SELECT * FROM students WHERE department = 'CS' AND cgpa >= 8.0;
```

## 🔍 **Debugging Steps**

### **Step 1: Connection Test**
```sql
SELECT 1 as connection_test;
```

### **Step 2: Database Context**
```sql
SELECT current_database(), current_user, version();
```

### **Step 3: Table Verification**
```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = current_database();
```

### **Step 4: Data Sample**
```sql
SELECT * FROM students LIMIT 5;
```

### **Step 5: Error Log Check**
- Check database error logs
- Review application logs
- Monitor system resources

## 📞 **Getting Help**

If issues persist:

1. **Check Database Logs:** Look for specific error messages
2. **Verify Network Connectivity:** Ensure database server is accessible
3. **Contact Database Administrator:** For permission and configuration issues
4. **Review Application Configuration:** Check connection strings and credentials
5. **Test with Database Client:** Use tools like pgAdmin, MySQL Workbench, or similar

## 🎯 **Quick Fix Commands**

```sql
-- Emergency data check
SELECT 'Table exists' as status WHERE EXISTS (SELECT 1 FROM students);

-- Quick data validation
SELECT 
    COUNT(*) as total,
    COUNT(DISTINCT roll_no) as unique_roll_numbers,
    AVG(cgpa) as avg_cgpa,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM students;

-- Find problematic records
SELECT roll_no, name, cgpa 
FROM students 
WHERE cgpa IS NULL OR cgpa < 0 OR cgpa > 10;
```