require('dotenv').config();
const express = require('express');
const cors = require("cors");
const path = require("path");

const assetRoutes = require('./routes/assetRoutes');

const app = express();

// ✅ Use only one CORS configuration
const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// Ensure runtime directories exist (ephemeral in Cloud Run)
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// API routes
app.use('/api/assets', assetRoutes);

// Also serve the output images as static files
app.use('/output', express.static(path.join(__dirname, 'output')));

// Download endpoint for processed CSV files

app.get('/api/assets/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'output', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ error: 'Error downloading file' });
      }
    });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});



module.exports = app;
