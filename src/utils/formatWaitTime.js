import { WAIT_THRESHOLDS } from '../constants/WAIT_THRESHOLDS';

/**
 * Formats wait time in minutes to visually relevant threshold objects
 * @param {number} minutes 
 * @returns {{ color: string, label: string }}
 */
export const formatWaitTime = (minutes) => {
  if (minutes < 0) minutes = 0;
  if (minutes <= WAIT_THRESHOLDS.LOW.max) return WAIT_THRESHOLDS.LOW;
  if (minutes <= WAIT_THRESHOLDS.MEDIUM.max) return WAIT_THRESHOLDS.MEDIUM;
  return WAIT_THRESHOLDS.HIGH;
};
