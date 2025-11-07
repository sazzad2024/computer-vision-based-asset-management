const express = require('express');
const router = express.Router();
const multer = require('multer');
const assetController = require('../controllers/assetController');

// Configure CSV file upload
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const uploadCSV = multer({ 
  storage: csvStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

router.post('/rate/roadway-illumination', assetController.rateRoadwayAsset);
router.post('/rate/highway-buildings', assetController.rateHigwayBuilding);
router.post('/rate/traffic-signs', assetController.rateTrafficSign);
router.post('/rate/traffic-signals', assetController.rateTrafficSignal);
router.post('/rate/pavement-markings', assetController.ratePavementMarking);
router.post('/rate/csv', uploadCSV.single('csvFile'), assetController.rateAssetsFromCSV);

module.exports = router;
