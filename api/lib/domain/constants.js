const settings = require('../settings');
module.exports = {
  MAX_REACHABLE_LEVEL: 5,
  PIX_COUNT_BY_LEVEL: 8,
  MINIMUM_DELAY_IN_DAYS_FOR_RESET: settings.features.dayBeforeCompetenceResetV2 || 7,
};
