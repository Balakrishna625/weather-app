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

// === Environment Configuration with Development Fallbacks ===
const DEFAULT_CITY = process.env.DEFAULT_CITY || "London";
const API_ENDPOINT = process.env.API_ENDPOINT || "http://api.openweathermap.org/data/2.5/weather";

let citiesConfig = {};
try {
  citiesConfig = process.env.CITIES_CONFIG 
    ? JSON.parse(process.env.CITIES_CONFIG)
    : {
        "london": "London,UK",
        "tokyo": "Tokyo,JP",
        "newyork": "New York,US",
        "sydney": "Sydney,AU",
        "paris": "Paris,FR"
      };
} catch (err) {
  console.error("❌ Failed to parse CITIES_CONFIG:", err.message);
  console.log("Using default cities configuration");
  citiesConfig = {
    "london": "London,UK",
    "tokyo": "Tokyo,JP",
    "newyork": "New York,US",
    "sydney": "Sydney,AU",
    "paris": "Paris,FR"
  };
}

// === API Key Handling ===
const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) {
  console.warn("⚠️  Warning: No OPENWEATHER_API_KEY provided. Weather API calls will fail.");
  console.log("Please set OPENWEATHER_API_KEY environment variable with a valid OpenWeatherMap API key.");
  console.log("Get your free API key at: https://openweathermap.org/api");
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // optional demo secret

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Weather API (always real, never mock)
app.get('/api/weather', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ 
        error: 'OpenWeather API key not configured. Please set OPENWEATHER_API_KEY environment variable.',
        apiKeyConfigured: false,
        helpUrl: 'https://openweathermap.org/api'
      });
    }

    const cityKey = req.query.city || DEFAULT_CITY.toLowerCase();
    const city = citiesConfig[cityKey] || DEFAULT_CITY;
    const url = `${API_ENDPOINT}?q=${city}&appid=${API_KEY}&units=metric`;

    console.log(`🌤️  Fetching weather for ${city}...`);
    const response = await axios.get(url);
    res.json({
      source: "OpenWeather API (Live)",
      city: city,
      data: response.data,
      apiKeyConfigured: true
    });
  } catch (err) {
    console.error('❌ Weather fetch error:', err.message);
    
    if (err.response) {
      // API responded with error
      const status = err.response.status;
      const data = err.response.data;
      
      if (status === 401) {
        return res.status(401).json({ 
          error: 'Invalid API key. Please check your OPENWEATHER_API_KEY.',
          apiKeyConfigured: !!API_KEY,
          apiError: data.message || 'Unauthorized'
        });
      } else if (status === 404) {
        return res.status(404).json({ 
          error: `City not found: ${req.query.city || DEFAULT_CITY}`,
          apiKeyConfigured: !!API_KEY,
          apiError: data.message || 'City not found'
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      apiKeyConfigured: !!API_KEY,
      details: err.message 
    });
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

// Status endpoint for debugging
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: PORT
    },
    configuration: {
      DEFAULT_CITY,
      API_ENDPOINT,
      citiesCount: Object.keys(citiesConfig).length,
      apiKeyConfigured: !!API_KEY,
      adminPasswordConfigured: !!ADMIN_PASSWORD
    },
    cities: citiesConfig
  });
});

app.listen(PORT, () => {
  console.log(`✅ Weather Backend running on port ${PORT}`);
});
