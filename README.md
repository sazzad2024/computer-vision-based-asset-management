# TX-DOT Asset Management System

A comprehensive asset management system for Texas Department of Transportation (TX-DOT) that provides AI-powered asset detection, condition assessment, and rating capabilities.

## 🚀 Live Demo

- **Frontend**: https://frontend-778751737181.us-central1.run.app
- **Detection API**: https://txdot-detection-778751737181.us-central1.run.app
- **Asset Rating API**: https://txdot-asset-rating-api-778751737181.us-central1.run.app

## 🏗️ Architecture

This project consists of three main components:

### 1. Frontend (React.js)
- **Location**: `frontend/`
- **Technology**: React.js with modern UI components
- **Features**:
  - Asset type selection and form handling
  - Image upload for AI detection
  - CSV bulk processing
  - Real-time results display

### 2. Detection Backend (FastAPI)
- **Location**: `backend_FastApi/`
- **Technology**: Python FastAPI with YOLOv8 and custom CNN models
- **Features**:
  - Traffic signal detection
  - Traffic sign detection
  - Roadway illumination detection
  - Traffic sign damage assessment
  - Traffic signal damage assessment
  - Pavement marking condition classification

### 3. Asset Rating Backend (Node.js)
- **Location**: `backend_NodeApi/`
- **Technology**: Node.js with Express
- **Features**:
  - Asset condition rating algorithms
  - CSV bulk processing
  - Data validation and processing

## 🤖 AI Models

The system integrates multiple AI models for comprehensive asset analysis:

| Asset Type | Model Type | Purpose | File |
|------------|------------|---------|------|
| Traffic Signals | YOLOv8 | Detection | `best_light.pt` |
| Traffic Signs | YOLOv8 | Detection | `sign_best.pt` |
| Roadway Illumination | YOLOv8 | Detection | `illumination_best.pt` |
| Traffic Sign Damage | YOLOv8 | Damage Assessment | `sign_damage_best.pt` |
| Traffic Signal Damage | YOLOv8 | Damage Assessment | `signal_damage_best.pt` |
| Pavement Markings | Custom CNN | Condition Classification | `fastcnn_epoch_90.pth` |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Docker
- Google Cloud SDK (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/sazzad2024/TX-DOT-Asset-Management.git
   cd TX-DOT-Asset-Management
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Detection API Setup**
   ```bash
   cd backend_FastApi
   pip install -r requirements.txt
   python model_api.py
   ```

4. **Asset Rating API Setup**
   ```bash
   cd backend_NodeApi
   npm install
   npm start
   ```

## 📊 Features

### Image-Based Asset Detection
- Upload images for real-time AI analysis
- Support for 6 different asset types
- Visual bounding box annotations
- Confidence scoring and detection results

### Asset Rating System
- Condition assessment based on installation and maintenance dates
- Support for multiple asset types with specific rating criteria
- Bulk processing via CSV upload
- Exportable results with ratings

### Asset Types Supported
1. **Roadway Illumination** - Street lighting assessment
2. **Highway Buildings** - Infrastructure condition rating
3. **Traffic Signs** - Sign condition and maintenance status
4. **Traffic Signals** - Signal functionality and condition
5. **Pavement Markings** - Marking visibility and retro-reflectivity

## 🛠️ API Endpoints

### Detection API (FastAPI)
- `POST /analyze/light` - Traffic signal detection
- `POST /analyze/sign` - Traffic sign detection
- `POST /analyze/illumination` - Roadway illumination detection
- `POST /analyze/sign_damage` - Traffic sign damage assessment
- `POST /analyze/signal_damage` - Traffic signal damage assessment
- `POST /analyze/pavement` - Pavement marking classification

### Asset Rating API (Node.js)
- `POST /api/assets/rate/roadway-illumination` - Rate roadway illumination
- `POST /api/assets/rate/highway-buildings` - Rate highway buildings
- `POST /api/assets/rate/traffic-signs` - Rate traffic signs
- `POST /api/assets/rate/traffic-signals` - Rate traffic signals
- `POST /api/assets/rate/pavement-markings` - Rate pavement markings
- `POST /api/assets/rate/csv` - Bulk CSV processing

## 🚀 Deployment

The system is deployed on Google Cloud Platform using Cloud Run:

### Frontend Deployment
```bash
cd frontend
./deploy_frontend.sh
```

### Detection API Deployment
```bash
cd backend_FastApi
./deploy_cloud_build.sh
```

### Asset Rating API Deployment
```bash
cd backend_NodeApi
./deploy_cloud_build.sh
```

## 📁 Project Structure

```
TX-DOT-Asset-Management/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   └── css/            # Stylesheets
│   ├── public/             # Static assets
│   └── Dockerfile          # Frontend container
├── backend_FastApi/        # Python detection API
│   ├── detectors/          # AI model detection modules
│   ├── output/             # Generated detection images
│   ├── model_api.py        # Main FastAPI application
│   └── Dockerfile          # Detection API container
├── backend_NodeApi/        # Node.js rating API
│   ├── controllers/        # API controllers
│   ├── services/           # Business logic services
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── Dockerfile          # Rating API container
└── sample_assets.csv       # Sample data for testing
```

## 🔧 Configuration

### Environment Variables

#### Detection API
- `TRAFFIC_LIGHT_CONF` - Traffic light detection confidence threshold
- `TRAFFIC_LIGHT_IOU` - Traffic light detection IoU threshold
- `SIGN_CONF` - Traffic sign detection confidence threshold
- `SIGN_IOU` - Traffic sign detection IoU threshold
- `ILLUMINATION_CONF` - Illumination detection confidence threshold
- `ILLUMINATION_IOU` - Illumination detection IoU threshold
- `SIGN_DAMAGE_CONF` - Sign damage detection confidence threshold
- `SIGN_DAMAGE_IOU` - Sign damage detection IoU threshold
- `SIGNAL_DAMAGE_CONF` - Signal damage detection confidence threshold
- `SIGNAL_DAMAGE_IOU` - Signal damage detection IoU threshold
- `PAVEMENT_CONF` - Pavement marking classification confidence threshold

#### Model URIs
- `TRAFFIC_LIGHT_MODEL_URI` - Traffic light model location
- `SIGN_BEST_PT_URI` - Traffic sign model location
- `ILLUMINATION_MODEL_URI` - Illumination model location
- `SIGN_DAMAGE_MODEL_URI` - Sign damage model location
- `SIGNAL_DAMAGE_MODEL_URI` - Signal damage model location
- `PAVEMENT_MODEL_URI` - Pavement marking model location

## 📈 Performance

- **Detection Speed**: ~2-5 seconds per image
- **Accuracy**: 85-95% depending on asset type
- **Scalability**: Auto-scaling Cloud Run services
- **Concurrent Users**: Supports 100+ concurrent requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: Sazzad Hossain
- **AI/ML Engineer**: Model integration and optimization
- **Full-Stack Developer**: Frontend and backend development

## 📞 Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

## 🔮 Future Enhancements

- [ ] Real-time video processing
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with TX-DOT databases
- [ ] Automated maintenance scheduling
- [ ] Predictive maintenance algorithms

---

**Built with ❤️ for Texas Department of Transportation**
