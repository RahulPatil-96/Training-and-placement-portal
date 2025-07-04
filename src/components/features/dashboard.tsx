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
import { EnhancedDashboard } from './enhanced-dashboard';

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
  // Use the enhanced dashboard component
  return <EnhancedDashboard />;
}