import { ZONES_ARRAY } from '../constants/ZONES';
import { CROWD_LEVELS } from '../constants/CROWD_LEVELS';

let subscribers = [];
let mockDataInterval = null;

const createMockData = () => {
  const waitTimes = ZONES_ARRAY.map(zone => ({
    zone,
    time: Math.floor(Math.random() * 15) // 0 to 14 mins
  }));
  const crowdDensity = ZONES_ARRAY.map(zone => ({
    zone,
    level: Math.random() > 0.7 ? CROWD_LEVELS.HIGH : Math.random() > 0.4 ? CROWD_LEVELS.MEDIUM : CROWD_LEVELS.LOW
  }));
  return { waitTimes, crowdDensity };
};

/**
 * Subscribes to live crowd and wait time data via simulated polling (acting as Google Sheets proxy).
 * @param {Function} callback (data, error) => void 
 * @returns {Function} unsubscribe function
 */
export const subscribeToLiveUpdates = (callback) => {
  subscribers.push(callback);
  
  // Initial immediate call
  callback(createMockData(), null);

  if (!mockDataInterval) {
    mockDataInterval = setInterval(() => {
      const data = createMockData();
      subscribers.forEach(cb => cb(data, null));
    }, 30000); // Poll every 30s as per requirement
  }

  return () => {
    subscribers = subscribers.filter(cb => cb !== callback);
    if (subscribers.length === 0) {
      clearInterval(mockDataInterval);
      mockDataInterval = null;
    }
  };
};

// Simple global memory for reports
const globalReports = [];

export const submitReport = async (reportText) => {
  return new Promise(resolve => {
    setTimeout(() => {
      globalReports.push(reportText);
      if (globalReports.length > 5) globalReports.shift();
      resolve();
    }, 500);
  });
};

export const fetchRecentReports = async () => {
  return new Promise(resolve => {
    setTimeout(() => resolve([...globalReports]), 200);
  });
};
