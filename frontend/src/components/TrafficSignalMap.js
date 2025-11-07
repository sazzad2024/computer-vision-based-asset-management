import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css";
import { useAssetData } from "../context/AssetDataContext";
import trafficSignalIconPath from "../logo/rec.png";
import trafficSignIconPath from "../logo/road-sign.png";
import pavementMarkingIconPath from "../logo/sidewalk.png";
import illuminationIconPath from "../assets/icon/illumination.svg";
import buildingIconPath from "../assets/icon/building.svg";
import trafficSignalsData from "../data/traffic-signals.json";
import trafficSignsData from "../data/traffic-signs.json";
import pavementMarkingsData from "../data/pavement-markings.json";
import roadwayIlluminationData from "../data/roadway-illumination.json";
import highwayBuildingsData from "../data/highway-buildings.json";


const trafficSignalIcon = new L.Icon({
  iconUrl: trafficSignalIconPath,
  iconSize: [20, 20],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const trafficSignIcon = new L.Icon({
  iconUrl: trafficSignIconPath,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const pavementMarkingIcon = new L.Icon({
  iconUrl: pavementMarkingIconPath,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const illuminationIcon = new L.Icon({
  iconUrl: illuminationIconPath,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const buildingIcon = new L.Icon({
  iconUrl: buildingIconPath,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const trafficSignals = trafficSignalsData;
const trafficSigns = trafficSignsData;
const pavementMarkings = pavementMarkingsData;
const roadwayIllumination = roadwayIlluminationData;
const highwayBuildings = highwayBuildingsData;

function FocusMap({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);

  return null;
}

function TrafficSignalMap() {
  const { csvData } = useAssetData();
  const [showTrafficSignals, setShowTrafficSignals] = useState(false);
  const [showTrafficSigns, setShowTrafficSigns] = useState(false);
  const [showPavementMarkings, setShowPavementMarkings] = useState(false);
  const [showRoadwayIllumination, setShowRoadwayIllumination] = useState(false);
  const [showHighwayBuildings, setShowHighwayBuildings] = useState(false);
  const [showCsvAssets, setShowCsvAssets] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [activeLayer, setActiveLayer] = useState("street");
  
  // Filter CSV data by asset type
  const csvTrafficSignals = csvData.filter(item => item.assetType && item.assetType.toLowerCase() === 'traffic signal').map(item => ({ lat: parseFloat(item.lat), lng: parseFloat(item.lng), condition: item.rating, location: item.location || 'Unknown' }));
  const csvTrafficSigns = csvData.filter(item => item.assetType && item.assetType.toLowerCase() === 'traffic sign').map(item => ({ lat: parseFloat(item.lat), lng: parseFloat(item.lng), condition: item.rating, location: item.location || 'Unknown' }));
  const csvPavementMarkings = csvData.filter(item => item.assetType && item.assetType.toLowerCase() === 'pavement marking').map(item => ({ lat: parseFloat(item.lat), lng: parseFloat(item.lng), condition: item.rating, location: item.location || 'Unknown' }));
  const csvRoadwayIllumination = csvData.filter(item => item.assetType && item.assetType.toLowerCase() === 'roadway illumination').map(item => ({ lat: parseFloat(item.lat), lng: parseFloat(item.lng), condition: item.rating, location: item.location || 'Unknown' }));
  const csvHighwayBuildings = csvData.filter(item => item.assetType && item.assetType.toLowerCase() === 'highway building').map(item => ({ lat: parseFloat(item.lat), lng: parseFloat(item.lng), condition: item.rating, location: item.location || 'Unknown' }));

  const getStatistics = () => {
    if (showTrafficSignals) {
      return { type: "Bridges", data: trafficSignals, columns: ["Age"] };
    }
    if (showTrafficSigns) {
      return { type: "Traffic Signs", data: trafficSigns, columns: ["Type"] };
    }
    if (showPavementMarkings) {
      return { type: "Pavement Markings", data: pavementMarkings, columns: ["Type"] };
    }
    if (showRoadwayIllumination) {
      return { type: "Roadway Illumination", data: roadwayIllumination, columns: ["Type"] };
    }
    if (showHighwayBuildings) {
      return { type: "Highway Buildings", data: highwayBuildings, columns: ["Type"] };
    }
    return null;
  };

  const statistics = getStatistics();

  const getActivePositions = () => {
    if (showCsvAssets) {
      return csvData.filter(item => item.lat && item.lng).map(item => [parseFloat(item.lat), parseFloat(item.lng)]);
    }
    if (showTrafficSignals) return trafficSignals.map((signal) => [signal.lat, signal.lng]);
    if (showTrafficSigns) return trafficSigns.map((sign) => [sign.lat, sign.lng]);
    if (showPavementMarkings) return pavementMarkings.map((marking) => [marking.lat, marking.lng]);
    if (showRoadwayIllumination) return roadwayIllumination.map((item) => [item.lat, item.lng]);
    if (showHighwayBuildings) return highwayBuildings.map((item) => [item.lat, item.lng]);
    return [];
  };

  const activePositions = getActivePositions();

  return (
    <div className="traffic-signal-map">
      {/* Filters */}
      <header className="innovative-header">
        <h1>Asset Tracker</h1>
        <p>Locating all traffic assets.</p>
      </header>
      <div className="filters">
        <label>
          <input
            type="checkbox"
            checked={showTrafficSignals}
            onChange={() => {
              setShowTrafficSignals(!showTrafficSignals);
              setShowTrafficSigns(false);
              setShowPavementMarkings(false);
            }}
          />
          Bridges
        </label>
        <label>
          <input
            type="checkbox"
            checked={showTrafficSigns}
            onChange={() => {
              setShowTrafficSigns(!showTrafficSigns);
              setShowTrafficSignals(false);
              setShowPavementMarkings(false);
            }}
          />
          Traffic Signs
        </label>
        <label>
          <input
            type="checkbox"
            checked={showPavementMarkings}
            onChange={() => {
              setShowPavementMarkings(!showPavementMarkings);
              setShowTrafficSignals(false);
              setShowTrafficSigns(false);
              setShowRoadwayIllumination(false);
              setShowHighwayBuildings(false);
              setShowCsvAssets(false);
            }}
          />
          Pavement Markings
        </label>
        <label>
          <input
            type="checkbox"
            checked={showRoadwayIllumination}
            onChange={() => {
              setShowRoadwayIllumination(!showRoadwayIllumination);
              setShowTrafficSignals(false);
              setShowTrafficSigns(false);
              setShowPavementMarkings(false);
              setShowHighwayBuildings(false);
              setShowCsvAssets(false);
            }}
          />
          Roadway Illumination
        </label>
        <label>
          <input
            type="checkbox"
            checked={showHighwayBuildings}
            onChange={() => {
              setShowHighwayBuildings(!showHighwayBuildings);
              setShowTrafficSignals(false);
              setShowTrafficSigns(false);
              setShowPavementMarkings(false);
              setShowRoadwayIllumination(false);
              setShowCsvAssets(false);
            }}
          />
          Highway Buildings
        </label>
        {csvData.length > 0 && (
          <label>
            <input
              type="checkbox"
              checked={showCsvAssets}
              onChange={() => {
                setShowCsvAssets(!showCsvAssets);
                setShowTrafficSignals(false);
                setShowTrafficSigns(false);
                setShowPavementMarkings(false);
              }}
            />
            📊 Your CSV Assets ({csvData.length})
          </label>
        )}
        <select value={activeLayer} onChange={(e) => setActiveLayer(e.target.value)}>
          <option value="street">Street View</option>
          <option value="satellite">Satellite View</option>
          <option value="topographic">Topographic View</option>
        </select>
      </div>

      {/* Collapsible Statistics */}
      <div className="statistics-wrapper">
        <button
          onClick={() => setShowStatistics(!showStatistics)}
          style={{
            margin: "10px",
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {showStatistics ? "Hide Statistics" : "Show Statistics"}
        </button>
        {showStatistics && statistics && (
          <div className="statistics-table">
            <h4>{statistics.type} Statistics</h4>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Location</th>
                  <th>Condition</th>
                  {statistics.columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statistics.data.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.location}</td>
                    <td>{item.condition}</td>
                    {statistics.columns.map((col) => (
                      <td key={col}>{item[col.toLowerCase()]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="map-wrapper">
        <MapContainer
          center={[29.7604, -95.3698]}
          zoom={12}
          style={{ height: "600px", width: "90%", margin: "0 auto" ,paddingBottom: "5vh"}}
          attributionControl={false}
        >
          <TileLayer
            url={
              activeLayer === "street"
                ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                : activeLayer === "satellite"
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                : "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            }
          />
          <FocusMap positions={activePositions} />
          {showTrafficSignals &&
            trafficSignals.map((signal, index) => (
              <Marker
                key={`signal-${index}`}
                position={[signal.lat, signal.lng]}
                icon={trafficSignalIcon}
              >
                <Popup>
                  Condition: {signal.condition}
                  <br />
                  Traffic: {signal.traffic} vehicles/day
                </Popup>
              </Marker>
            ))}
          {showTrafficSigns &&
            trafficSigns.map((sign, index) => (
              <Marker
                key={`sign-${index}`}
                position={[sign.lat, sign.lng]}
                icon={trafficSignIcon}
              >
                <Popup>
                  <b>{sign.location}</b>
                  <br />
                  Condition: {sign.condition}
                  <br />
                  Type: {sign.type}
                </Popup>
              </Marker>
            ))}
          {showPavementMarkings &&
            pavementMarkings.map((marking, index) => (
              <Marker
                key={`marking-${index}`}
                position={[marking.lat, marking.lng]}
                icon={pavementMarkingIcon}
              >
                <Popup>
                  <b>{marking.location}</b>
                  <br />
                  Condition: {marking.condition}
                  <br />
                  Type: {marking.type}
                </Popup>
              </Marker>
            ))}
          {showRoadwayIllumination &&
            roadwayIllumination.map((item, index) => (
              <Marker
                key={`illumination-${index}`}
                position={[item.lat, item.lng]}
                icon={illuminationIcon}
              >
                <Popup>
                  <b>{item.location}</b>
                  <br />
                  Condition: {item.condition}
                  <br />
                  Type: {item.type}
                </Popup>
              </Marker>
            ))}
          {showHighwayBuildings &&
            highwayBuildings.map((item, index) => (
              <Marker
                key={`building-${index}`}
                position={[item.lat, item.lng]}
                icon={buildingIcon}
              >
                <Popup>
                  <b>{item.location}</b>
                  <br />
                  Condition: {item.condition}
                  <br />
                  Type: {item.type}
                </Popup>
              </Marker>
            ))}
          {showCsvAssets &&
            csvData.filter(item => item.lat && item.lng).map((asset, index) => (
              <Marker
                key={`csv-${index}`}
                position={[parseFloat(asset.lat), parseFloat(asset.lng)]}
                icon={
                  asset.assetType && asset.assetType.toLowerCase() === 'traffic signal' ? trafficSignalIcon :
                  asset.assetType && asset.assetType.toLowerCase() === 'traffic sign' ? trafficSignIcon :
                  asset.assetType && asset.assetType.toLowerCase() === 'roadway illumination' ? illuminationIcon :
                  asset.assetType && asset.assetType.toLowerCase() === 'highway building' ? buildingIcon :
                  pavementMarkingIcon
                }
              >
                <Popup>
                  <b>Asset Type: {asset.assetType}</b>
                  <br />
                  Rating: {asset.rating}
                  <br />
                  Installed: {asset.installedDate}
                  <br />
                  Last Maintained: {asset.lastMaintainedDate || 'N/A'}
                  {asset.fciIndex && <><br />FCI Index: {asset.fciIndex}</>}
                  {asset.rrIndex && <><br />RR Index: {asset.rrIndex}</>}
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default TrafficSignalMap;
