import { useState, useEffect, useCallback } from 'react';
import { 
  AnalyticsSummary, 
  PlacementTrend, 
  DepartmentStats,
  SkillStat 
} from '@/lib/types';
import { DEPARTMENTS, SKILLS } from '@/lib/constants';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [timeRange, setTimeRange] = useState<string>('Last 30 Days');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const currentDate = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      
      const placementTrends: PlacementTrend[] = months.map(month => ({
        month,
        placed: Math.floor(Math.random() * 30) + 10,
        offers: Math.floor(Math.random() * 40) + 15,
        averagePackage: Math.floor(Math.random() * 5) + 5
      }));

      const departmentStats: DepartmentStats[] = DEPARTMENTS.map(dept => {
        const totalStudents = Math.floor(Math.random() * 100) + 50;
        const eligibleStudents = Math.floor(totalStudents * 0.8);
        const placedStudents = Math.floor(eligibleStudents * 0.7);
        
        return {
          department: dept,
          totalStudents,
          eligibleStudents,
          placedStudents,
          averagePackage: Math.floor(Math.random() * 5) + 5,
          topSkills: SKILLS.slice(0, 5).map(skill => ({
            skill,
            count: Math.floor(Math.random() * 50) + 10,
            demandScore: Math.random() * 100,
            averagePackage: Math.floor(Math.random() * 5) + 5,
            trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
          }))
        };
      });

      const mockAnalytics: AnalyticsSummary = {
        totalStudents: departmentStats.reduce((acc, dept) => acc + dept.totalStudents, 0),
        eligibleForDrive: departmentStats.reduce((acc, dept) => acc + dept.eligibleStudents, 0),
        placedStudents: departmentStats.reduce((acc, dept) => acc + dept.placedStudents, 0),
        averagePackage: 6.5,
        highestPackage: 12,
        placementTrends,
        departmentWiseStats: departmentStats,
        skillsDistribution: SKILLS.slice(0, 10).map(skill => ({
          skill,
          count: Math.floor(Math.random() * 100) + 20,
          demandScore: Math.random() * 100,
          averagePackage: Math.floor(Math.random() * 5) + 5,
          trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
        })),
        companyWiseOffers: [
          {
            company: 'TCS',
            offersCount: 45,
            averagePackage: 7.2,
            roles: ['Software Engineer', 'System Engineer'],
            preferredSkills: ['Java', 'Python', 'SQL'],
            acceptanceRate: 85
          },
          {
            company: 'Infosys',
            offersCount: 38,
            averagePackage: 6.8,
            roles: ['Systems Engineer', 'Power Programmer'],
            preferredSkills: ['JavaScript', 'React', 'Node.js'],
            acceptanceRate: 78
          }
        ],
        yearWiseComparison: {
          currentYear: {
            year: currentDate.getFullYear(),
            totalPlacements: 280,
            averagePackage: 6.5,
            companiesVisited: 35,
            highestPackage: 12
          },
          previousYear: {
            year: currentDate.getFullYear() - 1,
            totalPlacements: 250,
            averagePackage: 6.0,
            companiesVisited: 30,
            highestPackage: 10
          },
          growth: {
            placements: 12,
            package: 8.3,
            companies: 16.7
          }
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, timeRange]);

  const refreshAnalytics = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    timeRange,
    setTimeRange,
    loading,
    refreshAnalytics
  };
}