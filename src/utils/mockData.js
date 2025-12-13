// Mock weather data generator
export const generateMockWeatherData = (hours = 24) => {
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < hours; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      temperature: 15 + Math.random() * 15, // 15-30°C
      solarRadiation: Math.max(0, 200 + Math.random() * 800), // 0-1000 W/m²
      humidity: 30 + Math.random() * 40, // 30-70%
      pressure: 1010 + Math.random() * 20 // 1010-1030 hPa
    });
  }
  
  return data;
};

// Mock solar energy predictions (using theoretical formula simulation)
export const generateMockPredictions = (hours = 24) => {
  const weatherData = generateMockWeatherData(hours);
  
  return weatherData.map(weather => {
    // Simplified PV equation: P = C * (G/G_STC) * [1 + α(T-T_STC)]
    const C_R_PV = 1000; // 1000W rated capacity
    const G_T_STC = 1000; // Standard test conditions
    const T_C_STC = 25; // 25°C standard
    const alpha_p = -0.004; // -0.4%/°C
    
    const G_T = weather.solarRadiation;
    const T_C = weather.temperature;
    
    const power = C_R_PV * (G_T / G_T_STC) * (1 + alpha_p * (T_C - T_C_STC));
    
    return {
      time: weather.time,
      predictedPower: Math.max(0, power), // No negative values
      actualPower: Math.max(0, power + (Math.random() - 0.5) * 50) // Add some variance
    };
  });
};

// Mock daily predictions for long-term forecast
export const generateDailyPredictions = (days = 4) => {
  const predictions = [];
  const today = new Date();
  
  for (let i = 1; i <= days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    predictions.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgPower: 400 + Math.random() * 400, // 400-800W average
      minPower: 100 + Math.random() * 200,
      maxPower: 600 + Math.random() * 400
    });
  }
  
  return predictions;
};

// Mock accuracy metrics
export const generateAccuracyMetrics = () => {
  return {
    mae: 45.3 + Math.random() * 10, // Mean Absolute Error
    rmse: 58.7 + Math.random() * 15, // Root Mean Square Error
    mape: 8.5 + Math.random() * 3, // Mean Absolute Percentage Error
    r2: 0.92 + Math.random() * 0.05 // R-squared
  };
};