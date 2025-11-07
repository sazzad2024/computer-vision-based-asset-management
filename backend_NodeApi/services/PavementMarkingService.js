const roadwayUtils = require('./RoadwayIlluminationService');

const getAssetRating = (installedDate, lastMaintainedDate, rrIndex) => {
  const age = roadwayUtils.getAssetAge(installedDate);
  const recentlyMaintained = roadwayUtils.wasRecentlyMaintained(lastMaintainedDate);

  // Check retro-reflectivity level
  const hasGoodReflectivity = rrIndex >= 100; // Good retro-reflectivity threshold
  const hasFairReflectivity = rrIndex >= 50;  // Fair retro-reflectivity threshold

  if (age < 5) {
    return hasGoodReflectivity ? "Good" : hasFairReflectivity ? "Fair" : "Poor";
  }

  if (age >= 5 && age < 10) {
    if (recentlyMaintained) {
      return hasGoodReflectivity ? "Good" : hasFairReflectivity ? "Fair" : "Poor";
    } else {
      return hasFairReflectivity ? "Fair" : "Poor";
    }
  }

  return recentlyMaintained ? "Fair" : "Poor";
};

module.exports = {
  getAssetRating,
};

