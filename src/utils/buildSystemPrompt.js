import { SYSTEM_PROMPTS } from '../constants/SYSTEM_PROMPTS';

/**
 * Compiles the system prompt by replacing placeholders with live data.
 * @param {string} seat 
 * @param {Array<{zone: string, time: number}>} waitTimes 
 * @param {Array<{zone: string, level: string}>} density 
 * @param {Array<string>} reports 
 * @returns {string} formatted prompt
 */
export const buildSystemPrompt = (seat, waitTimes = [], density = [], reports = []) => {
  const waitTimesContext = waitTimes.map(w => `${w.zone}: ${w.time}min`).join(' | ') || 'No data';
  const densityContext = density.map(d => `${d.zone}: ${d.level}`).join(' | ') || 'No data';
  const reportsContext = reports.length ? reports.join(' | ') : 'No recent reports';

  return SYSTEM_PROMPTS.ASSISTANT_NARRATIVE
    .replace('{seatContext}', seat || 'Unknown')
    .replace('{waitTimesContext}', waitTimesContext)
    .replace('{densityContext}', densityContext)
    .replace('{reportsContext}', reportsContext);
};
