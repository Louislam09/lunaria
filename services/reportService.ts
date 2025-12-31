import { getAnalytics, AnalyticsData } from './analyticsService';
import { formatDate } from '@/utils/dates';

export interface ReportData {
  title: string;
  dateRange: string;
  summary: {
    totalCycles: number;
    averageCycleLength: number;
    averagePeriodLength: number;
    regularityScore: number;
  };
  cycleTrends: Array<{
    date: string;
    cycleLength: number;
    periodLength: number;
  }>;
  symptomPatterns: Array<{
    symptom: string;
    frequency: number;
    percentage: number;
  }>;
  moodTrends: Array<{
    mood: string;
    frequency: number;
    percentage: number;
  }>;
}

/**
 * Generate report data for PDF export
 */
export async function generateReportData(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ReportData> {
  const analytics = await getAnalytics(userId);

  // Filter data by date range if provided
  let filteredTrends = analytics.cycleTrends;
  if (startDate || endDate) {
    filteredTrends = analytics.cycleTrends.filter(trend => {
      const trendDate = new Date(trend.date);
      if (startDate && trendDate < startDate) return false;
      if (endDate && trendDate > endDate) return false;
      return true;
    });
  }

  const reportTitle = startDate && endDate
    ? `Reporte de Ciclo Menstrual - ${formatDate(startDate.toISOString().split('T')[0], 'short')} a ${formatDate(endDate.toISOString().split('T')[0], 'short')}`
    : `Reporte de Ciclo Menstrual - ${formatDate(analytics.dateRange.start, 'short')} a ${formatDate(analytics.dateRange.end, 'short')}`;

  return {
    title: reportTitle,
    dateRange: `${formatDate(analytics.dateRange.start, 'long')} - ${formatDate(analytics.dateRange.end, 'long')}`,
    summary: {
      totalCycles: filteredTrends.length || analytics.totalCycles,
      averageCycleLength: analytics.averageCycleLength,
      averagePeriodLength: analytics.averagePeriodLength,
      regularityScore: analytics.cycleRegularityScore,
    },
    cycleTrends: filteredTrends.map(trend => ({
      date: formatDate(trend.date, 'long'),
      cycleLength: trend.cycleLength,
      periodLength: trend.periodLength,
    })),
    symptomPatterns: analytics.symptomPatterns.map(pattern => ({
      symptom: pattern.symptom,
      frequency: pattern.frequency,
      percentage: pattern.percentage,
    })),
    moodTrends: analytics.moodTrends.map(mood => ({
      mood: mood.mood,
      frequency: mood.frequency,
      percentage: mood.percentage,
    })),
  };
}

/**
 * Generate PDF report (placeholder - would need a PDF library like react-native-pdf or expo-print)
 * For now, returns JSON data that can be formatted as PDF
 */
export async function generatePDFReport(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<string> {
  const reportData = await generateReportData(userId, startDate, endDate);
  
  // TODO: Implement actual PDF generation using expo-print or similar
  // For now, return JSON that can be converted to PDF
  return JSON.stringify(reportData, null, 2);
}

