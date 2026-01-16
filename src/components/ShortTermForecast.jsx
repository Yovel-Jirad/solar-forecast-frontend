import React, { useState } from 'react';
import { usePredictions } from '../contexts/PredictionContext';

function ShortTermForecast() {
  const { gruPredictions, loading, error, lastUpdate, refreshData } = usePredictions();
  const [numPanels, setNumPanels] = useState(1);
  const [hoursToShow, setHoursToShow] = useState(6); // 6, 12, or 24

  // Calculate statistics
  const totalEnergy = gruPredictions.length > 0
    ? gruPredictions.reduce((sum, p) => sum + p.predictedPower, 0)
    : 0;

  const peakHour = gruPredictions.length > 0
    ? gruPredictions.reduce((max, p) => p.predictedPower > max.predictedPower ? p : max)
    : { time: 'N/A', predictedPower: 0 };

  // Filter predictions based on selected hours
  const displayedPredictions = gruPredictions.slice(0, hoursToShow);

  if (loading && gruPredictions.length === 0) {
    return (
      <div className="short-term-forecast">
        <h2 className="mb-4">Short-Term Forecast (GRU Model)</h2>
        <div className="alert alert-info">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Loading predictions... This may take 30-60 seconds.
        </div>
      </div>
    );
  }

  return (
    <div className="short-term-forecast">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Short-Term Forecast (GRU Model)</h2>
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
              <label className="form-label"><strong>Display Time Frame:</strong></label>
              <select 
                className="form-select"
                value={hoursToShow}
                onChange={(e) => setHoursToShow(Number(e.target.value))}
              >
                <option value={6}>Next 6 Hours</option>
                <option value={12}>Next 12 Hours</option>
                <option value={24}>Next 24 Hours (Full Day)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Breakdown Table */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">📊 Hourly Power Production - Next {hoursToShow} Hours</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-primary">
                <tr>
                  <th>Hour</th>
                  <th>Time</th>
                  <th>Power per Panel (W)</th>
                  <th>Total Power ({numPanels} panels)</th>
                </tr>
              </thead>
              <tbody>
                {displayedPredictions.map((prediction, index) => (
                  <tr key={index}>
                    <td><strong>Hour {index + 1}</strong></td>
                    <td>{prediction.time}</td>
                    <td>{Math.round(prediction.predictedPower)}W</td>
                    <td>
                      <strong style={{ color: '#0d6efd' }}>
                        {Math.round(prediction.predictedPower * numPanels)}W
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-secondary">
                <tr>
                  <td colSpan="2"><strong>Total ({hoursToShow} hours)</strong></td>
                  <td>
                    <strong>
                      {Math.round(displayedPredictions.reduce((sum, p) => sum + p.predictedPower, 0))}Wh
                    </strong>
                  </td>
                  <td>
                    <strong style={{ color: '#0d6efd' }}>
                      {(displayedPredictions.reduce((sum, p) => sum + p.predictedPower, 0) * numPanels / 1000).toFixed(2)}kWh
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Stats Cards - BELOW TABLE */}
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
            <div className="stat-label">Total Production (24h)</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-value">
              {Math.round(peakHour.predictedPower * numPanels)}W
            </div>
            <div className="stat-label">Peak Hour ({peakHour.time})</div>
          </div>
        </div>
      </div>

      {/* GRU Model Information */}
      <div className="card">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">ℹ️ About GRU Model (Gated Recurrent Unit)</h5>
        </div>
        <div className="card-body">
          <p className="lead">
            The GRU model is optimized for short-term solar energy forecasting with high accuracy and computational efficiency.
          </p>
          
          <div className="row">
            <div className="col-md-6">
              <h6 className="text-primary">Key Features:</h6>
              <ul>
                <li><strong>Gating Mechanisms:</strong> Uses two gates (update and reset) for efficient memory management</li>
                <li><strong>Fewer Parameters:</strong> Faster training and less prone to overfitting compared to LSTM</li>
                <li><strong>Vanishing Gradient Solution:</strong> Effectively handles long-term dependencies in weather data</li>
                <li><strong>Sequential Forecasting:</strong> Predicts one hour ahead, then uses that prediction for the next hour</li>
              </ul>
            </div>
            
            <div className="col-md-6">
              <h6 className="text-primary">Model Specifications:</h6>
              <ul>
                <li><strong>Input Window:</strong> 72 hours of historical weather data</li>
                <li><strong>Forecast Horizon:</strong> Next 24 hours (hourly predictions)</li>
                <li><strong>Architecture:</strong> Two stacked GRU layers (128 and 64 units)</li>
                <li><strong>Regularization:</strong> 20% dropout to prevent overfitting</li>
                <li><strong>Optimizer:</strong> Adam with adaptive learning rate</li>
              </ul>
            </div>
          </div>

          <div className="alert alert-light mt-3">
            <h6 className="text-success">Best Use Cases:</h6>
            <ul className="mb-0">
              <li><strong>Real-Time Operations:</strong> Immediate grid balancing and storage control decisions</li>
              <li><strong>Day-Ahead Planning:</strong> Energy trading and unit commitment scheduling</li>
              <li><strong>Grid Management:</strong> Optimal power dispatch and load forecasting</li>
            </ul>
          </div>

          <div className="alert alert-warning mt-3">
            <strong>⏰ Update Frequency:</strong> Predictions are automatically refreshed every hour with the latest weather data from the Israel Meteorological Service (IMS).
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShortTermForecast;