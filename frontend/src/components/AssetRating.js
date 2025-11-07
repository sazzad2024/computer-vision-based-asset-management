import React, { useState } from "react";
import { useAssetData } from "../context/AssetDataContext";
import "../css/AssetRating.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";
const ASSET_RATING_API_BASE = process.env.REACT_APP_ASSET_RATING_API_BASE || "http://localhost:3001";

const assetConfigs = {
  "roadway Illumination": {
    endpoint: `${ASSET_RATING_API_BASE}/api/assets/rate/roadway-illumination`,
    fields: [
      { name: "installedDate", type: "date", label: "Installation Date" },
      { name: "lastMaintainedDate", type: "date", label: "Last Maintained Date" },
    ],
  },
  "highway Building": {
    endpoint: `${ASSET_RATING_API_BASE}/api/assets/rate/highway-buildings`,
    fields: [
      { name: "installedDate", type: "date", label: "Installation Date" },
      { name: "fciIndex", type: "number", label: "FCI Index" },
    ],
  },
  "traffic Sign": {
    endpoint: `${ASSET_RATING_API_BASE}/api/assets/rate/traffic-signs`,
    fields: [
      { name: "installedDate", type: "date", label: "Installation Date" },
      { name: "lastMaintainedDate", type: "date", label: "Last Maintained Date" },
    ],
  },
  "traffic Signal": {
    endpoint: `${ASSET_RATING_API_BASE}/api/assets/rate/traffic-signals`,
    fields: [
      { name: "installedDate", type: "date", label: "Installation Date" },
      { name: "lastMaintainedDate", type: "date", label: "Last Maintained Date" },
    ],
  },
  "pavement Marking": {
    endpoint: `${ASSET_RATING_API_BASE}/api/assets/rate/pavement-markings`,
    fields: [
      { name: "installedDate", type: "date", label: "Installation Date" },
      { name: "lastMaintainedDate", type: "date", label: "Last Maintained Date" },
      { name: "rrIndex", type: "number", label: "Retro-reflectivity Level" },
    ],
  },
};

const imageAssetTypes = [
  { label: "Traffic Signal", value: "light" },
  { label: "Traffic Sign", value: "sign" },
  { label: "Roadway Illumination", value: "illumination" },
  { label: "Traffic Sign Damage", value: "sign_damage" },
  { label: "Traffic Signal Damage", value: "signal_damage" },
  { label: "Pavement Markings", value: "pavement" },
  { label: "Highway Building", value: "building" },
];

