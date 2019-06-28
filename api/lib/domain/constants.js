const settings = require('../settings');
module.exports = {
  MAX_REACHABLE_LEVEL: 5,
  PIX_COUNT_BY_LEVEL: 8,
  MINIMUM_DELAY_IN_DAYS_FOR_RESET: settings.features.dayBeforeCompetenceResetV2 || 7,

  MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_CERTIFIED: 50,
  MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED: 80,
  UNCERTIFIED_LEVEL: -1,
};
