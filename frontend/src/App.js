import React, { useState, useEffect } from 'react';
import './App.css';

// Get API base URL from environment or use default for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState({});
  const [status, setStatus] = useState(null);

  // Fetch app status for debugging
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/status`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        console.log('App status:', data);
      })
      .catch((err) => {
        console.warn('Could not fetch app status:', err);
      });
  }, []);

  // Fetch cities dynamically from backend
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/cities`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data.cities || Object.keys(data.cities).length === 0) {
          setError('No cities found in configuration');
          return;
        }
        setCities(data.cities);
        const firstCityKey = Object.keys(data.cities)[0];
        if (firstCityKey) {
          setSelectedCity(firstCityKey);
        }
        setError(null); // Clear any previous errors
      })
      .catch((err) => {
        setError(`Failed to load cities: ${err.message}`);
        console.error('Cities fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch weather whenever selectedCity changes
  useEffect(() => {
    if (!selectedCity) return;

    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/weather?city=${selectedCity}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          if (!data.apiKeyConfigured) {
            setError(`API Configuration Error: ${data.error}. Please check the README for setup instructions.`);
          } else if (data.apiError) {
            setError(`Weather API Error: ${data.apiError}`);
          } else {
            setError(`Weather Error: ${data.error}`);
          }
          setWeather(null);
        } else {
          setWeather(data);
          setError(null);
        }
      })
      .catch((err) => {
        setError(`Failed to fetch weather: ${err.message}`);
        setWeather(null);
        console.error('Weather fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, [selectedCity]);

  const refreshWeather = () => {
    if (selectedCity) {
      setWeather(null);
      setError(null);
      // Trigger useEffect by setting selectedCity to itself
      setSelectedCity(prev => prev);
    }
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>Weather Dashboard</h1>
        <p>Real-time weather data from OpenWeatherMap</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
          {error.includes('API Configuration') && (
            <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
              <p>To fix this:</p>
              <ol style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
                <li>Get a free API key from <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a></li>
                <li>Set the OPENWEATHER_API_KEY environment variable</li>
                <li>Restart the application</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="controls">
        {Object.keys(cities).length > 0 && (
          <select
            className="city-selector"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={loading}
          >
            {Object.entries(cities).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        )}
        <button 
          className="refresh-btn" 
          onClick={refreshWeather}
          disabled={loading || !selectedCity}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <p>Loading weather data...</p>
        </div>
      )}

      {/* Weather Display */}
      {weather && weather.data && !loading && (
        <div className="weather-card">
          <h2>{weather.data.name}</h2>
          <div className="weather-main">
            <div className="temperature">{Math.round(weather.data.main?.temp || 0)}°C</div>
            <div className="description">{weather.data.weather?.[0]?.description || 'Unknown'}</div>
          </div>
          
          <div className="weather-details">
            <div className="detail-item">
              <span className="label">Feels like</span>
              <span className="value">{Math.round(weather.data.main?.feels_like || 0)}°C</span>
            </div>
            <div className="detail-item">
              <span className="label">Humidity</span>
              <span className="value">{weather.data.main?.humidity || 0}%</span>
            </div>
            <div className="detail-item">
              <span className="label">Pressure</span>
              <span className="value">{weather.data.main?.pressure || 0} hPa</span>
            </div>
            <div className="detail-item">
              <span className="label">Wind Speed</span>
              <span className="value">{weather.data.wind?.speed || 0} m/s</span>
            </div>
          </div>
          
          <div className="config-info">
            <p><strong>Source:</strong> {weather.source}</p>
            <p><strong>City:</strong> {weather.city}</p>
          </div>
        </div>
      )}

      {/* Status Info for Development */}
      {status && process.env.NODE_ENV === 'development' && (
        <div className="app-footer">
          <p><strong>App Status:</strong> {status.status} | <strong>API Key:</strong> {status.configuration.apiKeyConfigured ? '✅' : '❌'} | <strong>Cities:</strong> {status.configuration.citiesCount}</p>
        </div>
      )}
    </div>
  );
}

export default App;
