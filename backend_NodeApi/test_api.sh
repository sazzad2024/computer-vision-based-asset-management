#!/bin/bash

# Test script for Node.js Backend

echo "🧪 Testing Node.js Backend API..."

# Test health endpoint
echo "1. Testing health endpoint..."
curl -f http://localhost:3001/api/assets || echo "❌ Backend not running"

# Test asset rating endpoints
echo ""
echo "2. Testing Roadway Illumination rating..."
curl -X POST http://localhost:3001/api/assets/rate/roadway-illumination \
  -H "Content-Type: application/json" \
  -d '{"installedDate": "2015-03-20", "lastMaintainedDate": "2023-09-15"}' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "3. Testing Highway Building rating..."
curl -X POST http://localhost:3001/api/assets/rate/highway-buildings \
  -H "Content-Type: application/json" \
  -d '{"installedDate": "2005-08-30", "fciIndex": 8}' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "✅ Node.js Backend tests completed"





