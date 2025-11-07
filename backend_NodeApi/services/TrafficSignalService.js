const roadwayUtils = require('./RoadwayIlluminationService');

const getAssetRating = (installedDate, lastMaintainedDate) => {
  const age = roadwayUtils.getAssetAge(installedDate);
  const recentlyMaintained = roadwayUtils.wasRecentlyMaintained(lastMaintainedDate);

  if (age < 20) return "Good";

  if (age >= 20 && age < 30) {
    return recentlyMaintained ? "Good" : "Fair";
  }

  return recentlyMaintained ? "Fair" : "Poor";
};

module.exports = {
  getAssetRating,
};

