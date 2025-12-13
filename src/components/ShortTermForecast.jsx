import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { generateMockPredictions } from '../utils/mockData';
import './ChartConfig';

function ShortTermForecast() {
  const [predictions, setPredictions] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    // Generate 24-hour predictions
    const mockData = generateMockPredictions(24);
    setPredictions(mockData);
  }, []);

  // Chart data
  const chartData = {
    labels: predictions.map(p => p.time),
    datasets: [
      {
        label: 'Predicted Power (W)',
        data: predictions.map(p => p.predictedPower),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
      },
      ...(showComparison ? [{
        label: 'Actual Power (W)',
        data: predictions.map(p => p.actualPower),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4
      }] : [])
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
        text: 'Short-Term Solar Energy Forecast (Next 24 Hours)',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Power Output (Watts)'
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

  // Calculate statistics
  const avgPower = predictions.length > 0 
    ? Math.round(predictions.reduce((sum, p) => sum + p.predictedPower, 0) / predictions.length)
    : 0;
  
  const maxPower = predictions.length > 0
    ? Math.round(Math.max(...predictions.map(p => p.predictedPower)))
    : 0;

  const minPower = predictions.length > 0
    ? Math.round(Math.min(...predictions.map(p => p.predictedPower)))
    : 0;

  return (
    <div className="short-term-forecast">
      <h2 className="mb-4">Short-Term Forecast (GRU Model)</h2>
      
      <div className="alert alert-info">
        <strong>Model:</strong> Gated Recurrent Unit (GRU) - Optimized for next 24-hour predictions
      </div>

      {/* Controls */}
      <div className="card forecast-controls mb-4">
        <div className="form-check form-switch">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="comparisonToggle"
            checked={showComparison}
            onChange={(e) => setShowComparison(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="comparisonToggle">
            Show Predicted vs Actual Comparison
          </label>
        </div>
      </div>

      {/* Main Chart */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="chart-container" style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-value">{avgPower}W</div>
            <div className="stat-label">Average Power</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-value">{maxPower}W</div>
            <div className="stat-label">Peak Power</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-value">{minPower}W</div>
            <div className="stat-label">Minimum Power</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-value">24h</div>
            <div className="stat-label">Forecast Horizon</div>
          </div>
        </div>
      </div>

      {/* Hourly Breakdown Table */}
      <div className="card mt-4">
        <div className="card-header">
          <h5>Hourly Breakdown</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Predicted Power (W)</th>
                  {showComparison && <th>Actual Power (W)</th>}
                  {showComparison && <th>Error</th>}
                </tr>
              </thead>
              <tbody>
                {predictions.slice(0, 12).map((pred, idx) => (
                  <tr key={idx}>
                    <td>{pred.time}</td>
                    <td>{Math.round(pred.predictedPower)}</td>
                    {showComparison && <td>{Math.round(pred.actualPower)}</td>}
                    {showComparison && (
                      <td className={Math.abs(pred.predictedPower - pred.actualPower) > 50 ? 'text-danger' : 'text-success'}>
                        {Math.round(Math.abs(pred.predictedPower - pred.actualPower))}W
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted mt-2">Showing first 12 hours. Full 24-hour data available in chart.</p>
        </div>
      </div>
    </div>
  );
}

export default ShortTermForecast;