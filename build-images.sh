#!/bin/bash
# Build Docker images for Weather App
# Usage: ./build-images.sh [tag]

set -e

# Default tag
TAG=${1:-latest}

echo "🐳 Building Weather App Docker Images"
echo "====================================="
echo "Tag: $TAG"
echo ""

# Build backend image
echo "🔧 Building backend image..."
docker build -t balakrishna625/weather-backend:$TAG ./backend
echo "✅ Backend image built: balakrishna625/weather-backend:$TAG"

# Build frontend image
echo ""
echo "🎨 Building frontend image..."
docker build -t balakrishna625/weather-frontend:$TAG ./frontend
echo "✅ Frontend image built: balakrishna625/weather-frontend:$TAG"

echo ""
echo "🎉 All images built successfully!"
echo ""
echo "📋 Built images:"
echo "- balakrishna625/weather-backend:$TAG"
echo "- balakrishna625/weather-frontend:$TAG"
echo ""
echo "🚀 To run with Docker Compose:"
echo "1. Update docker-compose.yml with your API key"
echo "2. Run: docker-compose up -d"
echo ""
echo "☸️  To push to Docker Hub:"
echo "docker push balakrishna625/weather-backend:$TAG"
echo "docker push balakrishna625/weather-frontend:$TAG"