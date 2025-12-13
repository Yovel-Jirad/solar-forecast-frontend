import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { generateMockPredictions } from '../utils/mockData';
import '../components/ChartConfig'; // Import chart configuration

function Dashboard() {
  const [predictions, setPredictions] = useState([]);
  const [numPanels, setNumPanels] = useState(10);
  const [timeframe, setTimeframe] = useState(24);

  useEffect(() => {
    // Generate mock predictions
    const mockData = generateMockPredictions(timeframe);
    setPredictions(mockData);
  }, [timeframe]);

  // Prepare chart data
  const chartData = {
    labels: predictions.map(p => p.time),
    datasets: [
      {
        label: 'Predicted Power (W)',
        data: predictions.map(p => p.predictedPower * numPanels),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
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
        text: 'Solar Energy Forecast - Next 24 Hours'
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
          text: 'Time'
        }
      }
    }
  };

  return (
    <div className="dashboard">
      <h2 className="mb-4">Solar Energy Dashboard</h2>
      
      {/* Controls */}
      <div className="card forecast-controls">
        <div className="row">
          <div className="col-md-6">
            <label className="form-label">Number of Solar Panels:</label>
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
            <label className="form-label">Forecast Timeframe (hours):</label>
            <select 
              className="form-select"
              value={timeframe}
              onChange={(e) => setTimeframe(Number(e.target.value))}
            >
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="card-body">
          <div className="chart-container" style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-value">{numPanels}</div>
            <div className="stat-label">Solar Panels</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-value">{timeframe}h</div>
            <div className="stat-label">Forecast Period</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-value">
              {predictions.length > 0 
                ? Math.round(predictions[0].predictedPower * numPanels) 
                : 0}W
            </div>
            <div className="stat-label">Current Prediction</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-value">
              {predictions.length > 0 
                ? Math.round(Math.max(...predictions.map(p => p.predictedPower)) * numPanels) 
                : 0}W
            </div>
            <div className="stat-label">Peak Prediction</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;