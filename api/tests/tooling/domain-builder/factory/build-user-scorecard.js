const buildArea = require('./build-area');

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
  status = 'STARTED',
  // relationships
  area = buildArea(),
  tutorials = [],
} = {}) {

  return {
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
    // relationships
    area,
    tutorials,
  };
};