function AssetRating() {
  const { setCsvData } = useAssetData();
  const [selectedAsset, setSelectedAsset] = useState("roadway Illumination");
  const [imageAssetType, setImageAssetType] = useState("light");
  const [formData, setFormData] = useState({});
  const [rating, setRating] = useState("");
  const [image, setImage] = useState(null);
  const [processedImageURL, setProcessedImageURL] = useState("");
  const [detectedLabels, setDetectedLabels] = useState([]);
  const [activeForm, setActiveForm] = useState("historical");
  const [imageProcessing, setImageProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  
  // CSV upload states
  const [csvFile, setCsvFile] = useState(null);
  const [csvProcessing, setCsvProcessing] = useState(false);
  const [csvMessage, setCsvMessage] = useState("");
  const [csvDownloadUrl, setCsvDownloadUrl] = useState("");
  const [csvFileName, setCsvFileName] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validatedValue = e.target.type === "number" ? Math.max(0, value) : value;
    setFormData((prev) => ({ ...prev, [name]: validatedValue }));
  };

  const handleAssetChange = (e) => {
    setSelectedAsset(e.target.value);
    setFormData({});
    setRating("");
  };

  const handleImageAssetChange = (e) => {
    setImageAssetType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = assetConfigs[selectedAsset];
    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setRating(data.rating);
    } catch (error) {
      console.error("Error:", error);
      setRating("Error fetching rating");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    console.log("🔍 Debug: File selected:", file);
    console.log("🔍 Debug: File name:", file?.name);
    console.log("🔍 Debug: File type:", file?.type);
    console.log("🔍 Debug: File size:", file?.size);
    setImage(file);
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    console.log("🔍 Debug: Submitting image:", image);
    console.log("🔍 Debug: Image name:", image.name);
    console.log("🔍 Debug: Image type:", image.type);
    console.log("🔍 Debug: Image size:", image.size);

    setImageProcessing(true);
    setProcessingMessage("Uploading and processing image...");

    const formData = new FormData();
    formData.append("file", image);  // Backend expects "file", not "image"

    // Debug FormData
    console.log("🔍 Debug: FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    try {
      // Map the asset type to the correct backend endpoint
      let endpoint;
      if (imageAssetType === "light") {
        endpoint = `${API_BASE}/analyze/light`;
      } else if (imageAssetType === "sign") {
        endpoint = `${API_BASE}/analyze/sign`;
      } else if (imageAssetType === "illumination") {
        endpoint = `${API_BASE}/analyze/illumination`;
      } else if (imageAssetType === "sign_damage") {
        endpoint = `${API_BASE}/analyze/sign_damage`;
      } else if (imageAssetType === "signal_damage") {
        endpoint = `${API_BASE}/analyze/signal_damage`;
      } else if (imageAssetType === "pavement") {
        endpoint = `${API_BASE}/analyze/pavement`;
      } else {
        throw new Error(`Unsupported asset type: ${imageAssetType}`);
      }
      
      console.log("🔍 Debug: Calling endpoint:", endpoint);
      console.log("🔍 Debug: API_BASE:", API_BASE);
      
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        mode: 'cors',
      });
      
      console.log("🔍 Debug: Response status:", response.status);
      console.log("🔍 Debug: Response ok:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔍 Debug: Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("🔍 Debug: Response data:", data);

      // Handle the response from your backend
      let imagePath = data.image_url_absolute || data.image_url || "";
      
      // If the image path is relative, make it absolute
      if (imagePath && !imagePath.startsWith('http')) {
        imagePath = `${API_BASE}${imagePath}`;
      }
      
      console.log("🔍 Debug: Final image path:", imagePath);
      setProcessedImageURL(imagePath);

      setDetectedLabels(data.detections || []);
      setProcessingMessage("✅ Image processed successfully!");
    } catch (error) {
      console.error("❌ Image processing error:", error);
      setProcessingMessage(`❌ Error processing image: ${error.message}`);
    } finally {
      setImageProcessing(false);
    }
  };

  // CSV upload handlers
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setCsvMessage("");
    } else {
      setCsvMessage("Please select a valid CSV file");
      setCsvFile(null);
    }
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setCsvMessage("Please select a CSV file first");
      return;
    }

    setCsvProcessing(true);
    setCsvMessage("Processing CSV file...");

    const formData = new FormData();
    formData.append("csvFile", csvFile);

    try {
      const response = await fetch(`${ASSET_RATING_API_BASE}/api/assets/rate/csv`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        // Store processed data in global context for map display
        setCsvData(result.data);
        setCsvDownloadUrl(result.downloadUrl);
        setCsvFileName(result.filename);
        
        setCsvMessage("✅ CSV processed successfully! Go to Map to view assets.");
        setCsvFile(null);
      } else {
        let errorMessage = 'Failed to process CSV';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error("Error response:", errorData);
        } catch (parseError) {
          const textError = await response.text();
          errorMessage = `HTTP ${response.status}: ${textError}`;
          console.error("Error text:", textError);
        }
        setCsvMessage(`❌ Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("CSV processing error:", error);
      setCsvMessage(`❌ Error processing CSV file: ${error.message}`);
    } finally {
      setCsvProcessing(false);
    }
  };

  const config = assetConfigs[selectedAsset];

  return (
    <div className="page-container">
      <header className="banner-header">
        <h1>Asset Detection and Rating</h1>
        <p>Assess the condition of infrastructure assets using forms and images.</p>
      </header>

      <div className="content-wrapper-horizontal">
        {/* Left Panel - Image Detection */}
        <div className="left-panel">
          <h2>Image-based Asset Detection</h2>
          <label><b>Select Asset Type:</b></label>
          <select
            value={imageAssetType}
            onChange={handleImageAssetChange}
            style={{ width: "100%", marginBottom: "1rem" }}
          >
            {imageAssetTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <form onSubmit={handleImageSubmit}>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
              <button type="submit" className="btn-submit" disabled={imageProcessing}>
                {imageProcessing ? "Processing..." : "Upload"}
              </button>
            </div>
          </form>

          {imageProcessing && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <div className="processing-status">
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  gap: "0.5rem"
                }}>
                  <div className="spinner"></div>
                  <span style={{ fontWeight: "bold", color: "#1976d2" }}>
                    {processingMessage}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Processing Complete Message */}
          {!imageProcessing && processingMessage && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <div className={`processing-complete ${processingMessage.includes("❌") ? "processing-error" : "processing-success"}`}>
                {processingMessage}
              </div>
            </div>
          )}

          {processedImageURL && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <p><b>Processed Image:</b></p>
              <img src={processedImageURL} alt="Processed" style={{ maxWidth: "100%", borderRadius: "8px" }} />

              {detectedLabels.length > 0 && (
                <div style={{ marginTop: "1rem", textAlign: "left" }}>
                  <h4>Detected Signs:</h4>
                  <ul>
                    {detectedLabels.map((item, index) => (
                      <li key={index}>
                        {item.label} ({(item.confidence * 100).toFixed(1)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Historical / Image Condition */}
        <div className="right-panel">
          <div className="segmented-switch">
            <button
              className={activeForm === "historical" ? "seg-btn active" : "seg-btn"}
              onClick={() => setActiveForm("historical")}
            >
              Historical Data
            </button>
            <button
              className={activeForm === "imagecondition" ? "seg-btn active" : "seg-btn"}
              onClick={() => setActiveForm("imagecondition")}
            >
              Image Condition
            </button>
            <button
              className={activeForm === "csvupload" ? "seg-btn active" : "seg-btn"}
              onClick={() => setActiveForm("csvupload")}
            >
              CSV Upload
            </button>
            <div className={`seg-highlight ${activeForm}`}></div>
          </div>

          <div className="animated-form">
            {activeForm === "historical" ? (
              <div className="card-container fade-in">
                <h2>Historical Data Based Rating</h2>
                <form onSubmit={handleSubmit}>
                  <label><b>Select Asset Type:</b></label>
                  <select value={selectedAsset} onChange={handleAssetChange}>
                    {Object.keys(assetConfigs).map((key) => (
                      <option value={key} key={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </option>
                    ))}
                  </select>
                  {config.fields.map((field) => (
                    <div key={field.name} style={{ marginBottom: "1rem" }}>
                      <label><b>{field.label}:</b></label><br />
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
                        required
                        min={field.type === "number" ? 0 : undefined}
                      />
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                    <button type="submit" className="btn-submit">Get Rating</button>
                  </div>
                </form>
                {rating && (
                  <div style={{ marginTop: "1rem", fontWeight: "bold", color: "green", textAlign: "center" }}>
                    Rating: {rating}
                  </div>
                )}
              </div>
            ) : activeForm === "imagecondition" ? (
              <div className="card-container fade-in">
                <h2>Image-based Condition Rating</h2>
              </div>
            ) : (
              <div className="card-container fade-in">
                <h2>Bulk CSV Asset Rating</h2>
                <div style={{ 
                  marginBottom: "1.5rem", 
                  padding: "1.5rem", 
                  backgroundColor: "#f8f9fa", 
                  borderRadius: "8px",
                  border: "1px solid #dee2e6"
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: "1rem", color: "#495057" }}>📋 CSV Format Requirements</h4>
                  
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "auto 1fr", 
                    gap: "0.5rem 1rem",
                    marginBottom: "1rem",
                    fontSize: "0.95rem"
                  }}>
                    <div style={{ fontWeight: "bold", color: "#6c757d" }}>assetType:</div>
                    <div>roadway illumination | highway building | traffic sign | traffic signal | pavement marking</div>
                    
                    <div style={{ fontWeight: "bold", color: "#6c757d" }}>installedDate:</div>
                    <div>Required (YYYY-MM-DD format)</div>
                    
                    <div style={{ fontWeight: "bold", color: "#6c757d" }}>lastMaintainedDate:</div>
                    <div>Optional (YYYY-MM-DD format)</div>
                    
                    <div style={{ fontWeight: "bold", color: "#6c757d" }}>fciIndex:</div>
                    <div>Required for highway building only</div>
                    
                    <div style={{ fontWeight: "bold", color: "#6c757d" }}>rrIndex:</div>
                    <div>Required for pavement marking only</div>
                    
                    <div style={{ fontWeight: "bold", color: "#6c757d" }}>lat:</div>
                    <div>Required for map display (decimal format)</div>
                    
                    <div style={{ fontWeight: "bold", color: "#6c757d" }}>lng:</div>
                    <div>Required for map display (decimal format)</div>
                  </div>
                  
                  <div style={{ marginTop: "1.5rem" }}>
                    <strong style={{ display: "block", marginBottom: "0.5rem" }}>Example CSV:</strong>
                    <pre style={{ 
                      backgroundColor: "#e9ecef", 
                      padding: "1rem", 
                      borderRadius: "4px", 
                      fontSize: "0.85rem",
                      overflowX: "auto",
                      border: "1px solid #ced4da",
                      margin: 0
                    }}>
{`assetType,installedDate,lastMaintainedDate,fciIndex,rrIndex,lat,lng
traffic signal,2015-03-20,2023-09-15,,,29.7604,-95.3698
traffic sign,2018-07-10,2022-11-20,,,29.7571,-95.3665
pavement marking,2019-01-15,2023-06-10,,75,29.7632,-95.3721
roadway illumination,2020-05-12,2023-12-05,,,29.7655,-95.3642
highway building,2005-08-30,,8,,29.7624,-95.3681`}
                    </pre>
                  </div>
                </div>
                
                <form onSubmit={handleCsvSubmit}>
                  <div style={{ marginBottom: "1rem" }}>
                    <label><b>Select CSV File:</b></label><br />
                    <input 
                      type="file" 
                      accept=".csv,text/csv" 
                      onChange={handleCsvUpload}
                      style={{ marginTop: "0.5rem" }}
                    />
                  </div>
                  
                  {csvFile && (
                    <div style={{ marginBottom: "1rem", padding: "0.5rem", backgroundColor: "#d4edda", borderRadius: "4px" }}>
                      ✅ Selected: {csvFile.name}
                    </div>
                  )}
                  
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                    <button 
                      type="submit" 
                      className="btn-submit"
                      disabled={!csvFile || csvProcessing}
                    >
                      {csvProcessing ? "Processing..." : "Process CSV"}
                    </button>
                  </div>
                </form>
                
                {csvMessage && (
                  <div style={{ 
                    marginTop: "1rem", 
                    padding: "0.5rem", 
                    borderRadius: "4px",
                    backgroundColor: csvMessage.includes("✅") ? "#d4edda" : "#f8d7da",
                    color: csvMessage.includes("✅") ? "#155724" : "#721c24"
                  }}>
                    {csvMessage}
                  </div>
                )}
                
                {csvDownloadUrl && (
                  <div style={{ marginTop: "1rem" }}>
                    <button 
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = `${ASSET_RATING_API_BASE}${csvDownloadUrl}`;
                        a.download = csvFileName;
                        a.click();
                      }}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      📥 Download Processed CSV
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetRating;
