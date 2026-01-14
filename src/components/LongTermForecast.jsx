import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { usePredictions } from '../contexts/PredictionContext';
import '../components/ChartConfig';

function LongTermForecast() {
  const { autoformerPredictions, loading, error, lastUpdate, refreshData } = usePredictions();
  const [numPanels, setNumPanels] = useState(10);
  const [daysToShow, setDaysToShow] = useState(4); // 1, 2, 3, or 4 days (for table only)
  const [selectedDay, setSelectedDay] = useState(1); // Day to show in chart (1-4)

  // Calculate daily energy (Wh) for each day
  const calculateDailyEnergy = (day) => {
    return day.avgPower * 24; // Average power × 24 hours
  };

  // Filter predictions based on selected days (FOR TABLE ONLY)
  const displayedPredictions = autoformerPredictions.slice(0, daysToShow);

  // Calculate statistics (ALWAYS USE ALL 4 DAYS for stat cards)
  const totalEnergy = autoformerPredictions.length > 0
    ? autoformerPredictions.reduce((sum, day) => sum + calculateDailyEnergy(day), 0)
    : 0;

  const peakDay = autoformerPredictions.length > 0
    ? autoformerPredictions.reduce((max, day) => day.maxPower > max.maxPower ? day : max)
    : { date: 'N/A', maxPower: 0 };

  // Calculate statistics for DISPLAYED days (for table footer)
  const displayedTotalEnergy = displayedPredictions.reduce((sum, day) => sum + calculateDailyEnergy(day), 0);
  const displayedAvgPower = displayedPredictions.length > 0
    ? displayedPredictions.reduce((sum, day) => sum + day.avgPower, 0) / displayedPredictions.length
    : 0;
  const displayedPeakPower = displayedPredictions.length > 0
    ? Math.max(...displayedPredictions.map(day => day.maxPower))
    : 0;

  // Get hourly data for selected day (for chart)
  const [hourlyDataByDay, setHourlyDataByDay] = React.useState([]);
  
  React.useEffect(() => {
    // When predictions update, process hourly data
    if (autoformerPredictions.length > 0) {
      // Get hourly breakdown from context (96 hours total)
      // We need to fetch this from the raw autoformer forecast
      // For now, we'll simulate it based on daily data
      const simulatedHourly = autoformerPredictions.map((day, dayIndex) => {
        // Create 24 hourly points for this day
        const hours = [];
        for (let hour = 0; hour < 24; hour++) {
          // Simulate solar curve (low at night, peak at noon)
          const timeOfDay = hour / 24;
          const solarCurve = Math.sin(Math.PI * timeOfDay); // 0 at midnight, 1 at noon
          const power = day.minPower + (day.maxPower - day.minPower) * Math.max(0, solarCurve);
          
          hours.push({
            time: `${hour.toString().padStart(2, '0')}:00`,
            predictedPower: power
          });
        }
        return hours;
      });
      setHourlyDataByDay(simulatedHourly);
    }
  }, [autoformerPredictions]);

  // Get hourly data for the selected day
  const selectedDayHourly = hourlyDataByDay[selectedDay - 1] || [];

  // Chart data for selected day
  const chartData = {
    labels: selectedDayHourly.map(h => h.time),
    datasets: [
      {
        label: 'Predicted Power (W)',
        data: selectedDayHourly.map(h => h.predictedPower * numPanels),
        borderColor: 'rgb(25, 135, 84)',
        backgroundColor: 'rgba(25, 135, 84, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Hourly Forecast - Day ${selectedDay} (${autoformerPredictions[selectedDay - 1]?.date || 'N/A'})`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Power (Watts)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Hour of Day'
        }
      }
    }
  };

  if (loading && autoformerPredictions.length === 0) {
    return (
      <div className="long-term-forecast">
        <h2 className="mb-4">Long-Term Forecast (Autoformer Model)</h2>
        <div className="alert alert-info">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Loading predictions... This may take 30-60 seconds.
        </div>
      </div>
    );
  }

  return (
    <div className="long-term-forecast">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Long-Term Forecast (Autoformer Model)</h2>
        <button 
          className="btn btn-primary" 
          onClick={refreshData}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Refreshing...
            </>
          ) : (
            '🔄 Refresh Data'
          )}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button type="button" className="btn-close" onClick={() => {}}></button>
        </div>
      )}

      {lastUpdate && (
        <div className="alert alert-success">
          <strong>Last Updated:</strong> {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Controls - ABOVE TABLE */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label"><strong>Number of Solar Panels:</strong></label>
              <input 
                type="number" 
                className="form-control"
                value={numPanels}
                onChange={(e) => setNumPanels(Number(e.target.value))}
                min="1"
                max="100"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label"><strong>Display Time Frame (Table):</strong></label>
              <select 
                className="form-select"
                value={daysToShow}
                onChange={(e) => setDaysToShow(Number(e.target.value))}
              >
                <option value={1}>Tomorrow (1 Day)</option>
                <option value={2}>Next 2 Days</option>
                <option value={3}>Next 3 Days</option>
                <option value={4}>Next 4 Days (Full Forecast)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">📅 Daily Energy Production - Next {daysToShow} Day{daysToShow > 1 ? 's' : ''}</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-success">
                <tr>
                  <th>Day</th>
                  <th>Date</th>
                  <th>Avg Power (W)</th>
                  <th>Max Power (W)</th>
                  <th>Power per Panel (Wh)</th>
                  <th>Total Energy ({numPanels} panels)</th>
                </tr>
              </thead>
              <tbody>
                {displayedPredictions.map((prediction, index) => {
                  const dailyEnergy = calculateDailyEnergy(prediction);
                  return (
                    <tr key={index}>
                      <td><strong>Day {index + 1}</strong></td>
                      <td>{prediction.date}</td>
                      <td>{Math.round(prediction.avgPower)}W</td>
                      <td><strong style={{ color: '#198754' }}>{Math.round(prediction.maxPower)}W</strong></td>
                      <td>{Math.round(dailyEnergy)}Wh</td>
                      <td>
                        <strong style={{ color: '#0d6efd' }}>
                          {(dailyEnergy * numPanels / 1000).toFixed(2)}kWh
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="table-secondary">
                <tr>
                  <td colSpan="2"><strong>Total ({daysToShow} day{daysToShow > 1 ? 's' : ''})</strong></td>
                  <td>
                    <strong>Avg: {Math.round(displayedAvgPower)}W</strong>
                  </td>
                  <td>
                    <strong style={{ color: '#198754' }}>Peak: {Math.round(displayedPeakPower)}W</strong>
                  </td>
                  <td>
                    <strong>
                      {Math.round(displayedTotalEnergy)}Wh
                    </strong>
                  </td>
                  <td>
                    <strong style={{ color: '#0d6efd' }}>
                      {(displayedTotalEnergy * numPanels / 1000).toFixed(2)}kWh
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Stats Cards - BELOW TABLE (ALWAYS SHOW ALL 4 DAYS) */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-value">{numPanels}</div>
            <div className="stat-label">Solar Panels</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-value">
              {(totalEnergy * numPanels / 1000).toFixed(1)}kWh
            </div>
            <div className="stat-label">Total Production (4 days)</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-value">
              {Math.round(peakDay.maxPower * numPanels)}W
            </div>
            <div className="stat-label">Peak Day ({peakDay.date})</div>
          </div>
        </div>
      </div>

      {/* Hourly Chart for Selected Day */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">📊 Hourly Breakdown by Day</h5>
            <div style={{ minWidth: '200px' }}>
              <select 
                className="form-select form-select-sm"
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                style={{ backgroundColor: 'white' }}
              >
                <option value={1}>Day 1 - {autoformerPredictions[0]?.date || 'Tomorrow'}</option>
                <option value={2}>Day 2 - {autoformerPredictions[1]?.date || 'Day 2'}</option>
                <option value={3}>Day 3 - {autoformerPredictions[2]?.date || 'Day 3'}</option>
                <option value={4}>Day 4 - {autoformerPredictions[3]?.date || 'Day 4'}</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="chart-container" style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Autoformer Model Information */}
      <div className="card">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">ℹ️ About Autoformer Model</h5>
        </div>
        <div className="card-body">
          <p className="lead">
            The Autoformer is an advanced transformer architecture specifically designed for long-term time series forecasting with superior pattern recognition capabilities.
          </p>
          
          <div className="row">
            <div className="col-md-6">
              <h6 className="text-success">Key Features:</h6>
              <ul>
                <li><strong>Autocorrelation Mechanism:</strong> Replaces standard attention to identify recurring seasonal patterns</li>
                <li><strong>Series Decomposition:</strong> Separates trend and seasonal components for better accuracy</li>
                <li><strong>Multi-Scale Analysis:</strong> Captures both daily and weekly weather patterns</li>
                <li><strong>Direct Multi-Step Forecasting:</strong> Predicts all days simultaneously (no error propagation)</li>
              </ul>
            </div>
            
            <div className="col-md-6">
              <h6 className="text-success">Model Specifications:</h6>
              <ul>
                <li><strong>Input Window:</strong> 7 days (336 hours) of historical weather data</li>
                <li><strong>Forecast Horizon:</strong> Next 4 days (96 hours)</li>
                <li><strong>Architecture:</strong> 4 encoder layers, 2 decoder layers</li>
                <li><strong>Attention Heads:</strong> 8 multi-head attention mechanisms</li>
                <li><strong>Embedding Dimension:</strong> 128-dimensional feature space</li>
              </ul>
            </div>
          </div>

          <div className="alert alert-light mt-3">
            <h6 className="text-success">Best Use Cases:</h6>
            <ul className="mb-0">
              <li><strong>Strategic Planning:</strong> Medium-term operational scheduling and resource allocation</li>
              <li><strong>Maintenance Scheduling:</strong> Plan maintenance during low-production periods</li>
              <li><strong>Energy Trading:</strong> Multi-day market participation and contract planning</li>
              <li><strong>Seasonal Analysis:</strong> Understanding long-term weather pattern impacts</li>
            </ul>
          </div>

          <div className="alert alert-info mt-3">
            <h6 className="text-primary">How It Works:</h6>
            <p className="mb-2">
              <strong>Autocorrelation:</strong> The model identifies time-delay similarities by measuring correlation between current data and time-shifted versions, focusing on the strongest recurring patterns.
            </p>
            <p className="mb-0">
              <strong>Decomposition:</strong> Separates long-term trends (gradual changes) from seasonal components (daily/weekly cycles) for more accurate multi-day predictions.
            </p>
          </div>

          <div className="alert alert-warning mt-3">
            <strong>⏰ Update Frequency:</strong> Predictions are automatically refreshed every hour with the latest weather data from the Israel Meteorological Service (IMS).
          </div>
        </div>
      </div>
    </div>
  );
}

export default LongTermForecast;