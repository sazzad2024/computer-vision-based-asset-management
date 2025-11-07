import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { AssetDataProvider } from "./context/AssetDataContext";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import TrafficSignalMap from "./components/TrafficSignalMap";
import Analytics from "./components/AnalyticsPage";
import AssetRating from "./components/AssetRating";

function App() {
  return (
    <AssetDataProvider>
      <Router>
         <Navbar/> {/* Navbar is now fixed and displayed on all pages */}
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/map" component={TrafficSignalMap} />
          <Route path="/rating" component={AssetRating}/>
          <Route exact path="/analytics" component={Analytics} />
        </Switch>
      </Router>
    </AssetDataProvider>
  );
}

export default App;
