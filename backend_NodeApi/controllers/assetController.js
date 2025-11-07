const RoadwayIlluminationService = require('../services/RoadwayIlluminationService');
const rateHigwayBuilding=require('../services/HigwayBuildingService');
const TrafficSignService = require('../services/TrafficSignService');
const TrafficSignalService = require('../services/TrafficSignalService');
const PavementMarkingService = require('../services/PavementMarkingService');
const { validateRoadwayAssetInput, validateHighwayBuilding, validateTrafficSign, validateTrafficSignal, validatePavementMarking } = require('../utils/validator');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

exports.rateRoadwayAsset = (req, res) => {
  const { installedDate, lastMaintainedDate } = req.body;

  const validationError = validateRoadwayAssetInput(installedDate, lastMaintainedDate);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const rating = RoadwayIlluminationService.getAssetRating(installedDate, lastMaintainedDate);

  return res.status(200).json({ rating });
};

exports.rateHigwayBuilding= (req,res)=>{
  const { installedDate, fciIndex } = req.body;

  const validationError = validateHighwayBuilding(installedDate, fciIndex);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const rating = rateHigwayBuilding.getAssetRating(installedDate, fciIndex);

  return res.status(200).json({ rating });
}

exports.rateTrafficSign = (req, res) => {
  const { installedDate, lastMaintainedDate } = req.body;

  const validationError = validateTrafficSign(installedDate, lastMaintainedDate);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const rating = TrafficSignService.getAssetRating(installedDate, lastMaintainedDate);

  return res.status(200).json({ rating });
};

exports.rateTrafficSignal = (req, res) => {
  const { installedDate, lastMaintainedDate } = req.body;

  const validationError = validateTrafficSignal(installedDate, lastMaintainedDate);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const rating = TrafficSignalService.getAssetRating(installedDate, lastMaintainedDate);

  return res.status(200).json({ rating });
};

exports.ratePavementMarking = (req, res) => {
  const { installedDate, lastMaintainedDate, rrIndex } = req.body;

  const validationError = validatePavementMarking(installedDate, lastMaintainedDate, rrIndex);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const rating = PavementMarkingService.getAssetRating(installedDate, lastMaintainedDate, rrIndex);

  return res.status(200).json({ rating });
};

exports.rateAssetsFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    const csvFilePath = req.file.path;
    const results = [];
    const processedAssets = [];

    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    // Process each row
    for (const row of results) {
      const assetType = row.assetType?.toLowerCase();
      let rating = 'Invalid Asset Type';

      // Helper function to convert string to number safely
      const parseNumber = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      if (assetType === 'roadway illumination') {
        // Allow empty lastMaintainedDate for roadway illumination
        if (!row.lastMaintainedDate || (typeof row.lastMaintainedDate === 'string' && row.lastMaintainedDate.trim() === '')) {
          rating = 'No maintenance data';
        } else {
          const validationError = validateRoadwayAssetInput(row.installedDate, row.lastMaintainedDate);
          if (!validationError) {
            rating = RoadwayIlluminationService.getAssetRating(row.installedDate, row.lastMaintainedDate);
          } else {
            rating = `Validation Error: ${validationError}`;
          }
        }
      } else if (assetType === 'highway building') {
        const fciIndex = parseNumber(row.fciIndex);
        if (fciIndex === null) {
          rating = 'Missing FCI Index';
        } else {
          const validationError = validateHighwayBuilding(row.installedDate, fciIndex);
          if (!validationError) {
            rating = rateHigwayBuilding.getAssetRating(row.installedDate, fciIndex);
          } else {
            rating = `Validation Error: ${validationError}`;
          }
        }
      } else if (assetType === 'traffic sign') {
        if (!row.lastMaintainedDate || (typeof row.lastMaintainedDate === 'string' && row.lastMaintainedDate.trim() === '')) {
          rating = 'No maintenance data';
        } else {
          const validationError = validateTrafficSign(row.installedDate, row.lastMaintainedDate);
          if (!validationError) {
            rating = TrafficSignService.getAssetRating(row.installedDate, row.lastMaintainedDate);
          } else {
            rating = `Validation Error: ${validationError}`;
          }
        }
      } else if (assetType === 'traffic signal') {
        if (!row.lastMaintainedDate || (typeof row.lastMaintainedDate === 'string' && row.lastMaintainedDate.trim() === '')) {
          rating = 'No maintenance data';
        } else {
          const validationError = validateTrafficSignal(row.installedDate, row.lastMaintainedDate);
          if (!validationError) {
            rating = TrafficSignalService.getAssetRating(row.installedDate, row.lastMaintainedDate);
          } else {
            rating = `Validation Error: ${validationError}`;
          }
        }
      } else if (assetType === 'pavement marking') {
        const rrIndex = parseNumber(row.rrIndex);
        if (rrIndex === null) {
          rating = 'Missing RR Index';
        } else if (!row.lastMaintainedDate || (typeof row.lastMaintainedDate === 'string' && row.lastMaintainedDate.trim() === '')) {
          rating = 'No maintenance data';
        } else {
          const validationError = validatePavementMarking(row.installedDate, row.lastMaintainedDate, rrIndex);
          if (!validationError) {
            rating = PavementMarkingService.getAssetRating(row.installedDate, row.lastMaintainedDate, rrIndex);
          } else {
            rating = `Validation Error: ${validationError}`;
          }
        }
      }

      processedAssets.push({
        ...row,
        rating: rating
      });
    }

    // Create output CSV file
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFileName = `rated_assets_${Date.now()}.csv`;
    const outputPath = path.join(outputDir, outputFileName);

    const csvWriter = createCsvWriter({
      path: outputPath,
      header: [
        { id: 'assetType', title: 'Asset Type' },
        { id: 'installedDate', title: 'Installation Date' },
        { id: 'lastMaintainedDate', title: 'Last Maintained Date' },
        { id: 'fciIndex', title: 'FCI Index' },
        { id: 'rrIndex', title: 'Retro-reflectivity Level' },
        { id: 'rating', title: 'Rating' },
        { id: 'lat', title: 'Latitude' },
        { id: 'lng', title: 'Longitude' }
      ]
    });

    await csvWriter.writeRecords(processedAssets);

    // Clean up uploaded file
    fs.unlinkSync(csvFilePath);

    // Return JSON response with processed data AND download link
    res.json({
      success: true,
      data: processedAssets,
      downloadUrl: `/api/assets/download/${path.basename(outputPath)}`,
      filename: outputFileName
    });

  } catch (error) {
    console.error('CSV processing error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Error processing CSV file', details: error.message });
  }
};