exports.validateRoadwayAssetInput = (installedDate, lastMaintainedDate) => {
    if (!Date.parse(installedDate)) {
      return "installedDate must be a valid date string (YYYY-MM-DD)";
    }
  
    if (!Date.parse(lastMaintainedDate)) {
      return "lastMaintainedDate must be a valid date string (YYYY-MM-DD)";
    }
  
    return null;
  };

  exports.validateHighwayBuilding  = (installedDate, fciIndex) => {
    if (!Date.parse(installedDate)) {
      return "installedDate must be a valid date string (YYYY-MM-DD)";
    }
  
    if (typeof fciIndex!=="number") {
      return "fciIndex must be a number";
    }
  
    return null;
  };

exports.validateTrafficSign = (installedDate, lastMaintainedDate) => {
  if (!Date.parse(installedDate)) {
    return "installedDate must be a valid date string (YYYY-MM-DD)";
  }

  if (!Date.parse(lastMaintainedDate)) {
    return "lastMaintainedDate must be a valid date string (YYYY-MM-DD)";
  }

  return null;
};

exports.validateTrafficSignal = (installedDate, lastMaintainedDate) => {
  if (!Date.parse(installedDate)) {
    return "installedDate must be a valid date string (YYYY-MM-DD)";
  }

  if (!Date.parse(lastMaintainedDate)) {
    return "lastMaintainedDate must be a valid date string (YYYY-MM-DD)";
  }

  return null;
};

exports.validatePavementMarking = (installedDate, lastMaintainedDate, rrIndex) => {
  if (!Date.parse(installedDate)) {
    return "installedDate must be a valid date string (YYYY-MM-DD)";
  }

  if (!Date.parse(lastMaintainedDate)) {
    return "lastMaintainedDate must be a valid date string (YYYY-MM-DD)";
  }

  if (typeof rrIndex !== "number" || rrIndex < 0) {
    return "rrIndex must be a positive number";
  }

  return null;
};
  