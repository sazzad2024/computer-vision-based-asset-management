#!/bin/bash

# Test script for FastAPI Backend

echo "🧪 Testing FastAPI Backend..."

# Test health/root endpoint
echo "1. Testing root endpoint..."
curl -f http://localhost:8080/ || echo "❌ FastAPI not running"

# Test docs endpoint
echo ""
echo "2. Testing API documentation..."
curl -f http://localhost:8080/docs || echo "❌ Docs not available"

# Test analyze endpoint (requires a test image file)
echo ""
echo "3. Testing analyze endpoint..."
if [ -f "test_image.jpg" ]; then
  curl -X POST http://localhost:8080/analyze/light \
    -F "file=@test_image.jpg" \
    -w "\nStatus: %{http_code}\n"
else
  echo "⚠️ No test image found (test_image.jpg)"
fi

echo ""
echo "✅ FastAPI tests completed"





