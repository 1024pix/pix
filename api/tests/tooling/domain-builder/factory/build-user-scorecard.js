const buildArea = require('./build-area');
const Scorecard = require('../../../../lib/domain/models/Scorecard');

module.exports = function buildUserScorecard({
  id = 'recCOMP123_789',
  // attributes
  name = 'Mener une troupe à la bataille',
  description = 'description',
  index = '2.3',
  competenceId = 'recCOMP123',
  earnedPix = 45,
  exactlyEarnedPix = null,
  level = 6,
  pixScoreAheadOfNextLevel = 3,
  status = Scorecard.statuses.STARTED,
  remainingDaysBeforeImproving = 2,
  remainingDaysBeforeReset = 2,
  // relationships
  area = buildArea(),
  tutorials = [],
} = {}) {
  return new Scorecard({
    id,
    // attributes
    name,
    description,
    index,
    competenceId,
    earnedPix,
    exactlyEarnedPix: exactlyEarnedPix || earnedPix,
    level,
    pixScoreAheadOfNextLevel,
    status,
    remainingDaysBeforeImproving,
    remainingDaysBeforeReset,
    // relationships
    area,
    tutorials,
  });
};
