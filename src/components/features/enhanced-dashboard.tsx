import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Users, TrendingUp, BriefcaseIcon, Award, BookOpen, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';
import { useStudents } from '@/contexts/StudentsContext';
import { analyticsEngine, AnalyticsMetrics } from '@/lib/analytics/analytics-engine';
import { AnalyticsSummary } from '@/lib/types';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function EnhancedDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme } = useTheme();
  const { students } = useStudents();

  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const textColor = theme === 'dark' ? '#fff' : '#000';

  // Load analytics data
  const loadAnalytics = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      if (forceRefresh) {
        setIsRefreshing(true);
        await analyticsEngine.clearCache();
      }

      const [analyticsData, metricsData] = await Promise.all([
        analyticsEngine.generateAnalyticsSummary(students),
        analyticsEngine.calculateMetrics(students)
      ]);

      setAnalytics(analyticsData);
      setMetrics(metricsData);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [students]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = analyticsEngine.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setLastUpdated(new Date().toLocaleString());
    });

    return unsubscribe;
  }, []);

  // Load data on mount and when students change
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const handleRefresh = () => {
    loadAnalytics(true);
  };

  if (isLoading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics || !metrics) {
    return (
      <Alert>
        <AlertDescription>
          No analytics data available. Please upload and process student data first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Real-time Update Indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Updating analytics with latest data...
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="text-2xl font-bold">{metrics.totalStudents}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                Real-time count
              </div>
              <Progress className="mt-2" value={85} />
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
                {metrics.placementRate.toFixed(1)}%
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                {metrics.placedStudents} of {metrics.eligibleStudents} eligible
              </div>
              <Progress className="mt-2" value={metrics.placementRate} />
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
              <div className="text-2xl font-bold">₹{metrics.averagePackage.toFixed(1)} LPA</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                Highest: ₹{metrics.highestPackage.toFixed(1)} LPA
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
              <CardTitle className="text-sm font-medium">Eligible Students</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.eligibleStudents}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                {((metrics.eligibleStudents / metrics.totalStudents) * 100).toFixed(1)}% of total
              </div>
              <Progress className="mt-2" value={(metrics.eligibleStudents / metrics.totalStudents) * 100} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Department-wise Statistics</CardTitle>
              <CardDescription>Student distribution and placement rates by department</CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={metrics.departmentWiseStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="department" stroke={textColor} />
                <YAxis stroke={textColor} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="totalStudents"
                  fill={COLORS[0]}
                  name="Total Students"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="eligibleStudents"
                  fill={COLORS[1]}
                  name="Eligible Students"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="placedStudents"
                  fill={COLORS[2]}
                  name="Placed Students"
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Year Distribution</CardTitle>
              <CardDescription>Students by academic year</CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="30%"
                outerRadius="100%"
                data={Object.entries(metrics.yearWiseDistribution).map(([year, count]) => ({
                  name: year,
                  value: count
                }))}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  label={{ fill: textColor, position: 'insideStart' }}
                  background={{ fill: gridColor }}
                  dataKey="value"
                >
                  {Object.entries(metrics.yearWiseDistribution).map(([_, __], index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RadialBar>
                <Legend />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Skills Distribution</CardTitle>
            <CardDescription>Most popular skills among students</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.skillsDistribution.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="skill" stroke={textColor} />
                <YAxis stroke={textColor} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS[0]}
                  fill={COLORS[0]}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CGPA Distribution</CardTitle>
            <CardDescription>Academic performance distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={Object.entries(metrics.cgpaDistribution).map(([range, count]) => ({
                range,
                count
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="range" stroke={textColor} />
                <YAxis stroke={textColor} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill={COLORS[1]}
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Freshness Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Live Data</span>
              <Badge variant="outline" className="text-xs">
                Auto-refresh enabled
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Based on {metrics.totalStudents} student records • Updated {lastUpdated}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}