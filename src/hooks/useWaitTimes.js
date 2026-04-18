import { useState, useEffect } from 'react';
import { subscribeToLiveUpdates } from '../services/db';

export const useWaitTimes = () => {
  const [data, setData] = useState({ waitTimes: [], crowdDensity: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToLiveUpdates((newData, err) => {
      if (err) {
        setError(err);
      } else {
        setData(newData);
      }
    });
    return () => unsubscribe();
  }, []);

  return { ...data, error };
};
