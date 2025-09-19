const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// === Strict ConfigMap Handling ===
if (!process.env.DEFAULT_CITY || !process.env.API_ENDPOINT || !process.env.CITIES_CONFIG) {
  console.error("❌ Missing required ConfigMap values (DEFAULT_CITY, API_ENDPOINT, CITIES_CONFIG).");
  process.exit(1);
}

const DEFAULT_CITY = process.env.DEFAULT_CITY;
const API_ENDPOINT = process.env.API_ENDPOINT;

let citiesConfig = {};
try {
  citiesConfig = JSON.parse(process.env.CITIES_CONFIG);
} catch (err) {
  console.error("❌ Failed to parse CITIES_CONFIG:", err.message);
  process.exit(1);
}

// === Strict Secret Handling (NO FALLBACK) ===
if (!process.env.OPENWEATHER_API_KEY) {
  console.error("❌ Missing required Secret: OPENWEATHER_API_KEY.");
  process.exit(1);
}
const API_KEY = process.env.OPENWEATHER_API_KEY;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // optional demo secret

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Weather API (always real, never mock)
app.get('/api/weather', async (req, res) => {
  try {
    const cityKey = req.query.city || DEFAULT_CITY.toLowerCase();
    const city = citiesConfig[cityKey] || DEFAULT_CITY;
    const url = `${API_ENDPOINT}?q=${city}&appid=${API_KEY}&units=metric`;

    const response = await axios.get(url);
    res.json({
      source: "OpenWeather API (Live)",
      city: city,
      data: response.data
    });
  } catch (err) {
    console.error('❌ Weather fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Cities list endpoint
app.get('/api/cities', (req, res) => {
  res.json({
    cities: citiesConfig,
    defaultCity: DEFAULT_CITY
  });
});

// Demo endpoint
app.get('/api/demo/config', (req, res) => {
  res.json({
    message: 'Configuration from Kubernetes ConfigMap & Secret',
    configMap: {
      DEFAULT_CITY,
      API_ENDPOINT,
      CITIES_CONFIG: citiesConfig
    },
    secrets: {
      hasApiKey: !!API_KEY,
      hasAdminPassword: !!ADMIN_PASSWORD
    },
    source: 'Environment Variables (ConfigMap & Secret)'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Weather Backend running on port ${PORT}`);
});
