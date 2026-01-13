import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchPredictions, processGRUData } from '../services/api';
import './ChartConfig';

function ShortTermForecast() {
  const [predictions, setPredictions] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchPredictions();
      const processedData = processGRUData(data.gru.forecast);
      setPredictions(processedData);
      setLastUpdate(new Date());
      
    } catch (err) {
      setError('Failed to fetch predictions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
    }, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

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
        label: 'Simulated Actual (W)',
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

  const avgPower = predictions.length > 0 
    ? Math.round(predictions.reduce((sum, p) => sum + p.predictedPower, 0) / predictions.length)
    : 0;
  
  const maxPower = predictions.length > 0
    ? Math.round(Math.max(...predictions.map(p => p.predictedPower)))
    : 0;

  const minPower = predictions.length > 0
    ? Math.round(Math.min(...predictions.map(p => p.predictedPower)))
    : 0;

  if (loading && predictions.length === 0) {
    return (
      <div className="short-term-forecast">
        <h2 className="mb-4">Short-Term Forecast (GRU Model)</h2>
        <div className="alert alert-info">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Loading predictions from backend...
        </div>
      </div>
    );
  }

  return (
    <div className="short-term-forecast">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Short-Term Forecast (GRU Model)</h2>
        <button 
          className="btn btn-primary" 
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {lastUpdate && (
        <div className="alert alert-success">
          <strong>Last Updated:</strong> {lastUpdate.toLocaleTimeString()}
        </div>
      )}
      
      <div className="alert alert-info">
        <strong>Model:</strong> Gated Recurrent Unit (GRU) - Optimized for next 24-hour predictions
      </div>

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
            Show Predicted vs Simulated Actual Comparison
          </label>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="chart-container" style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

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

      <div className="card mt-4">
        <div className="card-header">
          <h5>Hourly Breakdown (First 12 Hours)</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Predicted Power (W)</th>
                  {showComparison && <th>Simulated Actual (W)</th>}
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
        </div>
      </div>
    </div>
  );
}

export default ShortTermForecast;