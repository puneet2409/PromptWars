import { useState, useCallback } from 'react';
import { submitReport, fetchRecentReports } from '../services/db';
import { sanitize } from '../utils/sanitize';

export const useCrowdReports = () => {
  const [reports, setReports] = useState([]);

  const refreshReports = useCallback(async () => {
    const fetched = await fetchRecentReports();
    setReports(fetched);
  }, []);

  const addReport = useCallback(async (rawText) => {
    const cleanText = sanitize(rawText);
    if (!cleanText) return;
    await submitReport(cleanText);
    await refreshReports();
  }, [refreshReports]);

  return { reports, addReport, refreshReports };
};
