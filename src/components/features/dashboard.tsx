import { DollarSign, Users, TrendingUp, BriefcaseIcon, Award, BookOpen, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Cell, 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Area, 
  AreaChart,
  Brush,
  ReferenceLine,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';
import { getStudentData } from '@/lib/data-pipeline/api';
import { mockAnalytics, mockStudents } from '@/lib/mock-data';
import { Student } from '@/lib/types';
import { useStudents } from '@/contexts/StudentsContext';
import { StudentTable } from './student-table';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-lg shadow-lg border">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const [timeRange, setTimeRange] = useState('This Year');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const { theme } = useTheme();
  const { students } = useStudents();
  
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const textColor = theme === 'dark' ? '#fff' : '#000';

  // Calculate department placement rates
const departmentPlacements = mockAnalytics.departmentDistribution.map((dept: { department: string; count: number }) => {
    const placementRate = 50 + Math.floor(Math.random() * 45);
    return {
      name: dept.department,
      students: dept.count,
      placed: Math.floor(dept.count * (placementRate / 100)),
      rate: placementRate
    };
  });

// Removed unused variable 'entry' warning by renaming or removing it if present in this file

  // Get year-wise student distribution
  const yearDistribution = [
    { name: 'FY', value: students.filter((s: Student) => s.year === 'FY').length },
    { name: 'SY', value: students.filter((s: Student) => s.year === 'SY').length },
    { name: 'TY', value: students.filter((s: Student) => s.year === 'TY').length },
    { name: 'Fourth Year', value: students.filter((s: Student) => s.year === 'Fourth Year').length },
  ];

  // Generate placement data by month
  const placementByMonth = [
    { name: 'Jan', placements: 12, offers: 15, avgPackage: 5.2 },
    { name: 'Feb', placements: 15, offers: 18, avgPackage: 5.5 },
    { name: 'Mar', placements: 8, offers: 10, avgPackage: 6.0 },
    { name: 'Apr', placements: 22, offers: 25, avgPackage: 5.8 },
    { name: 'May', placements: 28, offers: 32, avgPackage: 6.2 },
    { name: 'Jun', placements: 18, offers: 20, avgPackage: 5.9 },
  ];

  // Company-wise placement data
  const companyData = [
    { name: 'TCS', offers: 45, accepted: 40 },
    { name: 'Infosys', offers: 38, accepted: 35 },
    { name: 'Wipro', offers: 30, accepted: 28 },
    { name: 'Accenture', offers: 25, accepted: 22 },
    { name: 'IBM', offers: 20, accepted: 18 },
  ];

  // Skill demand trends
  const skillTrends = [
    { name: 'React', count: 120, demand: 85 },
    { name: 'Python', count: 100, demand: 90 },
    { name: 'Java', count: 80, demand: 75 },
    { name: 'DevOps', count: 60, demand: 95 },
    { name: 'ML/AI', count: 40, demand: 100 },
  ];

  const exportChart = useCallback((chartId: string) => {
    const chartSvg = document.querySelector(`#${chartId} svg`);
    if (chartSvg) {
      const svgData = new XMLSerializer().serializeToString(chartSvg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${chartId}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
              <SelectItem value="This Year">This Year</SelectItem>
              <SelectItem value="All Time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Departments</SelectItem>
              <SelectItem value="CS">Computer Science</SelectItem>
              <SelectItem value="IT">Information Technology</SelectItem>
              <SelectItem value="ENTC">Electronics</SelectItem>
              <SelectItem value="Mechanical">Mechanical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.totalStudents}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                +12% from last semester
              </div>
              <Progress className="mt-2" value={62} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
              <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((mockAnalytics.placedStudents / mockAnalytics.eligibleForDrive) * 100).toFixed(1)}%
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                +5.2% from last year
              </div>
              <Progress className="mt-2" value={(mockAnalytics.placedStudents / mockAnalytics.eligibleForDrive) * 100} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Package</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹6.5 LPA</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                +8% from last year
              </div>
              <Progress className="mt-2" value={78} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies Visited</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">35</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                +15% from last year
              </div>
              <Progress className="mt-2" value={85} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Placement Trends</CardTitle>
              <CardDescription>Monthly placement statistics and package trends</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => exportChart('placement-trends')}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-[400px]" id="placement-trends">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={placementByMonth}>
                <defs>
                  <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={textColor} />
                <YAxis yAxisId="left" stroke={textColor} />
                <YAxis yAxisId="right" orientation="right" stroke={textColor} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="placements"
                  stroke={COLORS[0]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Placements"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="offers"
                  stroke={COLORS[1]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Offers"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgPackage"
                  stroke={COLORS[2]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Avg Package (LPA)"
                />
                <Brush dataKey="name" height={30} stroke={COLORS[0]} />
                <ReferenceLine y={20} yAxisId="left" stroke={COLORS[3]} strokeDasharray="3 3" label="Target" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Department Distribution</CardTitle>
              <CardDescription>Students across departments</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => exportChart('department-distribution')}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-[400px]" id="department-distribution">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="30%"
                outerRadius="100%"
                data={yearDistribution}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  label={{ fill: textColor, position: 'insideStart' }}
                  background={{ fill: gridColor }}
                  dataKey="value"
                >
                  {yearDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RadialBar>
                <Legend
                  iconSize={10}
                  width={120}
                  height={140}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Company-wise Placements</CardTitle>
              <CardDescription>Offers and acceptance rates by company</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => exportChart('company-placements')}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-[400px]" id="company-placements">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={companyData}>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient key={`gradient-${index}`} id={`colorBar${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0.3}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={textColor} />
                <YAxis stroke={textColor} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="offers"
                  fill={`url(#colorBar0)`}
                  name="Total Offers"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="accepted"
                  fill={`url(#colorBar1)`}
                  name="Accepted Offers"
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Skill Demand Analysis</CardTitle>
              <CardDescription>Top skills and their market demand</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => exportChart('skill-demand')}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-[400px]" id="skill-demand">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={skillTrends}>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient key={`gradient-${index}`} id={`colorArea${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={textColor} />
                <YAxis stroke={textColor} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="count"
                  stackId="1"
                  stroke={COLORS[0]}
                  fill={`url(#colorArea0)`}
                  name="Student Count"
                />
                <Area
                  type="monotone"
                  dataKey="demand"
                  stackId="2"
                  stroke={COLORS[1]}
                  fill={`url(#colorArea1)`}
                  name="Market Demand"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
            <CardDescription>Most in-demand skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
{mockAnalytics.topSkills.map((skill: { skill: string; count: number }, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="flex items-center"
                >
                  <div className="w-[30%] font-medium">{skill.skill}</div>
                  <div className="w-[60%]">
                    <Progress
                      value={(skill.count / mockAnalytics.topSkills[0].count) * 100}
                      className="h-2"
                    />
                  </div>
                  <div className="w-[10%] text-right text-sm">{skill.count}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Placement rates by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
{departmentPlacements.map((dept: { name: string; rate: number }, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-sm">{dept.rate}%</span>
                  </div>
                  <Progress value={dept.rate} className="h-2" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Distribution</CardTitle>
            <CardDescription>Salary ranges of placed students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { range: '> 12 LPA', count: 15, color: 'bg-emerald-500' },
                { range: '8-12 LPA', count: 45, color: 'bg-blue-500' },
                { range: '5-8 LPA', count: 120, color: 'bg-yellow-500' },
                { range: '< 5 LPA', count: 30, color: 'bg-red-500' },
              ].map((range, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{range.range}</span>
                    <span className="text-sm">{range.count} students</span>
                  </div>
                  <div className={`h-2 rounded-full ${range.color}`} style={{
                    width: `${(range.count / 210) * 100}%`,
                    transition: 'width 0.5s ease-in-out'
                  }} />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          <BookOpen className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
        <Button>
          <Award className="mr-2 h-4 w-4" />
          Download Analytics
        </Button>
      </div>

+      {/* Add StudentTable component connected to StudentsContext */}
+      <StudentTable students={students} />
    </div>
  );
}
