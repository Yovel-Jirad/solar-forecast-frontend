import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchPredictions, processGRUData, processAutoformerData } from '../services/api';

const PredictionContext = createContext();

export const usePredictions = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error('usePredictions must be used within PredictionProvider');
  }
  return context;
};

export const PredictionProvider = ({ children }) => {
  const [gruPredictions, setGruPredictions] = useState([]);
  const [autoformerPredictions, setAutoformerPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching predictions from backend...');
      const data = await fetchPredictions();
      
      // Process GRU data (24 hours)
      const processedGRU = processGRUData(data.gru.forecast);
      setGruPredictions(processedGRU);
      
      // Process Autoformer data (96 hours = 4 days)
      const processedAutoformer = processAutoformerData(data.autoformer.forecast);
      setAutoformerPredictions(processedAutoformer);
      
      setLastUpdate(new Date());
      console.log('Predictions updated successfully!');
      
    } catch (err) {
      setError('Failed to fetch predictions. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on app load
    fetchData();
    
    // Auto-refresh every hour
    const interval = setInterval(() => {
      console.log('Auto-refreshing predictions (hourly)...');
      fetchData();
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(interval);
  }, []);

  const value = {
    gruPredictions,
    autoformerPredictions,
    loading,
    error,
    lastUpdate,
    refreshData: fetchData
  };

  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );
};