import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState({});

  // Fetch cities dynamically from backend
  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => {
        if (!data.cities || Object.keys(data.cities).length === 0) {
          setError('No cities found in ConfigMap');
          return;
        }
        setCities(data.cities);
        const firstCityKey = Object.keys(data.cities)[0];
        if (firstCityKey) {
          setSelectedCity(firstCityKey);
        }
      })
      .catch(() => setError('Failed to load cities'));
  }, []);

  // Fetch weather whenever selectedCity changes
  useEffect(() => {
    if (!selectedCity) return;

    setLoading(true);
    fetch(`/api/weather?city=${selectedCity}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError('Weather API call failed - check Secret API key');
        } else {
          setWeather(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch weather');
        setLoading(false);
      });
  }, [selectedCity]);

  return (
    <div className="App">
      <h1>Weather Dashboard</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Dropdown populated from backend */}
      {Object.keys(cities).length > 0 && (
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          {Object.entries(cities).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      )}

      {loading && <p>Loading...</p>}
      {weather && weather.data && (
        <div>
          <h2>{weather.data.name}</h2>
          <p>Temperature: {weather.data.main?.temp} °C</p>
          <p>Weather: {weather.data.weather?.[0]?.description}</p>
          <p><strong>Source:</strong> {weather.source}</p>
        </div>
      )}
    </div>
  );
}

export default App;
