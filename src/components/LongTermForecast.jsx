import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { generateDailyPredictions } from '../utils/mockData';
import './ChartConfig';

function LongTermForecast() {
  const [predictions, setPredictions] = useState([]);
  const [forecastDays, setForecastDays] = useState(4);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    // Generate daily predictions
    const mockData = generateDailyPredictions(forecastDays);
    setPredictions(mockData);
  }, [forecastDays]);

  // Chart data for daily predictions
  const chartData = {
    labels: predictions.map(p => p.date),
    datasets: [
      {
        label: 'Maximum Power (W)',
        data: predictions.map(p => p.maxPower),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2
      },
      {
        label: 'Average Power (W)',
        data: predictions.map(p => p.avgPower),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2
      },
      {
        label: 'Minimum Power (W)',
        data: predictions.map(p => p.minPower),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 2
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
        text: 'Long-Term Solar Energy Forecast (Multi-Day Prediction)',
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
          text: 'Date'
        }
      }
    }
  };

  // Calculate total energy over forecast period (in kWh)
  const totalEnergy = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + (p.avgPower * 24 / 1000), 0) * 10) / 10
    : 0;

  const avgDailyPower = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + p.avgPower, 0) / predictions.length)
    : 0;

  return (
    <div className="long-term-forecast">
      <h2 className="mb-4">Long-Term Forecast (Autoformer Model)</h2>
      
      <div className="alert alert-info">
        <strong>Model:</strong> Autoformer - Advanced transformer architecture with autocorrelation for 2-4 day predictions
      </div>

      {/* Controls */}
      <div className="card forecast-controls mb-4">
        <div className="row">
          <div className="col-md-6">
            <label className="form-label">Forecast Period (Days):</label>
            <select 
              className="form-select"
              value={forecastDays}
              onChange={(e) => setForecastDays(Number(e.target.value))}
            >
              <option value="2">2 days</option>
              <option value="3">3 days</option>
              <option value="4">4 days</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Chart Type:</label>
            <select 
              className="form-select"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="chart-container" style={{ height: '400px' }}>
            {chartType === 'bar' ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-value">{avgDailyPower}W</div>
            <div className="stat-label">Avg Daily Power</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-value">{totalEnergy} kWh</div>
            <div className="stat-label">Total Energy</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-value">{forecastDays} days</div>
            <div className="stat-label">Forecast Horizon</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-value">
              {predictions.length > 0 ? Math.round(predictions[0].maxPower) : 0}W
            </div>
            <div className="stat-label">Tomorrow's Peak</div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <h5>Daily Breakdown</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Min Power (W)</th>
                  <th>Avg Power (W)</th>
                  <th>Max Power (W)</th>
                  <th>Daily Energy (kWh)</th>
                  <th>Weather Pattern</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred, idx) => (
                  <tr key={idx}>
                    <td><strong>{pred.date}</strong></td>
                    <td>{Math.round(pred.minPower)}</td>
                    <td>{Math.round(pred.avgPower)}</td>
                    <td>{Math.round(pred.maxPower)}</td>
                    <td>{Math.round(pred.avgPower * 24 / 100) / 10}</td>
                    <td>
                      <span className={`badge ${pred.avgPower > 600 ? 'bg-success' : pred.avgPower > 400 ? 'bg-warning' : 'bg-secondary'}`}>
                        {pred.avgPower > 600 ? 'Clear Sky' : pred.avgPower > 400 ? 'Partly Cloudy' : 'Overcast'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Model Information */}
      <div className="card mt-4">
        <div className="card-header">
          <h5>About Autoformer Model</h5>
        </div>
        <div className="card-body">
          <p>
            The Autoformer architecture uses <strong>autocorrelation mechanisms</strong> to identify 
            recurring patterns in weather data, making it ideal for multi-day solar energy forecasting.
          </p>
          <ul>
            <li><strong>Encoder Layers:</strong> 4 layers for pattern recognition</li>
            <li><strong>Decoder Layers:</strong> 2 layers for prediction generation</li>
            <li><strong>Attention Heads:</strong> 8 heads for multi-scale analysis</li>
            <li><strong>Decomposition:</strong> Separates trend and seasonal components</li>
          </ul>
          <p className="mb-0">
            <strong>Best for:</strong> Strategic planning, maintenance scheduling, and medium-term energy management.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LongTermForecast;